import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

type FontEntry = {
  data: ArrayBuffer
  name: string
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
  style?: 'normal' | 'italic'
}

export const runtime = 'edge'

// Old IE UA → Google Fonts returns TTF (Satori-compatible) instead of woff2
async function loadFont(italic: boolean, weight: number): Promise<ArrayBuffer> {
  const ital = italic ? 1 : 0
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@${ital},${weight}`,
    { headers: { 'User-Agent': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.0)' } },
  ).then(r => r.text())
  const url = css.match(/url\(([^)]+)\)/)?.[1]
  if (!url) throw new Error('Font URL not found in Google Fonts CSS')
  return fetch(url).then(r => r.arrayBuffer())
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string; slug: string }> },
) {
  const { username, slug } = await params

  // Fetch poem from Supabase via REST (works in edge runtime, no cookies needed)
  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const res = await fetch(
    `${supabaseUrl}/rest/v1/public_poems?author_username=eq.${encodeURIComponent(username)}&slug=eq.${encodeURIComponent(slug)}&select=title,content,author_display_name,author_username&limit=1`,
    { headers: { apikey: supabaseAnon, Authorization: `Bearer ${supabaseAnon}` } },
  )

  const rows = await res.json() as Array<{
    title: string
    content: string
    author_display_name: string | null
    author_username: string
  }>

  const poem = rows[0]
  if (!poem) {
    return new Response('Not found', { status: 404 })
  }

  const poetName = poem.author_display_name || poem.author_username

  // Split lines; cap visible lines to avoid overflow on tall poems
  const allLines = poem.content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const MAX_LINES = 14
  const truncated = allLines.length > MAX_LINES
  const lines = truncated ? allLines.slice(0, MAX_LINES) : allLines

  // Load fonts — wrapped so a Google Fonts failure degrades gracefully
  // (Satori falls back to Noto if no fonts are registered)
  let fonts: FontEntry[] = []
  try {
    const [regularFont, italicFont, semiboldItalicFont] = await Promise.all([
      loadFont(false, 400),
      loadFont(true,  400),
      loadFont(true,  600),
    ])
    fonts = [
      { name: 'EB Garamond', data: regularFont,        style: 'normal', weight: 400 },
      { name: 'EB Garamond', data: italicFont,         style: 'italic', weight: 400 },
      { name: 'EB Garamond', data: semiboldItalicFont, style: 'italic', weight: 600 },
    ]
  } catch {
    // Font loading failed — card renders with system serif fallback
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#FAF6EE',     // parchment
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '96px 88px 88px',
          fontFamily: '"EB Garamond", Georgia, serif',
          position: 'relative',
        }}
      >
        {/* Pen mark — top-left corner, simplified mark */}
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: 64,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {/* dot */}
          <div style={{
            width: 10, height: 10, borderRadius: 5,
            backgroundColor: '#1B1A2E',
          }} />
          {/* three lines */}
          <div style={{ width: 28, height: 2, backgroundColor: '#1B1A2E', opacity: 0.85, borderRadius: 1 }} />
          <div style={{ width: 36, height: 2, backgroundColor: '#1B1A2E', borderRadius: 1 }} />
          <div style={{ width: 30, height: 2, backgroundColor: '#1B1A2E', opacity: 0.85, borderRadius: 1 }} />
        </div>

        {/* Title */}
        {poem.title ? (
          <div
            style={{
              fontSize: 40,
              fontStyle: 'italic',
              fontWeight: 600,
              color: '#1B1A2E',
              textAlign: 'center',
              marginBottom: 44,
              lineHeight: 1.3,
              maxWidth: 800,
              letterSpacing: 0.4,
            }}
          >
            {poem.title}
          </div>
        ) : (
          <div style={{ width: 48, height: 1, backgroundColor: '#1B1A2E', opacity: 0.15, marginBottom: 48 }} />
        )}

        {/* Poem lines */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
            maxWidth: 860,
            width: '100%',
          }}
        >
          {lines.map((line, i) =>
            line.trim() === '' ? (
              <div key={i} style={{ height: 22 }} />
            ) : (
              <div
                key={i}
                style={{
                  fontSize: 28,
                  fontStyle: 'normal',
                  fontWeight: 400,
                  color: '#2C2A40',
                  textAlign: 'center',
                  lineHeight: 1.85,
                }}
              >
                {line}
              </div>
            ),
          )}
          {truncated && (
            <div style={{ fontSize: 24, color: '#A89F8C', marginTop: 12, letterSpacing: 8 }}>· · ·</div>
          )}
        </div>

        {/* Hairline rule */}
        <div style={{ width: 48, height: 1, backgroundColor: '#1B1A2E', opacity: 0.12, marginTop: 48, marginBottom: 24 }} />

        {/* Author — small caps style via uppercase + tracking */}
        <div
          style={{
            fontSize: 16,
            fontStyle: 'italic',
            fontWeight: 400,
            color: '#A89F8C',
            letterSpacing: 2.5,
            textTransform: 'uppercase',
          }}
        >
          — {poetName}
        </div>

        {/* Poema wordmark — bottom, terracotta */}
        <div
          style={{
            position: 'absolute',
            bottom: 56,
            fontSize: 18,
            fontStyle: 'italic',
            fontWeight: 400,
            color: '#B97A55',
            letterSpacing: 4,
          }}
        >
          poema
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      fonts,
    },
  )
}
