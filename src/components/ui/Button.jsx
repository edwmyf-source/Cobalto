import { Loader2 } from 'lucide-react'

/**
 * Botón del sistema. Cuatro variantes, nada más.
 *
 * primary     → acción principal de la pantalla (una sola por vista)
 * secondary   → acciones complementarias
 * ghost       → acciones discretas, sin peso visual
 * destructive → acciones críticas e irreversibles
 */
const VARIANTS = {
  primary: {
    base: 'text-white',
    style: { background: 'var(--accent-deep)' },
    hover: { background: 'var(--accent)' },
  },
  secondary: {
    base: '',
    style: { background: 'var(--surface)', color: 'var(--text-primary)', boxShadow: 'inset 0 0 0 1px var(--border)' },
    hover: { background: 'var(--bg-subtle)' },
  },
  ghost: {
    base: '',
    style: { background: 'transparent', color: 'var(--accent)' },
    hover: { background: 'var(--accent-softer)' },
  },
  destructive: {
    base: 'text-white',
    style: { background: 'var(--error)' },
    hover: { background: '#A93636' },
  },
}

const SIZES = {
  // 44px estándar, 40px compacto — nunca por debajo del área táctil mínima.
  md: 'h-[44px] px-4 text-[14px]',
  sm: 'h-[40px] px-4 text-[14px]',
  lg: 'h-[48px] px-6 text-[16px]',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  fullWidth = false,
  disabled = false,
  children,
  className = '',
  ...rest
}) {
  const v = VARIANTS[variant] || VARIANTS.primary
  const isDisabled = disabled || loading

  return (
    <button
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-btn font-semibold
        transition-all duration-[160ms] ease-premium select-none
        active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none
        ${SIZES[size]} ${v.base} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={v.style}
      onMouseEnter={e => { if (!isDisabled) Object.assign(e.currentTarget.style, v.hover) }}
      onMouseLeave={e => { Object.assign(e.currentTarget.style, v.style) }}
      {...rest}
    >
      {loading
        ? <Loader2 size={size === 'lg' ? 18 : 16} className="animate-spin" />
        : Icon && <Icon size={size === 'lg' ? 18 : 16} strokeWidth={2.2} />}
      {children}
      {IconRight && !loading && <IconRight size={size === 'lg' ? 18 : 16} strokeWidth={2.2} />}
    </button>
  )
}
