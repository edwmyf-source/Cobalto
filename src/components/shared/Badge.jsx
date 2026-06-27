const variants = {
  blue:  'bg-brand-500/10 text-brand-700',
  green: 'bg-success-50 text-success-500',
  red:   'bg-danger-50 text-danger-500',
  gray:  'bg-ink-100 text-ink-900',
}

export default function Badge({ children, variant = 'gray', className = '' }) {
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${variants[variant] || variants.gray} ${className}`}>
      {children}
    </span>
  )
}
