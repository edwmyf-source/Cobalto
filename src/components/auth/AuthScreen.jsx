import { useState, useEffect } from 'react'
import { Gift, Rocket, BadgeCheck, Lock, MessageCircle, FlaskConical, Users, Zap, ArrowRight, Building2, MapPin } from 'lucide-react'
import { getCommunityStats } from '../../api/stats'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import ResetForm from './ResetForm'
import Footer from '../layout/Footer'
import RedCobaltoLogo from '../shared/RedCobaltoLogo'
import CobaltoMark from '../shared/CobaltoMark'
import { LegalLayout, TerminosContent, PrivacidadContent, LEGAL_UPDATED } from '../legal/LegalContent'

// Ventajas con iconografía consistente: misma familia (lucide), mismo tamaño
// y mismo grosor de trazo en las seis.
const ADVANTAGES = [
  { icon: Gift,          title: 'Gratis',          sub: 'Sin costos ocultos'     },
  { icon: Rocket,        title: 'Rápido',          sub: 'En segundos'            },
  { icon: BadgeCheck,    title: 'Perfiles reales', sub: 'Sabes con quién hablas' },
  { icon: Lock,          title: 'Privado',         sub: 'Datos protegidos'       },
  { icon: MessageCircle, title: 'Chat seguro',     sub: 'Contacto interno'       },
  { icon: FlaskConical,  title: 'Química',         sub: 'Industria y lab'        },
]

// Las métricas crecen con el tiempo. Por debajo de 10.000 se muestra el número
// exacto (más creíble y concreto); por encima se compacta ("12 mil") para que
// no desborde la tarjeta en móvil ni pierda legibilidad.
const formatMetric = (n) => {
  const v = n ?? 0
  if (v < 10000) return v.toLocaleString('es-CO')
  // A partir de 100.000 se quitan los decimales: "123,5 k" no cabe en la
  // tarjeta en móvil, "123 k" sí.
  const decimals = v < 100000 ? 1 : 0
  return new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: decimals }).format(v)
}

