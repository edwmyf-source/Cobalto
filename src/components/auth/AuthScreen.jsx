import { useState, useEffect } from 'react'
import { Gift, Rocket, EyeOff, Lock, MessageCircle, FlaskConical, Users, Handshake, ArrowRight } from 'lucide-react'
import { getCommunityStats } from '../../api/stats'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import ResetForm from './ResetForm'

const ADVANTAGES = [
  { icon: Gift,           text: '100% gratis' },
  { icon: Rocket,         text: 'Registro en segundos' },
  { icon: EyeOff,         text: 'Identidad anónima opcional' },
  { icon: Lock,           text: 'Datos privados' },
  { icon: MessageCircle,  text: 'Chat interno seguro' },
  { icon: FlaskConical,   text: 'Enfoque en industria química' },
]

// Barra superior fija estilo LinkedIn: logo a la izquierda, acciones a la derecha
function TopBar({ onLogin, onSignup }) {
  return (
    <header className="w-full flex-shrink-0"
      style={{ background: 'radial-gradient(circle at 30% -40%, #1A5AC8 0%, #0B2E68 50%, #081F4A 100%)' }}>
      <div className="max-w-6xl mx-auto h-[70px] flex items-center justify-between px-4">
        <span className="font-extrabold text-[23px]" style={{ color: '#ffffff', letterSpacing: '-0.03em' }}>
          Cobalto<span style={{ color: '#7FB2FF' }}>.</span>
        </span>
        <div className="flex items-center gap-2.5">
          <button onClick={onLogin}
            className="px-[18px] py-2.5 rounded-[13px] text-[14px] font-extrabold transition-all"
            style={{ color: '#ffffff', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)' }}>
            Iniciar sesión
          </button>
          <button onClick={onSignup}
            className="px-[18px] py-2.5 rounded-[13px] text-[14px] font-extrabold transition-all"
            style={{ background: '#ffffff', color: '#0B2E68' }}>
            Unirse ahora
          </button>
        </div>
      </div>
    </header>
  )
}

// Landing compacto pensado para caber en una pantalla de PC (~700px de alto útil)
function Landing({ stats, onSignup }) {
  return (
    <div className="flex-1 min-h-0 max-w-6xl w-full mx-auto px-5 py-4 md:py-6 flex flex-col">

      {/* Hero */}
      <section className="flex-shrink-0 md:flex md:items-center md:gap-8">
        <div className="md:flex-1">
          <h1 className="text-[31px] md:text-[46px] font-extrabold leading-tight" style={{ color: '#0A2A5C', letterSpacing: '-0.03em' }}>
            Punto de encuentro<br />
            <span style={{ color: '#1A5AC8' }}>de la industria química.</span>
          </h1>
          <p className="mt-3 text-[16px] md:text-[17px] leading-snug font-medium" style={{ color: '#33456B' }}>
            Conecta con profesionales, laboratorios y proveedores del sector químico en Colombia.
          </p>
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            <span className="text-[16px] md:text-[17px] font-extrabold" style={{ color: '#0047AB' }}>Conecta</span>
            <span style={{ color: '#8FA3C7', fontSize: 16 }}>·</span>
            <span className="text-[16px] md:text-[17px] font-extrabold" style={{ color: '#1A5AC8' }}>Comparte</span>
            <span style={{ color: '#8FA3C7', fontSize: 16 }}>·</span>
            <span className="text-[16px] md:text-[17px] font-extrabold" style={{ color: '#4C82F0' }}>Crece</span>
          </div>
          <button onClick={onSignup}
            className="mt-4 inline-flex items-center gap-2 px-[26px] py-[13px] rounded-[15px] text-[17px] font-extrabold text-white transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg,#0B2E68,#1A5AC8)', boxShadow: '0 8px 24px rgba(11,46,104,0.35), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
            Unirse ahora <ArrowRight size={22} />
          </button>
        </div>

        {/* Métricas de comunidad */}
        <div className="mt-4 md:mt-0 grid grid-cols-2 gap-3 md:w-[280px] flex-shrink-0">
          <div className="rounded-[18px] p-3.5 text-center"
            style={{ background: 'linear-gradient(135deg,#0B2E68,#1A5AC8)', boxShadow: '0 10px 28px rgba(11,46,104,0.28), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
            <div className="flex justify-center mb-1"><Users size={18} color="#7FB2FF" /></div>
            <p className="text-2xl font-extrabold text-white leading-none">{stats.members.toLocaleString('es-CO')}</p>
            <p className="text-[11px] mt-1 uppercase tracking-wider font-extrabold" style={{ color: '#7FB2FF' }}>Miembros</p>
          </div>
          <div className="rounded-[18px] p-3.5 text-center"
            style={{ background: 'linear-gradient(135deg,#0B2E68,#1A5AC8)', boxShadow: '0 10px 28px rgba(11,46,104,0.28), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
            <div className="flex justify-center mb-1"><FlaskConical size={18} color="#7FB2FF" /></div>
            <p className="text-2xl font-extrabold text-white leading-none">{stats.posts.toLocaleString('es-CO')}</p>
            <p className="text-[11px] mt-1 uppercase tracking-wider font-extrabold" style={{ color: '#7FB2FF' }}>Publicaciones</p>
          </div>
        </div>
      </section>

      {/* Ventajas — estilo H2 (+10% base, texto +20% adicional) */}
      <section className="mt-4">
        <h2 className="text-[10px] font-extrabold uppercase mb-2.5" style={{ color: '#5578AD', letterSpacing: '0.12em' }}>
          ¿Por qué Cobalto?
        </h2>
        <div className="rounded-[18px] overflow-hidden" style={{ background: '#ffffff', boxShadow: '0 8px 24px rgba(0,71,171,0.09)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {[
              { n: '01', title: 'Gratis',       sub: 'Sin costos ocultos',        navy: true  },
              { n: '02', title: 'Rápido',       sub: 'En segundos',               navy: true  },
              { n: '03', title: 'Anónimo',      sub: 'Opcional',                  navy: true  },
              { n: '04', title: 'Privado',      sub: 'Datos protegidos',          navy: false },
              { n: '05', title: 'Chat seguro',  sub: 'Contacto interno',          navy: false },
              { n: '06', title: 'Química',      sub: 'Industria y lab',           navy: false },
            ].map((item, i) => {
              const isRight   = i % 2 === 1
              const isLastRow = i >= 4
              return (
                <div key={item.n} style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '9px 11px',
                  borderBottom: isLastRow ? 'none' : '1px solid #EBF1FC',
                  borderRight:  isRight   ? 'none' : '1px solid #EBF1FC',
                }}>
                  <div style={{
                    fontSize: 25,
                    fontWeight: 900,
                    lineHeight: 1,
                    flexShrink: 0,
                    color: item.navy ? '#0047AB' : '#4C82F0',
                  }}>{item.n}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0A2A5C', lineHeight: 1.15 }}>{item.title}</div>
                    <div style={{ fontSize: 10, color: '#8FA3C7', fontWeight: 600, lineHeight: 1.15 }}>{item.sub}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>


      {/* CTA final */}
      <section className="mt-4 md:mt-5 py-5 text-center rounded-[20px]"
        style={{ background: 'radial-gradient(circle at 30% -60%, #1A5AC8 0%, #0B2E68 55%, #081F4A 100%)',
          boxShadow: '0 12px 32px rgba(11,46,104,0.3)' }}>
        <h2 className="text-sm md:text-base font-extrabold text-white px-4">
          Únete a la comunidad química de Colombia
        </h2>
        <button onClick={onSignup}
          className="mt-3 px-6 py-2.5 rounded-[13px] text-[13px] md:text-sm font-extrabold transition-all active:scale-95"
          style={{ background: '#ffffff', color: '#0B2E68' }}>
          Crear cuenta gratis
        </button>
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
    <div className="min-h-screen flex flex-col" style={{ background: '#E4EBF7' }}>
      <TopBar onLogin={() => setMode('login')} onSignup={() => setMode('signup')} />

      {mode === 'landing' ? (
        <Landing stats={stats} onSignup={() => setMode('signup')} />
      ) : (
        <div className="flex-1 flex items-start md:items-center justify-center px-4 py-4 md:py-6">
          <div className="w-full max-w-md rounded-[22px] p-5 md:p-7" style={{ background: '#fff', boxShadow: '0 16px 44px rgba(8,31,74,0.16)' }}>
            {mode === 'login' && <LoginForm onSwitchSignup={() => setMode('signup')} onSwitchReset={() => setMode('reset')} />}
            {mode === 'signup' && <SignupForm onSwitchLogin={() => setMode('login')} />}
            {mode === 'reset' && <ResetForm onSwitchLogin={() => setMode('login')} />}
            <button onClick={() => setMode('landing')} className="mt-4 text-[12px] font-bold hover:underline" style={{ color: '#0047AB' }}>
              ← Volver al inicio
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
