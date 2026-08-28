import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { sendEmailCode, verifyEmailCode, signInWithGoogle } from '../../api/auth'
import Spinner from '../shared/Spinner'

const ERR_MAP = {
  'Token has expired or is invalid': 'El código expiró o no es válido. Pide uno nuevo.',
  'Invalid login credentials': 'Código incorrecto.',
  'Email rate limit exceeded': 'Demasiados intentos. Espera un momento.',
  'For security purposes, you can only request this after 60 seconds': 'Espera 60 segundos antes de pedir otro código.',
}

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h11.8c-.5 2.7-2 5.1-4.4 6.6v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.3z"/>
    <path fill="#34A853" d="M24 46c6 0 11-2 14.6-5.2l-7.1-5.5c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.7-3.9-12.4-9.700H4.3v5.7C7.9 41 15.4 46 24 46z"/>
    <path fill="#FBBC05" d="M11.6 27.7c-.5-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2v-5.7H4.3C2.8 16.6 2 20.2 2 23.5s.8 6.9 2.3 9.9l7.3-5.7z"/>
    <path fill="#EA4335" d="M24 10.3c3.3 0 6.2 1.1 8.5 3.3l6.3-6.3C35 3.7 30 1.5 24 1.5 15.4 1.5 7.9 6.5 4.3 13.6l7.3 5.7c1.7-5.8 6.6-9 12.4-9z"/>
  </svg>
)

// ══════════════════════════════════════════════════════════════════════════
// Acceso: dos caminos y nada más.
//   1) Google — un clic.
//   2) Correo — código de 6 dígitos. El mismo flujo sirve para cuenta nueva
//      y existente (shouldCreateUser), así que no hay que preguntar de
//      antemano si la persona ya está registrada.
// ══════════════════════════════════════════════════════════════════════════
export default function LoginForm() {
  const [email, setEmail]       = useState('')
  const [code, setCode]         = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const emailValid = /\S+@\S+\.\S+/.test(email)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (!codeSent) {
        await sendEmailCode(email)
        setCodeSent(true)
      } else {
        await verifyEmailCode(email, code)
        // Sesión creada: App.jsx detecta el login y sigue el flujo.
      }
    } catch (err) {
      setError(ERR_MAP[err.message] || err.message)
    }
    setLoading(false)
  }

  const fieldCls = 'w-full px-4 rounded-input text-[15px] font-medium transition-colors focus:outline-none'
  const fieldStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    height: 'clamp(44px, 11.7vw, 48px)',
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {!codeSent ? (
        <>
          <button type="button"
            onClick={async () => { try { await signInWithGoogle() } catch (e) { setError(e.message) } }}
            className="w-full flex items-center justify-center gap-2.5 text-[14px] font-bold rounded-btn transition-all active:scale-[0.98]"
            style={{ boxShadow: 'inset 0 0 0 1px var(--border)', color: 'var(--text-primary)', background: 'var(--surface)',
                     height: 'clamp(44px, 11.7vw, 48px)' }}>
            <GoogleIcon /> Continuar con Google
          </button>

          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px" style={{ background: 'var(--border-soft)' }} />
            <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>o con tu correo</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-soft)' }} />
          </div>

          <div>
            <label htmlFor="login-email" className="sr-only">Correo electrónico</label>
            <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoComplete="email" placeholder="tu@empresa.com"
              className={fieldCls} style={fieldStyle} />
          </div>
        </>
      ) : (
        <div>
          <label htmlFor="login-code" className="sr-only">Código de 6 dígitos</label>
          <input id="login-code" type="text" value={code} inputMode="numeric" autoComplete="one-time-code"
            required autoFocus placeholder="000000"
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-3 rounded-input text-center font-bold tracking-[0.32em] transition-colors focus:outline-none"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-primary)',
                     height: 'clamp(50px, 13.6vw, 56px)', fontSize: 'clamp(22px, 6.3vw, 26px)' }} />
          <p className="t-caption mt-2 text-center" style={{ color: 'var(--text-tertiary)' }}>
            Enviado a {email}
          </p>
        </div>
      )}

      {error && <p role="alert" className="t-caption font-semibold" style={{ color: 'var(--error)' }}>{error}</p>}

      <button type="submit" disabled={loading || (codeSent ? code.length < 6 : !emailValid)}
        className="w-full flex items-center justify-center gap-2 text-white text-[15px] font-extrabold rounded-btn disabled:opacity-40 transition-all active:scale-[0.98]"
        style={{ background: 'var(--accent-deep)', boxShadow: 'var(--shadow-raised)',
                 height: 'clamp(44px, 11.7vw, 48px)' }}>
        {loading ? <Spinner size={16} /> : codeSent ? 'Verificar y entrar' : 'Enviarme el código'}
      </button>

      {codeSent && (
        <button type="button"
          onClick={() => { setCodeSent(false); setCode(''); setError('') }}
          className="w-full flex items-center justify-center gap-1.5 text-[13px] font-bold h-10 transition-opacity active:opacity-60"
          style={{ color: 'var(--accent-deep)' }}>
          <ArrowLeft size={14} /> Cambiar correo
        </button>
      )}
    </form>
  )
}
