import { Mail, MapPin } from 'lucide-react'
import { LEGAL_EMAIL } from '../legal/LegalContent'

// Pie de la pantalla de bienvenida. Tres columnas en escritorio que se apilan
// en móvil: marca · enlaces · contacto.
export default function Footer({ onTerminos, onPrivacidad, onContacto }) {
  const year = new Date().getFullYear()

  const linkCls = 'text-[14px] text-left transition-colors duration-[160ms] hover:underline'
  const linkStyle = { color: 'var(--text-secondary)' }

  return (
    <footer className="w-full mt-4" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-12">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

          {/* ── Marca ── */}
          <div>
            <span className="font-extrabold text-[20px]" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              <span style={{ color: 'var(--brand-red)' }}>Red</span> Cobalto
            </span>
            <p className="text-[14px] mt-3 leading-relaxed max-w-[280px]" style={{ color: 'var(--text-tertiary)' }}>
              La red profesional de la industria química en Colombia.
            </p>
          </div>

          {/* ── Legal ── */}
          <div>
            <p className="t-eyebrow mb-4" style={{ color: 'var(--text-tertiary)' }}>Legal</p>
            <nav className="flex flex-col gap-3">
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
            <p className="t-eyebrow mb-4" style={{ color: 'var(--text-tertiary)' }}>Contacto</p>
            <div className="flex flex-col gap-3">
              <a href={`mailto:${LEGAL_EMAIL}`}
                className="flex items-center gap-2.5 text-[14px] hover:underline"
                style={{ color: 'var(--text-secondary)' }}>
                <Mail size={16} strokeWidth={2} style={{ color: 'var(--text-tertiary)' }} />
                {LEGAL_EMAIL}
              </a>
              <p className="flex items-center gap-2.5 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                <MapPin size={16} strokeWidth={2} style={{ color: 'var(--text-tertiary)' }} />
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
        <div className="mt-10 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
          style={{ borderTop: '1px solid var(--border-soft)' }}>
          <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            © {year} Red Cobalto. Todos los derechos reservados.
          </p>
          <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            Hecho en Colombia
          </p>
        </div>
      </div>
    </footer>
  )
}
