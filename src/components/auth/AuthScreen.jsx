import { useState, useEffect } from 'react'
import { Gift, Rocket, EyeOff, Lock, MessageCircle, FlaskConical } from 'lucide-react'
import { getCommunityStats } from '../../api/stats'
import RodioMark from '../shared/RodioMark'
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
const ADVANTAGE_GROUPS = [ADVANTAGES.slice(0, 3), ADVANTAGES.slice(3, 6)]

export default function AuthScreen() {
  const [mode, setMode] = useState('login')
  const [stats, setStats] = useState({ connections: 0, requests: 0 })
  const [groupIdx, setGroupIdx] = useState(0)

  useEffect(() => {
    getCommunityStats().then(setStats).catch(() => {})
  }, [])

  // Rotar las ventajas de a 3, cada 5 segundos
  useEffect(() => {
    const id = setInterval(() => setGroupIdx(i => (i + 1) % ADVANTAGE_GROUPS.length), 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-screen bg-ink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-3xl overflow-hidden border border-white/10 flex flex-col md:flex-row shadow-2xl">

        {/* PANEL IZQUIERDO */}
        <div className="bg-sidebar text-white p-5 md:p-10 md:w-[45%] flex flex-col justify-center">
          <div className="flex items-center gap-2.5 mb-5 md:mb-8">
            <RodioMark size={46} />
            <span className="font-extrabold text-[26px] tracking-wide">RODIO</span>
          </div>

          {/* Headline principal */}
          <div className="mb-4 md:mb-6">
            <p className="text-2xl md:text-[30px] font-extrabold leading-tight text-white mb-1">
              Punto de encuentro
            </p>
            <p className="text-2xl md:text-[30px] font-extrabold leading-tight" style={{ color: '#a78bfa' }}>
              de la industria química.
            </p>
          </div>

          <div className="w-10 h-[3px] bg-brand-600 rounded-full mb-4 md:mb-5"></div>

          {/* Métricas — solo desktop */}
          <div className="hidden md:grid grid-cols-2 gap-2.5 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
              <p className="text-[22px] font-medium text-white leading-none tracking-tight">
                {stats.connections.toLocaleString('es-CO')}
              </p>
              <p className="text-[10px] mt-1.5 uppercase tracking-wider font-medium" style={{ color: '#8a7fb0' }}>Conexiones</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
              <p className="text-[22px] font-medium text-white leading-none tracking-tight">
                {stats.requests.toLocaleString('es-CO')}
              </p>
              <p className="text-[10px] mt-1.5 uppercase tracking-wider font-medium" style={{ color: '#8a7fb0' }}>Solicitudes</p>
            </div>
          </div>

          <div key={groupIdx} className="hidden md:flex flex-col space-y-3 transition-opacity duration-500">
            {ADVANTAGE_GROUPS[groupIdx].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5">
                <Icon size={16} className="text-brand-500 flex-shrink-0" />
                <span className="text-xs" style={{ color: '#c4b5fd' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="p-5 md:p-10 md:w-[55%] flex flex-col justify-center bg-white">
          {mode === 'login' && <LoginForm onSwitchSignup={() => setMode('signup')} onSwitchReset={() => setMode('reset')} />}
          {mode === 'signup' && <SignupForm onSwitchLogin={() => setMode('login')} />}
          {mode === 'reset' && <ResetForm onSwitchLogin={() => setMode('login')} />}
        </div>

      </div>
    </div>
  )
}