// Botón con estados hover / active / focus reales, no solo un scale al pulsar.
function CTA({ children, onClick, variant = 'primary', size = 'md', className = '', icon: Icon }) {
  const base = {
    primary:  { background: 'var(--accent-deep)', color: '#fff',                boxShadow: 'var(--shadow-raised)' },
    onNavy:   { background: '#ffffff',            color: 'var(--accent-deep)',  boxShadow: 'var(--shadow-card)'   },
    ghostNavy:{ background: 'rgba(255,255,255,0.12)', color: '#ffffff', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.22)' },
  }[variant]

  const hover = {
    primary:  { background: 'var(--accent)' },
    onNavy:   { background: 'var(--accent-softer)' },
    ghostNavy:{ background: 'rgba(255,255,255,0.2)' },
  }[variant]

  const h = size === 'lg' ? 'h-[44px] px-8 text-[15px]' : 'h-[38px] px-6 text-[14px]'

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-btn font-extrabold
        transition-all duration-[160ms] ease-premium active:scale-[0.98] ${h} ${className}`}
      style={base}
      onMouseEnter={e => Object.assign(e.currentTarget.style, hover)}
      onMouseLeave={e => Object.assign(e.currentTarget.style, base)}
    >
      {children}
      {Icon && <Icon size={18} strokeWidth={2.4} />}
    </button>
  )
}

// Barra superior fija: logo a la izquierda, acciones a la derecha
function TopBar({ onLogin, onSignup }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b" style={{ background: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(18px)', borderColor: 'var(--border-soft)' }}>
      <div className="max-w-6xl mx-auto h-[72px] flex items-center justify-between px-4 md:px-6">
        <RedCobaltoLogo size="md" />
        <div className="flex items-center gap-2">
          <CTA onClick={onLogin} variant="ghostNavy" className="!bg-transparent !text-[var(--accent-deep)] !shadow-none !px-4 hover:!bg-[var(--accent-softer)]">Iniciar sesión</CTA>
          <CTA onClick={onSignup} variant="primary" className="!px-4">Unirse ahora</CTA>
        </div>
      </div>
    </header>
  )
}

function Landing({ stats, onSignup }) {
  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col gap-8 md:gap-12">

      {/* ── Hero ── */}
      <section className="md:flex md:items-center md:gap-12">
        <div className="md:flex-1">
          <div className="mb-5 flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: 'var(--brand-red)' }} /><span className="t-eyebrow" style={{ color: 'var(--text-tertiary)' }}>COMUNIDAD PROFESIONAL</span></div>
          <h1 className="text-left font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 0.92 }}>
            <span className="block" style={{ fontSize: 'clamp(32px, 11.2vw, 62px)' }}>Punto de</span>
            <span className="block" style={{ fontSize: 'clamp(32px, 11.2vw, 62px)' }}>encuentro</span>
            <span className="block mt-2" style={{ color: 'var(--accent)', fontSize: 'clamp(18px, 5.8vw, 34px)' }}>
              de la industria química.
            </span>
          </h1>

          <p className="mt-6 leading-relaxed max-w-[560px]" style={{ color: 'var(--text-secondary)', fontSize: 'clamp(16px, 4.85vw, 24px)' }}>
            Conecta con profesionales, laboratorios y proveedores del sector químico en Colombia.
          </p>

          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <span className="font-extrabold" style={{ color: 'var(--brand-red)', fontSize: 'clamp(16px, 4.85vw, 24px)' }}>Conecta</span>
            <span className="text-[18px]" style={{ color: 'var(--border)' }}>·</span>
            <span className="font-extrabold" style={{ color: 'var(--accent)', fontSize: 'clamp(16px, 4.85vw, 24px)' }}>Comparte</span>
            <span className="text-[18px]" style={{ color: 'var(--border)' }}>·</span>
            <span className="font-extrabold" style={{ color: 'var(--accent-violet)', fontSize: 'clamp(16px, 4.85vw, 24px)' }}>Crece</span>
          </div>

          <CTA onClick={onSignup} size="lg" icon={ArrowRight} className="mt-8">
            Unirse ahora
          </CTA>
        </div>

        {/* ── Marca: llena el vacío de la derecha en escritorio ── */}
        <div className="hidden md:flex md:flex-col md:items-center md:justify-center md:w-[360px] flex-shrink-0">
          <div className="relative flex items-center justify-center w-full">
            {/* Círculo sutil de fondo, mismo lenguaje visual que el splash */}
            <div className="absolute rounded-full" aria-hidden="true"
              style={{ width: 300, height: 300, background: 'var(--accent-softer)' }} />
            <div className="absolute rounded-full" aria-hidden="true"
              style={{ width: 230, height: 230, border: '1px solid var(--border-soft)' }} />
            <div className="relative flex flex-col items-center gap-5">
              <CobaltoMark size={104} rounded="rounded-[28px]" />
              <div className="text-center">
                <p className="font-extrabold leading-none" style={{ letterSpacing: '-0.03em', fontSize: 34 }}>
                  <span style={{ color: 'var(--brand-red)' }}>RED</span><span style={{ color: 'var(--accent-deep)' }}>COBALTO</span>
                </p>
                <p className="t-eyebrow mt-2.5" style={{ color: 'var(--text-tertiary)' }}>
                  INDUSTRIA QUÍMICA · COLOMBIA
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Métricas: fila completa bajo el hero ── */}
      <section className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
        {[
          { icon: Users,          value: stats.members,        label: 'Miembros'      },
          { icon: FlaskConical,   value: stats.posts,          label: 'Publicaciones' },
          { icon: Zap,            value: stats.interactions,   label: 'Interacciones' },
          { icon: MessageCircle,  value: stats.comments,       label: 'Comentarios'   },
          { icon: Building2,      value: stats.companies,      label: 'Empresas'      },
          { icon: MapPin,         value: stats.cities,         label: 'Ciudades'      },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="rounded-card p-3 md:p-4 border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border-soft)', boxShadow: 'var(--shadow-card)' }}>
            <Icon size={18} strokeWidth={2} style={{ color: 'var(--accent)' }} />
            <p className="font-extrabold leading-none mt-2 tnum"
              style={{ letterSpacing: '-0.04em', color: 'var(--text-primary)', fontSize: 'clamp(20px, 5.3vw, 30px)' }}>
              {formatMetric(value)}
            </p>
            <p className="text-[10px] md:text-[11px] mt-1 uppercase font-extrabold leading-tight"
              style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}>
              {label}
            </p>
          </div>
        ))}
      </section>

      {/* ── Ventajas ── */}
      <section>
        <h2 className="t-eyebrow mb-4" style={{ color: 'var(--text-tertiary)' }}>
          ¿Por qué Red Cobalto?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {ADVANTAGES.map(({ icon: Icon, title, sub }) => (
            <div key={title}
              className="rounded-card p-4 transition-all duration-[160ms] ease-premium hover:shadow-card-hover"
              style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-soft)' }}>
              <span className="flex items-center justify-center w-11 h-11 rounded-input mb-3"
                style={{ background: 'var(--accent-soft)' }}>
                <Icon size={24} strokeWidth={2} style={{ color: 'var(--accent-deep)' }} />
              </span>
              <p className="text-[15px] font-extrabold" style={{ color: 'var(--text-primary)' }}>{title}</p>
              <p className="text-[13px] mt-1 leading-snug" style={{ color: 'var(--text-tertiary)' }}>{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="py-12 px-6 text-center rounded-panel border relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--accent-deep), #223B68)', borderColor: 'rgba(36,87,197,0.18)', boxShadow: 'var(--shadow-raised)' }}>
        <div className="absolute -right-2 -top-2 opacity-[0.12]"><RedCobaltoLogo size="xl" dark markOnly /></div>
        <h2 className="text-[20px] md:text-[26px] font-extrabold text-white max-w-[480px] mx-auto leading-snug"
          style={{ letterSpacing: '-0.02em' }}>
          Únete a la comunidad química de Colombia
        </h2>
        <CTA onClick={onSignup} variant="onNavy" size="lg" className="mt-8">
          Crear cuenta gratis
        </CTA>
      </section>
    </div>
  )
}

export default function AuthScreen() {
  const [mode, setMode] = useState('landing') // landing | login | signup | reset
  // El estado inicial debe incluir TODAS las métricas que se renderizan: en el
  // primer render (antes de que responda la consulta) una clave faltante seria
  // undefined, y undefined.toLocaleString() rompe la pantalla completa.
  const [stats, setStats] = useState({ members: 0, posts: 0, interactions: 0, comments: 0, companies: 0, cities: 0 })

  useEffect(() => {
    getCommunityStats().then(setStats).catch(() => {})
  }, [])

  return (
    <div className="min-h-app flex flex-col" style={{ background: 'var(--bg-app)' }}>
      <TopBar onLogin={() => setMode('login')} onSignup={() => setMode('signup')} />

      {mode === 'terminos' ? (
        <LegalLayout title="Términos y Condiciones" updated={LEGAL_UPDATED} onBack={() => setMode('landing')}>
          <TerminosContent />
        </LegalLayout>
      ) : mode === 'privacidad' ? (
        <LegalLayout title="Política de Privacidad y Tratamiento de Datos" updated={LEGAL_UPDATED} onBack={() => setMode('landing')}>
          <PrivacidadContent />
        </LegalLayout>
      ) : mode === 'landing' ? (
        <>
          <Landing stats={stats} onSignup={() => setMode('signup')} />
          <Footer
            onTerminos={() => { setMode('terminos'); window.scrollTo({ top: 0 }) }}
            onPrivacidad={() => { setMode('privacidad'); window.scrollTo({ top: 0 }) }}
          />
        </>
      ) : (
        <div className="flex-1 flex items-start md:items-center justify-center px-4 py-8 md:py-12" style={{ background: 'radial-gradient(circle at top, rgba(36,87,197,0.06), transparent 34%), var(--bg-app)' }}>
          <div className="w-full max-w-md rounded-panel p-6 md:p-8 border" style={{ background: 'var(--surface)', borderColor: 'var(--border-soft)', boxShadow: 'var(--shadow-modal)' }}>
            <div className="flex items-center justify-between mb-6 pb-5 border-b" style={{ borderColor: 'var(--border-soft)' }}>
              <RedCobaltoLogo size="md" />
              <span className="text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: 'var(--text-tertiary)' }}>Acceso seguro</span>
            </div>
            {mode === 'login' && <LoginForm onSwitchSignup={() => setMode('signup')} onSwitchReset={() => setMode('reset')} />}
            {mode === 'signup' && <SignupForm onSwitchLogin={() => setMode('login')} />}
            {mode === 'reset' && <ResetForm onSwitchLogin={() => setMode('login')} />}
            <button onClick={() => setMode('landing')}
              className="mt-6 text-[13px] font-bold hover:underline transition-opacity"
              style={{ color: 'var(--accent-deep)' }}>
              ← Volver al inicio
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
