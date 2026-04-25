import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ size: string }> },
) {
  const { size: sizeStr } = await params
  const size = parseInt(sizeStr, 10)
  const validSizes = [16, 32, 48, 72, 96, 144, 152, 167, 180, 192, 256, 512, 1024]
  if (!validSizes.includes(size)) {
    return new Response('Invalid size', { status: 400 })
  }

  const fontSize = Math.round(size * 0.65)
  const radius   = Math.round(size * 0.18)

  return new ImageResponse(
    (
      <div
        style={{
          width:           '100%',
          height:          '100%',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          backgroundColor: '#F7F7F5',
          borderRadius:    radius,
          fontFamily:      'Georgia, serif',
        }}
      >
        <div
          style={{
            fontSize,
            fontStyle:  'italic',
            color:      '#0a0a0a',
            lineHeight: 1,
            marginTop:  Math.round(size * 0.05), // optical centering
          }}
        >
          P
        </div>
      </div>
    ),
    { width: size, height: size },
  )
}
