import CobaltoMark from './CobaltoMark'

export default function RedCobaltoLogo({ size = 'md', dark = false, markOnly = false, className = '' }) {
  const sizes = {
    sm: { mark: 24, text: 'text-[13px]' },
    md: { mark: 30, text: 'text-[16px]' },
    lg: { mark: 40, text: 'text-[22px]' },
    xl: { mark: 52, text: 'text-[30px]' },
  }
  const s = sizes[size] || sizes.md

  if (markOnly) return <CobaltoMark size={s.mark} className={className} dark={dark} />

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <CobaltoMark size={s.mark} dark={dark} />
      <span className={`${s.text} font-extrabold tracking-[-0.035em] leading-none whitespace-nowrap`}>
        <span style={{ color: 'var(--brand-red)' }}>RED</span>
        <span style={{ color: dark ? '#FFFFFF' : 'var(--accent-deep)' }}>COBALTO</span>
      </span>
    </div>
  )
}
