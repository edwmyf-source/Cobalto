import { useState, useEffect } from 'react'
import { Mail, KeyRound } from 'lucide-react'
import { signIn, signInWithMagicLink } from '../../api/auth'
import Spinner from '../shared/Spinner'

const ERR_MAP = {
  'Invalid login credentials': 'Email o contraseña incorrectos.',
  'Email not confirmed': 'Confirma tu email antes de iniciar sesión.',
}

const LAST_EMAIL_KEY = 'cobalto-last-email'

export default function LoginForm({ onSwitchSignup, onSwitchReset }) {
  const [mode, setMode]     = useState('password') // 'password' | 'magic'
  const [email, setEmail]   = useState('')
  const [pass, setPass]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [sent, setSent]     = useState(false)

  // Recuerda el último email usado para no volver a escribirlo
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LAST_EMAIL_KEY)
      if (saved) setEmail(saved)
    } catch {}
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'magic') {
        await signInWithMagicLink(email)
        setSent(true)
      } else {
        await signIn(email, pass)
      }
      try { localStorage.setItem(LAST_EMAIL_KEY, email) } catch {}
    } catch (err) {
      setError(ERR_MAP[err.message] || err.message)
    }
    setLoading(false)
  }

  const inputCls = 'w-full px-4 py-3 rounded-[14px] border border-ink-200 bg-ink-50 text-ink-900 placeholder-ink-400 text-[14px] font-medium focus:outline-none focus:border-brand-600 focus:bg-white transition-colors'

  if (sent) {
    return (
      <div className="space-y-4 text-center py-4">
        <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ background: '#EBF1FC' }}>
          <Mail size={22} style={{ color: '#0047AB' }} />
        </div>
        <div>
          <h2 className="font-extrabold text-[20px] text-[#0A2A5C]" style={{ letterSpacing: '-0.02em' }}>Revisa tu correo</h2>
          <p className="text-[12px] mt-1.5 font-medium text-[#8FA3C7] leading-relaxed">
            Enviamos un enlace de acceso a<br />
            <span className="font-semibold" style={{ color: '#0047AB' }}>{email}</span>
          </p>
          <p className="text-[11px] mt-2 text-[#8FA3C7]">Tócalo desde este mismo dispositivo para entrar.</p>
        </div>
        <button type="button" onClick={() => { setSent(false); setMode('password') }}
          className="text-[12px] font-bold hover:underline text-[#0047AB]">
          ← Usar contraseña
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h2 className="font-extrabold text-[20px] text-[#0A2A5C]" style={{ letterSpacing: '-0.02em' }}>Iniciar sesión</h2>
        <p className="text-[12px] mt-1 font-medium text-[#8FA3C7]">Bienvenido de vuelta</p>
      </div>

      <div>
        <label className="block text-[12px] font-bold text-[#0A2A5C] mb-1.5">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
          placeholder="tu@empresa.com" className={inputCls} autoComplete="email" />
      </div>

      {mode === 'password' && (
        <div>
          <label className="block text-[12px] font-bold text-[#0A2A5C] mb-1.5">Contraseña</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} required
            placeholder="••••••••" className={inputCls} autoComplete="current-password" />
          <button type="button" onClick={onSwitchReset} className="text-[12px] font-bold hover:underline mt-2 inline-block text-[#0047AB]">
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      )}

      {error && <p className="text-[12px] font-semibold text-red-500">{error}</p>}

      <button type="submit" disabled={loading || !email}
        className="w-full flex items-center justify-center gap-2 text-white text-[14px] font-extrabold py-3 rounded-[14px] disabled:opacity-50 transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg,#0B2E68,#1A5AC8)', boxShadow: '0 8px 20px rgba(11,46,104,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
        {loading ? <Spinner size={16} /> : mode === 'magic' ? 'Enviar enlace de acceso' : 'Entrar'}
      </button>

      {/* Cambiar entre contraseña y enlace mágico */}
      <div className="relative flex items-center gap-3 py-1">
        <div className="flex-1 h-px" style={{ background: '#DDE7FA' }} />
        <span className="text-[10px] font-medium" style={{ color: '#8FA3C7' }}>o</span>
        <div className="flex-1 h-px" style={{ background: '#DDE7FA' }} />
      </div>

      <button type="button"
        onClick={() => { setMode(m => m === 'magic' ? 'password' : 'magic'); setError('') }}
        className="w-full flex items-center justify-center gap-2 text-[13px] font-bold py-3 rounded-[14px] transition-all active:scale-95"
        style={{ boxShadow: 'inset 0 0 0 1.5px #DDE7FA', color: '#0047AB', background: '#fff' }}>
        {mode === 'magic'
          ? <><KeyRound size={15} /> Entrar con contraseña</>
          : <><Mail size={15} /> Entrar solo con mi email</>}
      </button>

      <div className="text-center text-[12px] pt-4 font-medium text-[#8FA3C7]" style={{ borderTop: '1px solid #EBF1FC' }}>
        ¿Sin cuenta?{' '}
        <button type="button" onClick={onSwitchSignup} className="font-bold hover:underline text-[#0047AB]">
          Crear cuenta
        </button>
      </div>
    </form>
  )
}
