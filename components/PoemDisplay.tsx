'use client'

import { useEffect, useState } from 'react'

interface PoemDisplayProps {
  content: string
  animate?: boolean
  typewriter?: boolean
}

export default function PoemDisplay({ content, animate = true, typewriter = false }: PoemDisplayProps) {
  const lines = content.split('\n')
  const [visibleLines, setVisibleLines] = useState<number>(animate ? 0 : lines.length)
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(typewriter)

  // Stagger-fade each line in
  useEffect(() => {
    if (!animate || typewriter) return
    setVisibleLines(0)
    const timers: ReturnType<typeof setTimeout>[] = []
    lines.forEach((_, i) => {
      timers.push(
        setTimeout(() => setVisibleLines(v => Math.max(v, i + 1)), i * 80 + 200)
      )
    })
    return () => timers.forEach(clearTimeout)
  }, [content]) // eslint-disable-line react-hooks/exhaustive-deps

  // Typewriter effect
  useEffect(() => {
    if (!typewriter) return
    setTypedText('')
    setIsTyping(true)
    let i = 0
    const interval = setInterval(() => {
      if (i < content.length) {
        setTypedText(content.slice(0, i + 1))
        i++
      } else {
        setIsTyping(false)
        clearInterval(interval)
      }
    }, 28)
    return () => clearInterval(interval)
  }, [content, typewriter])

  if (typewriter) {
    return (
      <div className="poem-content text-parchment/90 text-lg leading-loose">
        {typedText}
        {isTyping && <span className="cursor" />}
      </div>
    )
  }

  return (
    <div className="poem-content text-parchment/90 text-lg leading-loose">
      {lines.map((line, i) => (
        <span
          key={i}
          className="block transition-all duration-500"
          style={{
            opacity: i < visibleLines ? 1 : 0,
            transform: i < visibleLines ? 'translateY(0)' : 'translateY(8px)',
            transitionDelay: `${i * 30}ms`,
          }}
        >
          {line || '\u00A0'}
        </span>
      ))}
    </div>
  )
}
