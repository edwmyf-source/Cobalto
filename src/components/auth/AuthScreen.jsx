import { useState, useEffect } from 'react'
import { Gift, Rocket, EyeOff, Lock, MessageCircle, FlaskConical, Users, Handshake, ArrowRight } from 'lucide-react'
import { getCommunityStats } from '../../api/stats'
import CobaltoMark from '../shared/CobaltoMark'
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
    <header className="w-full flex-shrink-0" style={{ background: '#ffffff', borderBottom: '1px solid #F2F7FF' }}>
      <div className="max-w-6xl mx-auto h-12 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <CobaltoMark size={28} rounded="rounded-lg" />
          <span className="font-extrabold text-base tracking-wide hidden sm:block" style={{ color: '#001A3D' }}>COBALTO</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onLogin}
            className="px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-colors hover:bg-blue-50"
            style={{ color: '#001A3D', border: '1.5px solid #001A3D', background: '#fff' }}>
            Iniciar sesión
          </button>
          <button onClick={onSignup}
            className="px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: '#001A3D' }}>
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
          <h1 className="text-[26px] md:text-[38px] font-extrabold leading-tight" style={{ color: '#001A3D' }}>
            Punto de encuentro<br />
            <span style={{ color: '#3A6FAE' }}>de la industria química.</span>
          </h1>
          <p className="mt-2 text-[13px] md:text-[14px] leading-snug" style={{ color: '#5c6376' }}>
            Conecta con laboratorios, proveedores y profesionales del sector químico en Colombia.
            Publica, cotiza y contacta — todo en un solo lugar.
          </p>
          <button onClick={onSignup}
            className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: '#001A3D' }}>
            Unirse ahora <ArrowRight size={16} />
          </button>
        </div>

        {/* Métricas de comunidad */}
        <div className="mt-4 md:mt-0 grid grid-cols-2 gap-3 md:w-64 flex-shrink-0">
          <div className="rounded-2xl p-3 text-center" style={{ background: '#001A3D' }}>
            <div className="flex justify-center mb-1"><Handshake size={16} color="#7EB6FF" /></div>
            <p className="text-xl font-extrabold text-white leading-none">{stats.connections.toLocaleString('es-CO')}</p>
            <p className="text-[10px] mt-1 uppercase tracking-wider font-medium" style={{ color: '#7EB6FF' }}>Conexiones</p>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{ background: '#001A3D' }}>
            <div className="flex justify-center mb-1"><Users size={16} color="#7EB6FF" /></div>
            <p className="text-xl font-extrabold text-white leading-none">{stats.requests.toLocaleString('es-CO')}</p>
            <p className="text-[10px] mt-1 uppercase tracking-wider font-medium" style={{ color: '#7EB6FF' }}>Solicitudes</p>
          </div>
        </div>
      </section>

      {/* Ventajas — estilo editorial E1 */}
      <section className="mt-4 pt-3" style={{ borderTop: '1px solid #F2F7FF' }}>
        <h2 className="text-[11px] font-bold mb-3 tracking-widest" style={{ color: '#001A3D', letterSpacing: '0.18em' }}>
          ¿POR QUÉ COBALTO?
        </h2>
        <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #DDE7F4' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {[
              { n: '01', title: '100% gratis',         sub: 'Sin costos ocultos ni suscripciones',   navy: true  },
              { n: '02', title: 'Registro rápido',     sub: 'En segundos, sin formularios largos',   navy: true  },
              { n: '03', title: 'Anónimo opcional',    sub: 'Publica sin revelar tu empresa',        navy: true  },
              { n: '04', title: 'Datos privados',      sub: 'Teléfono y email nunca expuestos',      navy: false },
              { n: '05', title: 'Chat seguro',         sub: 'Contacto siempre por chat interno',     navy: false },
              { n: '06', title: 'Solo química',        sub: 'Industria y laboratorio',               navy: false },
            ].map((item, i) => {
              const isRight   = i % 2 === 1
              const isLastRow = i >= 4
              return (
                <div key={item.n} style={{
                  padding: '12px 14px',
                  borderBottom: isLastRow ? 'none' : '1px solid #F2F7FF',
                  borderRight:  isRight   ? 'none' : '1px solid #F2F7FF',
                }}>
                  <div className="text-[28px] font-black leading-none" style={{
                    color: item.navy ? '#001A3D' : '#FFB703',
                    letterSpacing: '-1px',
                  }}>{item.n}</div>
                  <div className="text-[12px] font-bold mt-1.5 leading-tight" style={{ color: '#001A3D' }}>{item.title}</div>
                  <div className="text-[10px] mt-0.5 leading-snug" style={{ color: '#5D8BC7' }}>{item.sub}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mt-4 md:mt-5 py-4 text-center rounded-2xl" style={{ background: '#001A3D' }}>
        <h2 className="text-sm md:text-base font-extrabold text-white px-4">
          Únete a la comunidad química de Colombia
        </h2>
        <button onClick={onSignup}
          className="mt-2 px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-opacity hover:opacity-90"
          style={{ background: '#FFB703', color: '#001A3D' }}>
          Crear cuenta gratis
        </button>
      </section>
    </div>
  )
}

export default function AuthScreen() {
  const [mode, setMode] = useState('landing') // landing | login | signup | reset
  const [stats, setStats] = useState({ connections: 0, requests: 0 })

  useEffect(() => {
    getCommunityStats().then(setStats).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#ffffff' }}>
      <TopBar onLogin={() => setMode('login')} onSignup={() => setMode('signup')} />

      {mode === 'landing' ? (
        <Landing stats={stats} onSignup={() => setMode('signup')} />
      ) : (
        <div className="flex-1 flex items-start md:items-center justify-center px-4 py-4 md:py-6">
          <div className="w-full max-w-md rounded-3xl p-5 md:p-7 shadow-lg" style={{ background: '#fff', border: '1.5px solid #CDDBEC' }}>
            {mode === 'login' && <LoginForm onSwitchSignup={() => setMode('signup')} onSwitchReset={() => setMode('reset')} />}
            {mode === 'signup' && <SignupForm onSwitchLogin={() => setMode('login')} />}
            {mode === 'reset' && <ResetForm onSwitchLogin={() => setMode('login')} />}
            <button onClick={() => setMode('landing')} className="mt-3 text-xs font-semibold hover:underline" style={{ color: '#001A3D' }}>
              ← Volver al inicio
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
