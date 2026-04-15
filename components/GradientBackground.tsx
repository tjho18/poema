'use client'

export default function GradientBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
    >
      {/* Deep amber orb — upper left */}
      <div
        className="ambient-orb absolute rounded-full blur-[120px]"
        style={{
          width: '600px',
          height: '600px',
          top: '-200px',
          left: '-150px',
          background: 'radial-gradient(circle, rgba(180,130,60,0.12) 0%, transparent 70%)',
          '--duration': '22s',
          '--delay': '0s',
        } as React.CSSProperties}
      />
      {/* Pale gold orb — centre right */}
      <div
        className="ambient-orb absolute rounded-full blur-[160px]"
        style={{
          width: '500px',
          height: '500px',
          top: '30%',
          right: '-100px',
          background: 'radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 70%)',
          '--duration': '28s',
          '--delay': '-8s',
        } as React.CSSProperties}
      />
      {/* Deep reddish orb — lower centre */}
      <div
        className="ambient-orb absolute rounded-full blur-[140px]"
        style={{
          width: '400px',
          height: '400px',
          bottom: '-100px',
          left: '35%',
          background: 'radial-gradient(circle, rgba(120,70,40,0.1) 0%, transparent 70%)',
          '--duration': '18s',
          '--delay': '-5s',
        } as React.CSSProperties}
      />
    </div>
  )
}
