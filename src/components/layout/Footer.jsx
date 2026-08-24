import { Mail, MapPin } from 'lucide-react'
import { LEGAL_EMAIL } from '../legal/LegalContent'

// Pie de la pantalla de bienvenida. Tres columnas en escritorio que se apilan
// en móvil: marca · enlaces · contacto. Comprimido a propósito: sin la
// frase de propósito bajo la marca, y con todo el espaciado reducido.
export default function Footer({ onTerminos, onPrivacidad, onContacto }) {
  const year = new Date().getFullYear()

  const linkCls = 'text-[13px] text-left transition-colors duration-[160ms] hover:underline'
  const linkStyle = { color: 'var(--text-secondary)' }

  return (
    <footer className="w-full mt-3" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">

          {/* ── Marca (sin línea de propósito) ── */}
          <div>
            <span className="font-extrabold text-[16px]" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              <span style={{ color: 'var(--brand-red)' }}>RED</span><span style={{ color: 'var(--accent-deep)' }}>COBALTO</span>
            </span>
          </div>

          {/* ── Legal ── */}
          <div>
            <p className="t-eyebrow mb-1.5" style={{ color: 'var(--text-tertiary)' }}>Legal</p>
            <nav className="flex flex-col gap-1">
              <button onClick={onTerminos} className={linkCls} style={linkStyle}>
                Términos y Condiciones
              </button>
              <button onClick={onPrivacidad} className={linkCls} style={linkStyle}>
                Política de Privacidad
              </button>
              <button onClick={onPrivacidad} className={linkCls} style={linkStyle}>
                Tratamiento de Datos
              </button>
            </nav>
          </div>

          {/* ── Contacto ── */}
          <div>
            <p className="t-eyebrow mb-1.5" style={{ color: 'var(--text-tertiary)' }}>Contacto</p>
            <div className="flex flex-col gap-1">
              <a href={`mailto:${LEGAL_EMAIL}`}
                className="flex items-center gap-2 text-[13px] hover:underline"
                style={{ color: 'var(--text-secondary)' }}>
                <Mail size={13} strokeWidth={2} style={{ color: 'var(--text-tertiary)' }} />
                {LEGAL_EMAIL}
              </a>
              <p className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                <MapPin size={13} strokeWidth={2} style={{ color: 'var(--text-tertiary)' }} />
                Colombia
              </p>
              {onContacto && (
                <button onClick={onContacto} className={linkCls} style={{ color: 'var(--accent)' }}>
                  Escríbenos →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Línea de cierre ── */}
        <div className="mt-3 pt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-1"
          style={{ borderTop: '1px solid var(--border-soft)' }}>
          <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
            © {year} REDCobalto. Todos los derechos reservados.
          </p>
          <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
            Hecho en Colombia
          </p>
        </div>
      </div>
    </footer>
  )
}
