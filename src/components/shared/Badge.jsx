const variants = {
  blue:  'bg-[var(--accent)]/10 text-[var(--accent-deep)]',
  green: 'bg-[var(--success-bg)] text-[var(--success)]',
  red:   'bg-[var(--error-bg)] text-[var(--error)]',
  gray:  'bg-[var(--border-soft)] text-[var(--text-primary)]',
}

export default function Badge({ children, variant = 'gray', className = '' }) {
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${variants[variant] || variants.gray} ${className}`}>
      {children}
    </span>
  )
}
