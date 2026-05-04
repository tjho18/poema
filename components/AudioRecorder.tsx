'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { attachAudio } from '@/app/actions/poems'

interface Props {
  poemId: string
  onDone: () => void
}

type Stage = 'idle' | 'recording' | 'review' | 'uploading' | 'done'

const MAX_SECONDS = 60

export default function AudioRecorder({ poemId, onDone }: Props) {
  const [stage,     setStage    ] = useState<Stage>('idle')
  const [elapsed,   setElapsed  ] = useState(0)
  const [error,     setError    ] = useState<string | null>(null)

  const canvasRef       = useRef<HTMLCanvasElement>(null)
  const mediaRecorder   = useRef<MediaRecorder | null>(null)
  const audioCtx        = useRef<AudioContext | null>(null)
  const analyser        = useRef<AnalyserNode | null>(null)
  const animFrame       = useRef<number>(0)
  const chunks          = useRef<Blob[]>([])
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioBlobRef    = useRef<Blob | null>(null)
  const audioPlayerRef  = useRef<HTMLAudioElement | null>(null)
  const streamRef       = useRef<MediaStream | null>(null)

  // ── Waveform drawing ──────────────────────────────────────────────────────
  const drawWaveform = useCallback((recording: boolean) => {
    const canvas = canvasRef.current
    const an = analyser.current
    if (!canvas || !an) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const bufLen = an.frequencyBinCount
    const data = new Uint8Array(bufLen)
    an.getByteFrequencyData(data)

    ctx.clearRect(0, 0, W, H)

    const barCount = 48
    const barW = 3
    const gap = (W - barCount * barW) / (barCount + 1)

    for (let i = 0; i < barCount; i++) {
      const idx = Math.floor((i / barCount) * bufLen)
      const value = data[idx] / 255
      const barH = Math.max(3, value * H * 0.8)
      const x = gap + i * (barW + gap)
      const y = (H - barH) / 2

      ctx.fillStyle = recording
        ? `rgba(185,122,85,${0.4 + value * 0.6})`
        : `rgba(168,159,140,${0.3 + value * 0.4})`
      ctx.beginPath()
      ctx.roundRect(x, y, barW, barH, 1.5)
      ctx.fill()
    }

    animFrame.current = requestAnimationFrame(() => drawWaveform(recording))
  }, [])

  function stopAnimation() {
    if (animFrame.current) cancelAnimationFrame(animFrame.current)
  }

  // ── Start recording ───────────────────────────────────────────────────────
  async function startRecording() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      audioCtx.current  = new AudioContext()
      analyser.current  = audioCtx.current.createAnalyser()
      analyser.current.fftSize = 128

      const src = audioCtx.current.createMediaStreamSource(stream)
      src.connect(analyser.current)

      chunks.current = []
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      mr.ondataavailable = e => { if (e.data.size > 0) chunks.current.push(e.data) }
      mr.onstop = () => {
        audioBlobRef.current = new Blob(chunks.current, { type: 'audio/webm' })
        setStage('review')
        stopAnimation()
        // Start playback-ready analyser for review waveform
        const reviewAudio = new Audio(URL.createObjectURL(audioBlobRef.current!))
        audioPlayerRef.current = reviewAudio
        reviewAudio.addEventListener('play', () => {
          const rCtx = new AudioContext()
          const rAnalyser = rCtx.createAnalyser()
          rAnalyser.fftSize = 128
          const src2 = rCtx.createMediaElementSource(reviewAudio)
          src2.connect(rAnalyser)
          src2.connect(rCtx.destination)
          analyser.current = rAnalyser
          drawWaveform(false)
        })
      }

      mediaRecorder.current = mr
      mr.start(100)
      setStage('recording')
      setElapsed(0)
      drawWaveform(true)

      // Timer + auto-stop at MAX_SECONDS
      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev + 1 >= MAX_SECONDS) {
            stopRecording()
            return MAX_SECONDS
          }
          return prev + 1
        })
      }, 1000)
    } catch (err) {
      setError('Microphone access denied. Please allow access in your device settings.')
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    if (mediaRecorder.current?.state !== 'inactive') {
      mediaRecorder.current?.stop()
    }
  }

  // ── Upload ────────────────────────────────────────────────────────────────
  async function handleKeep() {
    if (!audioBlobRef.current) return
    setStage('uploading')
    try {
      const supabase = createClient()
      const path = `${poemId}.webm`
      const { error: uploadErr } = await supabase.storage
        .from('poem-audio')
        .upload(path, audioBlobRef.current, {
          contentType: 'audio/webm',
          upsert: true,
        })
      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage
        .from('poem-audio')
        .getPublicUrl(path)

      await attachAudio(poemId, publicUrl)
      setStage('done')
      setTimeout(onDone, 600)
    } catch {
      setError('Upload failed. Your poem was published — you can add audio later.')
      setStage('review')
    }
  }

  function handleReRecord() {
    stopAnimation()
    audioBlobRef.current = null
    audioPlayerRef.current = null
    setElapsed(0)
    setStage('idle')
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopAnimation()
      streamRef.current?.getTracks().forEach(t => t.stop())
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const pct = elapsed / MAX_SECONDS
  const circumference = 2 * Math.PI * 28

  return (
    <div style={{
      height:          '100%',
      display:         'flex',
      flexDirection:   'column',
      alignItems:      'center',
      justifyContent:  'center',
      gap:             '32px',
      paddingBottom:   'env(safe-area-inset-bottom)',
      color:           '#EADFC5',
    }}>
      {/* Heading */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily:    'var(--font-garamond), Georgia, serif',
          fontStyle:     'italic',
          fontSize:      '18px',
          color:         '#EADFC5',
          marginBottom:  '6px',
        }}>
          {stage === 'idle'      && 'read it aloud?'}
          {stage === 'recording' && 'recording…'}
          {stage === 'review'    && 'sounds good?'}
          {stage === 'uploading' && 'attaching…'}
          {stage === 'done'      && 'attached'}
        </p>
        <p style={{
          fontFamily:    'var(--font-geist), system-ui, sans-serif',
          fontSize:      '11px',
          color:         'rgba(234,223,197,0.30)',
          letterSpacing: '0.02em',
        }}>
          {stage === 'idle'      && `up to ${MAX_SECONDS}s — optional`}
          {stage === 'recording' && `${elapsed}s / ${MAX_SECONDS}s`}
          {stage === 'review'    && 'tap play to preview'}
          {stage === 'uploading' && ''}
          {stage === 'done'      && ''}
        </p>
      </div>

      {/* Waveform canvas */}
      {(stage === 'recording' || stage === 'review') && (
        <canvas
          ref={canvasRef}
          width={240}
          height={60}
          style={{ borderRadius: '4px' }}
        />
      )}

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

        {stage === 'idle' && (
          <button
            onClick={startRecording}
            style={{
              width: '72px', height: '72px',
              borderRadius: '50%',
              background: '#B97A55',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Start recording"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="2" width="6" height="14" rx="3" fill="#FAF6EE" />
              <path d="M5 12a7 7 0 0 0 14 0" stroke="#FAF6EE" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="12" y1="19" x2="12" y2="22" stroke="#FAF6EE" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        )}

        {stage === 'recording' && (
          <>
            {/* Progress ring + stop button */}
            <div style={{ position: 'relative', width: '72px', height: '72px' }}>
              <svg width="72" height="72" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(234,223,197,0.10)" strokeWidth="2" />
                <circle
                  cx="36" cy="36" r="28"
                  fill="none" stroke="#B97A55" strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - pct)}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <button
                onClick={stopRecording}
                style={{
                  position: 'absolute', inset: '12px',
                  borderRadius: '50%',
                  background: '#B97A55',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                aria-label="Stop recording"
              >
                <div style={{ width: '16px', height: '16px', background: '#FAF6EE', borderRadius: '2px' }} />
              </button>
            </div>
          </>
        )}

        {stage === 'review' && (
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {/* Play button */}
            <button
              onClick={() => audioPlayerRef.current?.play()}
              style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgba(234,223,197,0.08)',
                border: '0.5px solid rgba(234,223,197,0.15)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              aria-label="Play back"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="#EADFC5">
                <path d="M3 2.5 L13 8 L3 13.5 Z" />
              </svg>
            </button>

            {/* Keep */}
            <button
              onClick={handleKeep}
              style={{
                padding: '10px 24px', borderRadius: '20px',
                background: '#B97A55',
                border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-geist), system-ui, sans-serif',
                fontSize: '13px', color: '#FAF6EE', letterSpacing: '0.02em',
              }}
            >
              attach
            </button>

            {/* Re-record */}
            <button
              onClick={handleReRecord}
              style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgba(234,223,197,0.08)',
                border: '0.5px solid rgba(234,223,197,0.15)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              aria-label="Re-record"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#EADFC5" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 8a6 6 0 1 1 1.5 4"/>
                <path d="M2 12V8h4" />
              </svg>
            </button>
          </div>
        )}

        {stage === 'uploading' && (
          <div style={{ width: '72px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B97A55" strokeWidth="1.5">
              <path d="M12 2v6M12 16v6M2 12h6M16 12h6" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
              </path>
            </svg>
          </div>
        )}
      </div>

      {error && (
        <p style={{
          fontSize: '11px', color: '#B97A55',
          fontFamily: 'var(--font-geist), system-ui, sans-serif',
          textAlign: 'center', maxWidth: '260px',
        }}>
          {error}
        </p>
      )}

      {/* Skip */}
      {(stage === 'idle' || stage === 'review') && (
        <button
          onClick={onDone}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-geist), system-ui, sans-serif',
            fontSize: '12px',
            color: 'rgba(234,223,197,0.25)',
            letterSpacing: '0.03em',
            minHeight: '44px',
          }}
        >
          skip
        </button>
      )}
    </div>
  )
}
