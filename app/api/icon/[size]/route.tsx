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

  const radius = Math.round(size * 0.22)

  return new ImageResponse(
    (
      <div
        style={{
          width:           '100%',
          height:          '100%',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          backgroundColor: '#F0E8D5',
          borderRadius:    radius,
        }}
      >
        {/* Pen SVG — same paths as app/icon.svg */}
        <svg viewBox="0 0 400 400" width={size} height={size}>
          <g transform="translate(200,205) rotate(-42) scale(1.5) translate(-10,-100)">
            <path
              d="M 0,14 A 10,14 0 0 1 20,14 L 20,162 L 17,182 L 14,200 L 10,212 L 6,200 L 3,182 L 0,162 Z"
              fill="#1A1A2E"
            />
            <rect x="14" y="17" width="4" height="138" rx="2" fill="#252440" opacity="0.5" />
            <rect x="21" y="5" width="5.5" height="76" rx="2.75" fill="#C5865D" />
            <circle cx="23.75" cy="83" r="4.5" fill="#C5865D" />
            <circle cx="10" cy="212" r="4" fill="#C5865D" />
          </g>
        </svg>
      </div>
    ),
    { width: size, height: size },
  )
}
