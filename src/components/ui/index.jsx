export { default as Button } from './Button'
export { default as Input } from './Input'

/* ══════════════════════════════════════════════════════════════════════
   CARD — pieza base del contenido
   ══════════════════════════════════════════════════════════════════════ */
export function Card({ children, interactive = false, className = '', style = {}, ...rest }) {
  return (
    <div
      className={`rounded-card transition-all duration-[160ms] ease-premium
        ${interactive ? 'cursor-pointer hover:shadow-card-hover' : ''} ${className}`}
      style={{
        background: 'var(--surface)',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--border-soft)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

/* Contenedor mayor: agrupa varias piezas bajo una misma jerarquía. */
export function Panel({ children, className = '', style = {}, ...rest }) {
  return (
    <div
      className={`rounded-panel ${className}`}
      style={{
        background: 'var(--surface)',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--border-soft)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   CHIP — categorías, filtros, etiquetas. Alterna encendido/apagado.
   ══════════════════════════════════════════════════════════════════════ */
export function Chip({ children, active = false, size = 'md', onClick, className = '', ...rest }) {
  const pad = size === 'sm' ? 'h-[28px] px-3 text-[12px]' : 'h-[34px] px-4 text-[13px]'
  const isButton = typeof onClick === 'function'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isButton ? active : undefined}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap
        transition-all duration-[160ms] ease-premium active:scale-[0.97] ${pad} ${className}`}
      style={active
        ? { background: 'var(--accent-deep)', color: '#fff' }
        : { background: 'var(--surface)', color: 'var(--text-secondary)', boxShadow: 'inset 0 0 0 1px var(--border)' }}
      {...rest}
    >
      {children}
    </button>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   BADGE — estado, no acción. Nunca se pulsa.
   ══════════════════════════════════════════════════════════════════════ */
const BADGE_TONES = {
  neutral: { background: 'var(--bg-subtle)',  color: 'var(--text-secondary)' },
  brand:   { background: 'var(--accent-soft)',color: 'var(--accent-deep)'    },
  success: { background: 'var(--success-bg)', color: 'var(--success)'        },
  warning: { background: 'var(--warning-bg)', color: 'var(--warning)'        },
  danger:  { background: 'var(--error-bg)',   color: 'var(--error)'          },
  info:    { background: 'var(--info-bg)',    color: 'var(--info)'           },
}

export function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[12px] font-medium leading-4 ${className}`}
      style={BADGE_TONES[tone] || BADGE_TONES.neutral}
    >
      {children}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   SKELETON — carga. Refleja la forma del contenido que llega.
   ══════════════════════════════════════════════════════════════════════ */
export function Skeleton({ w = '100%', h = 12, r, className = '', style = {} }) {
  return (
    <div className={`skeleton ${className}`}
      style={{ width: w, height: h, borderRadius: r ?? 8, ...style }} />
  )
}

export function SkeletonPostCard() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton w={40} h={40} r={12} />
        <div className="flex-1">
          <Skeleton w="45%" h={12} />
          <div className="mt-2"><Skeleton w="28%" h={10} /></div>
        </div>
        <Skeleton w={72} h={22} r={999} />
      </div>
      <Skeleton w="100%" h={12} />
      <div className="mt-2"><Skeleton w="92%" h={12} /></div>
      <div className="mt-2"><Skeleton w="60%" h={12} /></div>
      <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--border-soft)' }}>
        <Skeleton w={84} h={32} r={12} />
        <Skeleton w={84} h={32} r={12} />
        <div className="ml-auto"><Skeleton w={104} h={32} r={12} /></div>
      </div>
    </Card>
  )
}

export function SkeletonListRow() {
  return (
    <Card className="p-4 flex items-center gap-3">
      <Skeleton w={40} h={40} r={999} />
      <div className="flex-1">
        <Skeleton w="40%" h={12} />
        <div className="mt-2"><Skeleton w="65%" h={10} /></div>
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   EMPTY STATE — una pantalla vacía es una invitación a actuar.
   ══════════════════════════════════════════════════════════════════════ */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-12">
      {Icon && (
        <div className="w-12 h-12 rounded-panel flex items-center justify-center mb-4"
          style={{ background: 'var(--accent-soft)' }}>
          <Icon size={22} strokeWidth={1.8} style={{ color: 'var(--accent-deep)' }} />
        </div>
      )}
      <h3 className="t-h4" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {description && (
        <p className="t-body-sm mt-2 max-w-[320px]" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   SECTION LABEL — rótulo, no botón.
   ══════════════════════════════════════════════════════════════════════ */
export function SectionLabel({ children, count, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="t-eyebrow" style={{ color: 'var(--text-tertiary)' }}>
        {children}{count != null && <span className="tnum"> · {count}</span>}
      </span>
      {action}
    </div>
  )
}
