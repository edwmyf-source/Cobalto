/**
 * REDCOBALTO mark — split C in brand red + cobalt/navy.
 * Pure SVG so it stays crisp at every size and can be used as the app icon.
 * `size` acepta un número (px) o cualquier valor CSS válido —incluido
 * clamp()— para que la marca pueda escalar con el ancho de pantalla igual
 * que la tipografía.
 */
export default function CobaltoMark({ size = 32, rounded = 'rounded-xl', className = '', dark = false }) {
  return (
    <div
      className={`${rounded} flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size, background: 'var(--logo-surface, transparent)' }}
      aria-hidden="true"
    >
      {/* 78% en vez de un cálculo en px: así funciona también cuando `size`
          es una expresión CSS y no un número. */}
      <svg width="78%" height="78%" viewBox="0 0 40 40" fill="none">
        <path
          d="M33.8 14.7A15.8 15.8 0 0 0 20 4.8a15.8 15.8 0 0 0-13.8 7.9"
          stroke="var(--brand-red)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M6.2 25.3A15.8 15.8 0 0 0 20 35.2a15.8 15.8 0 0 0 13.8-7.9"
          stroke={dark ? '#FFFFFF' : 'var(--accent-deep)'}
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
