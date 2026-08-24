import { useState, useEffect } from 'react'
import { Mail, KeyRound, Phone, ArrowLeft } from 'lucide-react'
import { signIn, signInWithMagicLink, sendPhoneCode, verifyPhoneCode, normalizePhone, sendEmailCode, verifyEmailCode, signInWithGoogle } from '../../api/auth'
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
  const [mode, setMode]     = useState('emailcode') // 'password' | 'magic' | 'phone' | 'emailcode'
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

  const inputCls = 'w-full px-4 py-3 rounded-btn border border-ink-200 bg-ink-50 text-ink-900 placeholder-ink-400 text-[14px] font-medium focus:outline-none focus:border-brand-600 focus:bg-white transition-colors'

  if (sent) {
    return (
      <div className="space-y-4 text-center py-4">
        <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ background: 'var(--accent-soft)' }}>
          <Mail size={22} style={{ color: 'var(--accent-deep)' }} />
        </div>
        <div>
          <h2 className="font-extrabold text-[20px] text-[var(--text-primary)]" style={{ letterSpacing: '-0.02em' }}>Revisa tu correo</h2>
          <p className="text-[12px] mt-1.5 font-medium text-[var(--text-tertiary)] leading-relaxed">
            Enviamos un enlace de acceso a<br />
            <span className="font-semibold" style={{ color: 'var(--accent-deep)' }}>{email}</span>
          </p>
          <p className="text-[12px] mt-2 text-[var(--text-tertiary)]">Tócalo desde este mismo dispositivo para entrar.</p>
        </div>
        <button type="button" onClick={() => { setSent(false); setMode('password') }}
          className="text-[12px] font-bold hover:underline text-[var(--accent-deep)]">
          ← Usar contraseña
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h2 className="font-extrabold text-[20px] text-[var(--text-primary)]" style={{ letterSpacing: '-0.02em' }}>Iniciar sesión</h2>
        <p className="text-[12px] mt-1 font-medium text-[var(--text-tertiary)]">Bienvenido de vuelta</p>
      </div>

      {codeSent ? (
        <div>
          <label className="block text-[12px] font-bold text-[var(--text-primary)] mb-1.5">Código de 6 dígitos</label>
          <input type="text" value={code} inputMode="numeric" autoComplete="one-time-code" required autoFocus
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="w-full px-3 py-3 rounded-btn border border-ink-200 bg-ink-50 text-center text-2xl font-mono tracking-[0.4em] text-ink-900 focus:outline-none focus:border-brand-600 focus:bg-white transition-colors" />
          <p className="text-[12px] mt-1.5 text-[var(--text-tertiary)]">
            Enviado a {mode === 'phone' ? normalizePhone(phone) : email}
          </p>
        </div>
      ) : mode === 'phone' ? (
        <div>
          <label className="block text-[12px] font-bold text-[var(--text-primary)] mb-1.5">Número de celular</label>
          <input type="tel" value={phone} inputMode="tel" autoComplete="tel" required
            onChange={e => setPhone(e.target.value.replace(/[^0-9+ ]/g, '').slice(0, 16))}
            placeholder="300 123 4567" className={inputCls} />
          <p className="text-[12px] mt-1.5 text-[var(--text-tertiary)]">Colombia (+57) por defecto.</p>
        </div>
      ) : (
        <div>
          <label className="block text-[12px] font-bold text-[var(--text-primary)] mb-1.5">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            placeholder="tu@empresa.com" className={inputCls} autoComplete="email" />
        </div>
      )}

      {mode === 'password' && !codeSent && (
        <div>
          <label className="block text-[12px] font-bold text-[var(--text-primary)] mb-1.5">Contraseña</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} required
            placeholder="••••••••" className={inputCls} autoComplete="current-password" />
          <button type="button" onClick={onSwitchReset} className="text-[12px] font-bold hover:underline mt-2 inline-block text-[var(--accent-deep)]">
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      )}

      {error && <p className="text-[12px] font-semibold text-red-500">{error}</p>}

      <button type="submit" disabled={loading || (codeSent ? code.length < 6 : mode === 'phone' ? phone.replace(/\D/g,'').length < 10 : !email)}
        className="w-full flex items-center justify-center gap-2 text-white text-[14px] font-extrabold h-[38px] rounded-btn disabled:opacity-50 transition-all active:scale-95"
        style={{ background: 'var(--accent-deep)', boxShadow: 'var(--shadow-raised)' }}>
        {loading ? <Spinner size={16} />
          : codeSent ? 'Verificar y entrar'
          : mode === 'phone' ? 'Enviarme el código'
          : mode === 'emailcode' ? 'Enviarme el código'
          : mode === 'magic' ? 'Enviar enlace de acceso' : 'Entrar'}
      </button>

      {/* Cambiar entre contraseña y enlace mágico */}
      <div className="relative flex items-center gap-3 py-1">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-[12px] font-medium" style={{ color: 'var(--text-tertiary)' }}>o</span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      {!codeSent && (
        <button type="button"
          onClick={async () => { try { await signInWithGoogle() } catch (e) { setError(e.message) } }}
          className="w-full flex items-center justify-center gap-2 text-[14px] font-bold h-[38px] rounded-btn transition-all active:scale-95"
          style={{ boxShadow: 'inset 0 0 0 1px var(--border)', color: 'var(--accent-deep)', background: '#fff' }}>
          <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h11.8c-.5 2.7-2 5.1-4.4 6.6v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.3z"/>
            <path fill="#34A853" d="M24 46c6 0 11-2 14.6-5.2l-7.1-5.5c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.7-3.9-12.4-9.700H4.3v5.7C7.9 41 15.4 46 24 46z"/>
            <path fill="#FBBC05" d="M11.6 27.7c-.5-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2v-5.7H4.3C2.8 16.6 2 20.2 2 23.5s.8 6.9 2.3 9.9l7.3-5.7z"/>
            <path fill="#EA4335" d="M24 10.3c3.3 0 6.2 1.1 8.5 3.3l6.3-6.3C35 3.7 30 1.5 24 1.5 15.4 1.5 7.9 6.5 4.3 13.6l7.3 5.7c1.7-5.8 6.6-9 12.4-9z"/>
          </svg>
          Continuar con Google
        </button>
      )}

      {codeSent ? (
        <button type="button"
          onClick={() => { setCodeSent(false); setCode(''); setError('') }}
          className="w-full flex items-center justify-center gap-2 text-[14px] font-bold h-[38px] rounded-btn transition-all active:scale-95"
          style={{ boxShadow: 'inset 0 0 0 1px var(--border)', color: 'var(--accent-deep)', background: '#fff' }}>
          <ArrowLeft size={15} /> {mode === 'phone' ? 'Cambiar número' : 'Cambiar correo'}
        </button>
      ) : mode === 'phone' ? (
        <button type="button"
          onClick={() => { setMode('emailcode'); setError('') }}
          className="w-full flex items-center justify-center gap-2 text-[14px] font-bold h-[38px] rounded-btn transition-all active:scale-95"
          style={{ boxShadow: 'inset 0 0 0 1px var(--border)', color: 'var(--accent-deep)', background: '#fff' }}>
          <ArrowLeft size={15} /> Entrar con correo
        </button>
      ) : mode === 'emailcode' ? (
        <div className="space-y-2">
          <button type="button"
            onClick={() => { setMode('password'); setError('') }}
            className="w-full flex items-center justify-center gap-2 text-[14px] font-bold h-[38px] rounded-btn transition-all active:scale-95"
            style={{ boxShadow: 'inset 0 0 0 1px var(--border)', color: 'var(--accent-deep)', background: '#fff' }}>
            <KeyRound size={15} /> Entrar con contraseña
          </button>
          {PHONE_AUTH_ENABLED && (
            <button type="button"
              onClick={() => { setMode('phone'); setCodeSent(false); setError('') }}
              className="w-full flex items-center justify-center gap-2 text-[14px] font-bold h-[38px] rounded-btn transition-all active:scale-95"
              style={{ boxShadow: 'inset 0 0 0 1px var(--border)', color: 'var(--accent-deep)', background: '#fff' }}>
              <Phone size={15} /> Entrar con mi celular
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <button type="button"
            onClick={() => { setMode(m => m === 'magic' ? 'password' : 'magic'); setError('') }}
            className="w-full flex items-center justify-center gap-2 text-[14px] font-bold h-[38px] rounded-btn transition-all active:scale-95"
            style={{ boxShadow: 'inset 0 0 0 1px var(--border)', color: 'var(--accent-deep)', background: '#fff' }}>
            {mode === 'magic'
              ? <><KeyRound size={15} /> Entrar con contraseña</>
              : <><Mail size={15} /> Entrar solo con mi email</>}
          </button>
          {EMAIL_CODE_AUTH_ENABLED && (
            <button type="button"
              onClick={() => { setMode('emailcode'); setCodeSent(false); setError('') }}
              className="w-full flex items-center justify-center gap-2 text-[14px] font-bold h-[38px] rounded-btn transition-all active:scale-95"
              style={{ boxShadow: 'inset 0 0 0 1px var(--border)', color: 'var(--accent-deep)', background: '#fff' }}>
              <Mail size={15} /> Recibir código por correo
            </button>
          )}
          {PHONE_AUTH_ENABLED && (
            <button type="button"
              onClick={() => { setMode('phone'); setCodeSent(false); setError('') }}
              className="w-full flex items-center justify-center gap-2 text-[14px] font-bold h-[38px] rounded-btn transition-all active:scale-95"
              style={{ boxShadow: 'inset 0 0 0 1px var(--border)', color: 'var(--accent-deep)', background: '#fff' }}>
              <Phone size={15} /> Entrar con mi celular
            </button>
          )}
        </div>
      )}

      <div className="text-center text-[12px] pt-4 font-medium text-[var(--text-tertiary)]" style={{ borderTop: '1px solid var(--accent-soft)' }}>
        ¿Sin cuenta?{' '}
        <button type="button" onClick={onSwitchSignup} className="font-bold hover:underline text-[var(--accent-deep)]">
          Crear cuenta
        </button>
      </div>
    </form>
  )
}
