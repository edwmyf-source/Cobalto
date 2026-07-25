import { useState, forwardRef } from 'react'

/**
 * Campo de formulario del sistema.
 * Label arriba, altura 44px, foco con anillo teal suave, error discreto pero claro.
 */
const Input = forwardRef(function Input({
  label,
  error,
  helper,
  icon: Icon,
  suffix,
  className = '',
  containerClassName = '',
  as = 'input',
  rows = 4,
  id,
  ...rest
}, ref) {
  const [focused, setFocused] = useState(false)
  const fieldId = id || rest.name || label?.toLowerCase().replace(/\s+/g, '-')
  const Tag = as

  const borderColor = error
    ? 'var(--error)'
    : focused ? 'var(--border-focus)' : 'var(--border)'

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={fieldId} className="t-label block mb-2" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon size={16} strokeWidth={2}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: focused ? 'var(--accent)' : 'var(--text-tertiary)' }} />
        )}

        <Tag
          ref={ref}
          id={fieldId}
          rows={as === 'textarea' ? rows : undefined}
          onFocus={e => { setFocused(true); rest.onFocus?.(e) }}
          onBlur={e => { setFocused(false); rest.onBlur?.(e) }}
          aria-invalid={error ? 'true' : undefined}
          className={`w-full rounded-input text-[14px] transition-all duration-[160ms] ease-premium
            ${as === 'textarea' ? 'py-3 min-h-[96px] resize-none' : 'h-[44px]'}
            ${Icon ? 'pl-9' : 'pl-3'} ${suffix ? 'pr-10' : 'pr-3'} ${className}`}
          style={{
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            boxShadow: `inset 0 0 0 1px ${borderColor}${focused && !error ? ', 0 0 0 3px var(--accent-soft)' : ''}`,
          }}
          {...rest}
        />

        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
      </div>

      {error
        ? <p className="t-caption mt-2" style={{ color: 'var(--error)' }}>{error}</p>
        : helper && <p className="t-caption mt-2" style={{ color: 'var(--text-tertiary)' }}>{helper}</p>}
    </div>
  )
})

export default Input
