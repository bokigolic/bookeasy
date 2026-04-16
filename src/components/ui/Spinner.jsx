const SIZES = { sm: 16, md: 32, lg: 48 }

export function Spinner({ size = 'md' }) {
  const px = SIZES[size] || SIZES.md
  const id = `sg-${size}`
  const r = (px - 4) / 2
  const circ = 2 * Math.PI * r
  // Show ~75% of the circle
  const dash = circ * 0.75

  return (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${px} ${px}`}
      className="animate-spin"
      style={{ animationDuration: '900ms', animationTimingFunction: 'linear' }}
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563ff" />
          <stop offset="100%" stopColor="#00d4ff" />
        </linearGradient>
      </defs>
      {/* Track */}
      <circle
        cx={px / 2}
        cy={px / 2}
        r={r}
        fill="none"
        stroke="rgba(26,26,58,0.8)"
        strokeWidth={2}
      />
      {/* Gradient arc */}
      <circle
        cx={px / 2}
        cy={px / 2}
        r={r}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth={2}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${px / 2} ${px / 2})`}
      />
    </svg>
  )
}
