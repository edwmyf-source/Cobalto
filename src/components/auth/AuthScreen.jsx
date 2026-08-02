import { useState, useEffect } from 'react'
import { Gift, Rocket, BadgeCheck, Lock, MessageCircle, FlaskConical, Users, ArrowRight } from 'lucide-react'
import { getCommunityStats } from '../../api/stats'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import ResetForm from './ResetForm'

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

  const h = size === 'lg' ? 'h-[52px] px-8 text-[16px]' : 'h-[44px] px-6 text-[14px]'

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
      {Icon && <Icon size={20} strokeWidth={2.4} />}
    </button>
  )
}

// Barra superior fija: logo a la izquierda, acciones a la derecha
function TopBar({ onLogin, onSignup }) {
  return (
    <header className="w-full flex-shrink-0" style={{ background: 'var(--accent-deep)' }}>
      <div className="max-w-6xl mx-auto h-[72px] flex items-center justify-between px-4 md:px-6">
        <span className="font-extrabold text-[24px]" style={{ color: '#ffffff', letterSpacing: '-0.03em' }}>
          <span style={{ color: 'var(--brand-red)' }}>Red</span> Cobalto<span style={{ color: 'var(--accent-mist)' }}>.</span>
        </span>
        <div className="flex items-center gap-2">
          <CTA onClick={onLogin} variant="ghostNavy" className="!px-4">Iniciar sesión</CTA>
          <CTA onClick={onSignup} variant="onNavy" className="!px-4">Unirse ahora</CTA>
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
          <h1 className="text-left font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 0.92 }}>
            <span className="block text-[46px] md:text-[62px]">Punto de</span>
            <span className="block text-[46px] md:text-[62px]">encuentro</span>
            <span className="block text-[24px] md:text-[34px] mt-2" style={{ color: 'var(--accent)' }}>
              de la industria química.
            </span>
          </h1>

          <p className="mt-6 text-[16px] md:text-[18px] leading-relaxed max-w-[520px]" style={{ color: 'var(--text-secondary)' }}>
            Conecta con profesionales, laboratorios y proveedores del sector químico en Colombia.
          </p>

          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <span className="text-[15px] font-extrabold" style={{ color: 'var(--accent-deep)' }}>Conecta</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="text-[15px] font-extrabold" style={{ color: 'var(--accent)' }}>Comparte</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="text-[15px] font-extrabold" style={{ color: 'var(--accent-light)' }}>Crece</span>
          </div>

          <CTA onClick={onSignup} size="lg" icon={ArrowRight} className="mt-8">
            Unirse ahora
          </CTA>
        </div>

        {/* ── Métricas: el número es el protagonista ── */}
        <div className="mt-8 md:mt-0 grid grid-cols-2 gap-4 md:w-[300px] flex-shrink-0">
          {[
            { icon: Users,        value: stats.members, label: 'Miembros'      },
            { icon: FlaskConical, value: stats.posts,   label: 'Publicaciones' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="rounded-card p-6"
              style={{ background: 'var(--accent-deep)', boxShadow: 'var(--shadow-raised)' }}>
              <Icon size={20} strokeWidth={2} style={{ color: 'var(--accent-pale)' }} />
              <p className="text-[36px] md:text-[40px] font-extrabold text-white leading-none mt-4 tnum"
                style={{ letterSpacing: '-0.03em' }}>
                {value.toLocaleString('es-CO')}
              </p>
              <p className="text-[12px] mt-2 uppercase font-extrabold"
                style={{ color: 'var(--accent-mist)', letterSpacing: '0.1em' }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ventajas ── */}
      <section>
        <h2 className="t-eyebrow mb-4" style={{ color: 'var(--text-tertiary)' }}>
          ¿Por qué Red Cobalto?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {ADVANTAGES.map(({ icon: Icon, title, sub }) => (
            <div key={title}
              className="rounded-card p-6 transition-all duration-[160ms] ease-premium hover:shadow-card-hover"
              style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-soft)' }}>
              <span className="flex items-center justify-center w-10 h-10 rounded-input mb-4"
                style={{ background: 'var(--accent-soft)' }}>
                <Icon size={20} strokeWidth={2} style={{ color: 'var(--accent-deep)' }} />
              </span>
              <p className="text-[15px] font-extrabold" style={{ color: 'var(--text-primary)' }}>{title}</p>
              <p className="text-[13px] mt-1 leading-snug" style={{ color: 'var(--text-tertiary)' }}>{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="py-12 px-6 text-center rounded-panel"
        style={{ background: 'var(--accent-deep)', boxShadow: 'var(--shadow-raised)' }}>
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
  const [stats, setStats] = useState({ members: 0, posts: 0 })

  useEffect(() => {
    getCommunityStats().then(setStats).catch(() => {})
  }, [])

  return (
    <div className="min-h-app flex flex-col" style={{ background: 'var(--bg-app)' }}>
      <TopBar onLogin={() => setMode('login')} onSignup={() => setMode('signup')} />

      {mode === 'landing' ? (
        <Landing stats={stats} onSignup={() => setMode('signup')} />
      ) : (
        <div className="flex-1 flex items-start md:items-center justify-center px-4 py-8 md:py-12">
          <div className="w-full max-w-md rounded-modal p-6 md:p-8" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-modal)' }}>
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
