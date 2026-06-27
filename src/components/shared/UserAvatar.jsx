const PALETTE = [
  { from: '#22c55e', to: '#15803d' },
  { from: '#f59e0b', to: '#b45309' },
  { from: '#8b5cf6', to: '#6d28d9' },
  { from: '#06b6d4', to: '#0e7490' },
  { from: '#ec4899', to: '#be185d' },
  { from: '#14b8a6', to: '#0f766e' },
  { from: '#ef4444', to: '#b91c1c' },
  { from: '#2563eb', to: '#1d4ed8' },
  { from: '#84cc16', to: '#4d7c0f' },
  { from: '#f97316', to: '#c2410c' },
]

export function getAvatarColor(seed = '') {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

export default function UserAvatar({ seed = '', size = 40, avatarUrl = null, className = '', borderColor = null }) {
  const c = getAvatarColor(seed)
  const iconSize = Math.round(size * 0.52)
  const stroke = 1.5
  const style = {
    width: size, height: size,
    border: borderColor ? `2px solid ${borderColor}` : 'none',
    flexShrink: 0,
  }

  // Si hay foto real, mostrarla
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={style}
        onError={e => { e.target.style.display = 'none' }}
      />
    )
  }

  // Si no, el cubo isométrico de siempre
  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ ...style, background: `linear-gradient(135deg, ${c.from} 0%, ${c.to} 100%)` }}
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L3.5 7v10L12 22l8.5-5V7L12 2z" stroke="white" strokeWidth={stroke} strokeLinejoin="round" />
        <path d="M12 22V12M3.5 7L12 12l8.5-5" stroke="white" strokeWidth={stroke} strokeLinejoin="round" />
      </svg>
    </div>
  )
}
