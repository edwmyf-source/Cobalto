import { useState, useEffect } from 'react'
import { Mail, KeyRound, Phone, ArrowLeft } from 'lucide-react'
import { signIn, signInWithMagicLink, sendPhoneCode, verifyPhoneCode, normalizePhone, sendEmailCode, verifyEmailCode } from '../../api/auth'
import { PHONE_AUTH_ENABLED, EMAIL_CODE_AUTH_ENABLED } from '../../lib/constants'
import Spinner from '../shared/Spinner'

const ERR_MAP = {
  'Invalid login credentials': 'Email o contraseña incorrectos.',
  'Email not confirmed': 'Confirma tu email antes de iniciar sesión.',
  'Token has expired or is invalid': 'El código expiró o no es válido. Pide uno nuevo.',
  'Unsupported phone provider': 'El envío de SMS no está configurado aún.',
}

const LAST_EMAIL_KEY = 'cobalto-last-email'

export default function LoginForm({ onSwitchSignup, onSwitchReset }) {
  const [mode, setMode]     = useState('password') // 'password' | 'magic' | 'phone'
  const [phone, setPhone]   = useState('')
  const [code, setCode]     = useState('')
  const [codeSent, setCodeSent] = useState(false)
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
      if (mode === 'emailcode') {
        if (!codeSent) {
          await sendEmailCode(email)
          setCodeSent(true)
        } else {
          await verifyEmailCode(email, code)
        }
      } else if (mode === 'phone') {
        if (!codeSent) {
          await sendPhoneCode(phone)
          setCodeSent(true)
        } else {
          await verifyPhoneCode(phone, code)
        }
      } else if (mode === 'magic') {
        await signInWithMagicLink(email)
        setSent(true)
        try { localStorage.setItem(LAST_EMAIL_KEY, email) } catch {}
      } else {
        await signIn(email, pass)
        try { localStorage.setItem(LAST_EMAIL_KEY, email) } catch {}
      }
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

      {codeSent ? (
        <div>
          <label className="block text-[12px] font-bold text-[#0A2A5C] mb-1.5">Código de 6 dígitos</label>
          <input type="text" value={code} inputMode="numeric" autoComplete="one-time-code" required autoFocus
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="w-full px-3 py-3 rounded-[14px] border border-ink-200 bg-ink-50 text-center text-2xl font-mono tracking-[0.4em] text-ink-900 focus:outline-none focus:border-brand-600 focus:bg-white transition-colors" />
          <p className="text-[11px] mt-1.5 text-[#8FA3C7]">
            Enviado a {mode === 'phone' ? normalizePhone(phone) : email}
          </p>
        </div>
      ) : mode === 'phone' ? (
        <div>
          <label className="block text-[12px] font-bold text-[#0A2A5C] mb-1.5">Número de celular</label>
          <input type="tel" value={phone} inputMode="tel" autoComplete="tel" required
            onChange={e => setPhone(e.target.value.replace(/[^0-9+ ]/g, '').slice(0, 16))}
            placeholder="300 123 4567" className={inputCls} />
          <p className="text-[11px] mt-1.5 text-[#8FA3C7]">Colombia (+57) por defecto.</p>
        </div>
      ) : (
        <div>
          <label className="block text-[12px] font-bold text-[#0A2A5C] mb-1.5">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            placeholder="tu@empresa.com" className={inputCls} autoComplete="email" />
        </div>
      )}

      {mode === 'password' && !codeSent && (
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

      <button type="submit" disabled={loading || (codeSent ? code.length < 6 : mode === 'phone' ? phone.replace(/\D/g,'').length < 10 : !email)}
        className="w-full flex items-center justify-center gap-2 text-white text-[14px] font-extrabold py-3 rounded-[14px] disabled:opacity-50 transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg,#0B2E68,#1A5AC8)', boxShadow: '0 8px 20px rgba(11,46,104,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
        {loading ? <Spinner size={16} />
          : codeSent ? 'Verificar y entrar'
          : mode === 'phone' ? 'Enviarme el código'
          : mode === 'emailcode' ? 'Enviarme el código'
          : mode === 'magic' ? 'Enviar enlace de acceso' : 'Entrar'}
      </button>

      {/* Cambiar entre contraseña y enlace mágico */}
      <div className="relative flex items-center gap-3 py-1">
        <div className="flex-1 h-px" style={{ background: '#DDE7FA' }} />
        <span className="text-[10px] font-medium" style={{ color: '#8FA3C7' }}>o</span>
        <div className="flex-1 h-px" style={{ background: '#DDE7FA' }} />
      </div>

      {codeSent ? (
        <button type="button"
          onClick={() => { setCodeSent(false); setCode(''); setError('') }}
          className="w-full flex items-center justify-center gap-2 text-[13px] font-bold py-3 rounded-[14px] transition-all active:scale-95"
          style={{ boxShadow: 'inset 0 0 0 1.5px #DDE7FA', color: '#0047AB', background: '#fff' }}>
          <ArrowLeft size={15} /> {mode === 'phone' ? 'Cambiar número' : 'Cambiar correo'}
        </button>
      ) : mode === 'phone' ? (
        <button type="button"
          onClick={() => { setMode('password'); setError('') }}
          className="w-full flex items-center justify-center gap-2 text-[13px] font-bold py-3 rounded-[14px] transition-all active:scale-95"
          style={{ boxShadow: 'inset 0 0 0 1.5px #DDE7FA', color: '#0047AB', background: '#fff' }}>
          <ArrowLeft size={15} /> Entrar con correo
        </button>
      ) : mode === 'emailcode' ? (
        <button type="button"
          onClick={() => { setMode('password'); setError('') }}
          className="w-full flex items-center justify-center gap-2 text-[13px] font-bold py-3 rounded-[14px] transition-all active:scale-95"
          style={{ boxShadow: 'inset 0 0 0 1.5px #DDE7FA', color: '#0047AB', background: '#fff' }}>
          <KeyRound size={15} /> Entrar con contraseña
        </button>
      ) : (
        <div className="space-y-2">
          <button type="button"
            onClick={() => { setMode(m => m === 'magic' ? 'password' : 'magic'); setError('') }}
            className="w-full flex items-center justify-center gap-2 text-[13px] font-bold py-3 rounded-[14px] transition-all active:scale-95"
            style={{ boxShadow: 'inset 0 0 0 1.5px #DDE7FA', color: '#0047AB', background: '#fff' }}>
            {mode === 'magic'
              ? <><KeyRound size={15} /> Entrar con contraseña</>
              : <><Mail size={15} /> Entrar solo con mi email</>}
          </button>
          {EMAIL_CODE_AUTH_ENABLED && (
            <button type="button"
              onClick={() => { setMode('emailcode'); setCodeSent(false); setError('') }}
              className="w-full flex items-center justify-center gap-2 text-[13px] font-bold py-3 rounded-[14px] transition-all active:scale-95"
              style={{ boxShadow: 'inset 0 0 0 1.5px #DDE7FA', color: '#0047AB', background: '#fff' }}>
              <Mail size={15} /> Recibir código por correo
            </button>
          )}
          {PHONE_AUTH_ENABLED && (
            <button type="button"
              onClick={() => { setMode('phone'); setCodeSent(false); setError('') }}
              className="w-full flex items-center justify-center gap-2 text-[13px] font-bold py-3 rounded-[14px] transition-all active:scale-95"
              style={{ boxShadow: 'inset 0 0 0 1.5px #DDE7FA', color: '#0047AB', background: '#fff' }}>
              <Phone size={15} /> Entrar con mi celular
            </button>
          )}
        </div>
      )}

      <div className="text-center text-[12px] pt-4 font-medium text-[#8FA3C7]" style={{ borderTop: '1px solid #EBF1FC' }}>
        ¿Sin cuenta?{' '}
        <button type="button" onClick={onSwitchSignup} className="font-bold hover:underline text-[#0047AB]">
          Crear cuenta
        </button>
      </div>
    </form>
  )
}
