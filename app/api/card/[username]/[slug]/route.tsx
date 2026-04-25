import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

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
  type FontDef = { name: string; data: ArrayBuffer; style: 'normal' | 'italic'; weight: number }
  let fonts: FontDef[] = []
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
          backgroundColor: '#F7F7F5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '88px 80px 72px',
          fontFamily: '"EB Garamond", Georgia, serif',
          position: 'relative',
        }}
      >
        {/* Title */}
        {poem.title ? (
          <div
            style={{
              fontSize: 36,
              fontStyle: 'italic',
              fontWeight: 600,
              color: '#0a0a0a',
              textAlign: 'center',
              marginBottom: 40,
              lineHeight: 1.3,
              maxWidth: 800,
            }}
          >
            {poem.title}
          </div>
        ) : (
          /* Thin rule instead of title */
          <div style={{ width: 48, height: 1, backgroundColor: '#0a0a0a', opacity: 0.15, marginBottom: 48 }} />
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
              <div key={i} style={{ height: 20 }} />
            ) : (
              <div
                key={i}
                style={{
                  fontSize: 26,
                  fontStyle: 'normal',
                  fontWeight: 400,
                  color: '#0a0a0a',
                  textAlign: 'center',
                  lineHeight: 1.85,
                }}
              >
                {line}
              </div>
            ),
          )}
          {truncated && (
            <div style={{ fontSize: 22, color: '#6b6b6b', marginTop: 8 }}>⋯</div>
          )}
        </div>

        {/* Rule */}
        <div style={{ width: 48, height: 1, backgroundColor: '#0a0a0a', opacity: 0.12, marginTop: 44, marginBottom: 22 }} />

        {/* Author */}
        <div
          style={{
            fontSize: 18,
            fontStyle: 'italic',
            fontWeight: 400,
            color: '#6b6b6b',
            letterSpacing: 1,
          }}
        >
          — {poetName}
        </div>

        {/* Poema watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            fontSize: 14,
            fontStyle: 'italic',
            fontWeight: 400,
            color: '#6b6b6b',
            opacity: 0.35,
            letterSpacing: 3,
          }}
        >
          poema.app
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
