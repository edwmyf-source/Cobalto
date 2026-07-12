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
  { icon: Lock,           text: 'Teléfono y email nunca expuestos' },
  { icon: MessageCircle,  text: 'Contacto siempre por chat interno' },
  { icon: FlaskConical,   text: 'Categorías para industria y laboratorio' },
]

// Barra superior fija estilo LinkedIn: logo a la izquierda, acciones a la derecha
function TopBar({ onLogin, onSignup }) {
  return (
    <header className="sticky top-0 z-40 w-full" style={{ background: '#ffffff', borderBottom: '1px solid #F2F7FF' }}>
      <div className="max-w-5xl mx-auto h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <CobaltoMark size={32} rounded="rounded-lg" />
          <span className="font-extrabold text-lg tracking-wide hidden sm:block" style={{ color: '#001A3D' }}>COBALTO</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onLogin}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-colors hover:bg-blue-50"
            style={{ color: '#2F80ED', border: '1.5px solid #2F80ED', background: '#fff' }}>
            Iniciar sesión
          </button>
          <button onClick={onSignup}
            className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: '#2F80ED' }}>
            Unirse ahora
          </button>
        </div>
      </div>
    </header>
  )
}

// Página promocional (landing) que se ve antes de entrar, al estilo LinkedIn
function Landing({ stats, onSignup }) {
  return (
    <div className="max-w-5xl mx-auto px-5 pb-16">

      {/* Hero */}
      <section className="pt-10 pb-8 text-center md:text-left md:flex md:items-center md:gap-10">
        <div className="md:flex-1">
          <h1 className="text-[32px] md:text-[44px] font-extrabold leading-tight" style={{ color: '#001A3D' }}>
            Punto de encuentro<br />
            <span style={{ color: '#2F80ED' }}>de la industria química.</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed" style={{ color: '#5c6376' }}>
            Conecta con laboratorios, proveedores y profesionales del sector químico en Colombia.
            Publica, cotiza y contacta — todo en un solo lugar.
          </p>
          <button onClick={onSignup}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: '#2F80ED' }}>
            Unirse ahora <ArrowRight size={16} />
          </button>
        </div>

        {/* Métricas de comunidad */}
        <div className="mt-8 md:mt-0 grid grid-cols-2 gap-3 md:w-72 flex-shrink-0">
          <div className="rounded-2xl p-4 text-center" style={{ background: '#001A3D' }}>
            <div className="flex justify-center mb-1"><Handshake size={18} color="#7EB6FF" /></div>
            <p className="text-2xl font-extrabold text-white leading-none">{stats.connections.toLocaleString('es-CO')}</p>
            <p className="text-[10px] mt-1.5 uppercase tracking-wider font-medium" style={{ color: '#7EB6FF' }}>Conexiones</p>
          </div>
          <div className="rounded-2xl p-4 text-center" style={{ background: '#001A3D' }}>
            <div className="flex justify-center mb-1"><Users size={18} color="#7EB6FF" /></div>
            <p className="text-2xl font-extrabold text-white leading-none">{stats.requests.toLocaleString('es-CO')}</p>
            <p className="text-[10px] mt-1.5 uppercase tracking-wider font-medium" style={{ color: '#7EB6FF' }}>Solicitudes</p>
          </div>
        </div>
      </section>

      {/* Ventajas */}
      <section className="py-8" style={{ borderTop: '1px solid #F2F7FF' }}>
        <h2 className="text-xl font-extrabold mb-5 text-center md:text-left" style={{ color: '#001A3D' }}>
          Hecho para el sector químico
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {ADVANTAGES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 rounded-2xl px-4 py-3.5" style={{ background: '#F2F7FF' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#001A3D' }}>
                <Icon size={16} color="#7EB6FF" />
              </div>
              <span className="text-[13px] font-medium" style={{ color: '#001A3D' }}>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="py-10 text-center rounded-3xl" style={{ background: '#001A3D' }}>
        <h2 className="text-xl md:text-2xl font-extrabold text-white px-6">
          Únete a la comunidad química de Colombia
        </h2>
        <button onClick={onSignup}
          className="mt-5 px-6 py-3 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
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
    <div className="min-h-screen" style={{ background: '#ffffff' }}>
      <TopBar onLogin={() => setMode('login')} onSignup={() => setMode('signup')} />

      {mode === 'landing' ? (
        <Landing stats={stats} onSignup={() => setMode('signup')} />
      ) : (
        <div className="flex items-start justify-center px-4 py-8">
          <div className="w-full max-w-md rounded-3xl p-6 md:p-8 shadow-lg" style={{ background: '#fff', border: '1px solid #F2F7FF' }}>
            {mode === 'login' && <LoginForm onSwitchSignup={() => setMode('signup')} onSwitchReset={() => setMode('reset')} />}
            {mode === 'signup' && <SignupForm onSwitchLogin={() => setMode('login')} />}
            {mode === 'reset' && <ResetForm onSwitchLogin={() => setMode('login')} />}
            <button onClick={() => setMode('landing')} className="mt-4 text-xs font-semibold hover:underline" style={{ color: '#2F80ED' }}>
              ← Volver al inicio
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
