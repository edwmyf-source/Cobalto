import { useState } from 'react'
import { sendEmailCode, verifyEmailCode, signInWithGoogle } from '../../api/auth'
import Spinner from '../shared/Spinner'

const ERR_MAP = {
  'User already registered': 'Este email ya está registrado.',
  'Token has expired or is invalid': 'El código expiró o no es válido. Pide uno nuevo.',
  'Invalid login credentials': 'Código incorrecto.',
  'Signups not allowed for otp': 'El registro no está habilitado todavía.',
  'Email rate limit exceeded': 'Demasiados intentos. Espera un momento.',
  'For security purposes, you can only request this after 60 seconds': 'Espera 60 segundos antes de pedir otro código.',
}

const inputCls = 'w-full px-4 py-3 rounded-btn border text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-[14px] font-medium focus:outline-none focus:border-[var(--accent)] focus:bg-white transition-colors'
const codeCls = 'w-full px-3 py-3 rounded-btn border border-[var(--border-soft)] bg-[var(--bg-subtle)] text-center text-2xl font-mono tracking-[0.4em] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:bg-white transition-colors'
const primaryBtn = 'w-full flex items-center justify-center gap-2 text-white text-[14px] font-extrabold h-[38px] rounded-btn disabled:opacity-40 transition-all active:scale-95'
const primaryStyle = { background: 'var(--accent-deep)', boxShadow: 'var(--shadow-raised)' }
const ghostBtn = 'w-full flex items-center justify-center gap-2 text-[14px] font-bold h-[38px] rounded-btn transition-all active:scale-95'
const ghostStyle = { boxShadow: 'inset 0 0 0 1px var(--border)', color: 'var(--accent-deep)', background: '#fff' }

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h11.8c-.5 2.7-2 5.1-4.4 6.6v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.3z"/>
    <path fill="#34A853" d="M24 46c6 0 11-2 14.6-5.2l-7.1-5.5c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.7-3.9-12.4-9.700H4.3v5.7C7.9 41 15.4 46 24 46z"/>
    <path fill="#FBBC05" d="M11.6 27.7c-.5-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2v-5.7H4.3C2.8 16.6 2 20.2 2 23.5s.8 6.9 2.3 9.9l7.3-5.7z"/>
    <path fill="#EA4335" d="M24 10.3c3.3 0 6.2 1.1 8.5 3.3l6.3-6.3C35 3.7 30 1.5 24 1.5 15.4 1.5 7.9 6.5 4.3 13.6l7.3 5.7c1.7-5.8 6.6-9 12.4-9z"/>
  </svg>
)

// ══════════════════════════════════════════════════════════════════════════
// Únete ahora: dos caminos, sin fricción de más.
//   1) Google — un clic con la cuenta que ya tienes abierta.
//   2) Correo — pides el código y lo confirmas. Listo, ya estás dentro.
// El perfil (nombre, etc.) se crea solo a partir del correo, sin pedir
// teléfono ni contraseña (ver ProfileSetup.jsx).
// ══════════════════════════════════════════════════════════════════════════
export default function SignupForm({ onSwitchLogin }) {
  const [email, setEmail]   = useState('')
  const [code, setCode]     = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [info, setInfo]         = useState('')

  const emailValid = /\S+@\S+\.\S+/.test(email)
  const reset = () => { setError(''); setInfo('') }

  const sendCode = async (e) => {
    e?.preventDefault()
    reset()
    if (!emailValid) { setError('Ingresa un correo válido.'); return }
    setLoading(true)
    try {
      await sendEmailCode(email)
      setInfo(`Código enviado a ${email.trim().toLowerCase()}`)
      setCodeSent(true)
    } catch (err) {
      setError(ERR_MAP[err.message] || err.message)
    }
    setLoading(false)
  }

  const verify = async (e) => {
    e.preventDefault()
    reset()
    if (code.trim().length < 6) { setError('Ingresa el código de 6 dígitos.'); return }
    setLoading(true)
    try {
      await verifyEmailCode(email, code)
      // Sesión creada: App.jsx detecta el login y ProfileSetup arma el
      // perfil solo con el nombre derivado del correo. Nada más que hacer.
    } catch (err) {
      setError(ERR_MAP[err.message] || err.message)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-extrabold text-[20px] text-[var(--text-primary)]" style={{ letterSpacing: '-0.02em' }}>Únete ahora</h2>
        <p className="text-[12px] mt-1 font-medium text-[var(--text-tertiary)]">La comunidad de la industria química en Colombia</p>
      </div>

      {!codeSent && (
        <>
          <button type="button" onClick={async () => { try { await signInWithGoogle() } catch (e) { setError(e.message) } }}
            className={ghostBtn} style={ghostStyle}>
            <GoogleIcon /> Continuar con Google
          </button>
          <div className="relative flex items-center gap-3 py-1">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-[12px] font-medium" style={{ color: 'var(--text-tertiary)' }}>o con tu correo</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>
        </>
      )}

      <form onSubmit={codeSent ? verify : sendCode} className="space-y-4">
        {!codeSent ? (
          <div>
            <label htmlFor="signup-email" className="block text-[12px] font-bold text-[var(--text-primary)] mb-1.5">Correo electrónico</label>
            <input id="signup-email" type="email" autoComplete="email" autoFocus value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@empresa.com" className={inputCls} />
          </div>
        ) : (
          <div>
            <label htmlFor="signup-code" className="block text-[12px] font-bold text-[var(--text-primary)] mb-1.5">Código de 6 dígitos</label>
            <input id="signup-code" type="text" inputMode="numeric" autoComplete="one-time-code" autoFocus value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000" className={codeCls} />
            <button type="button" onClick={sendCode} disabled={loading}
              className="text-[12px] font-bold hover:underline mt-2 inline-block text-[var(--accent-deep)]">
              Reenviar código
            </button>
          </div>
        )}

        {error && <p role="alert" className="text-[12px] font-semibold text-red-500">{error}</p>}
        {info && !error && <p className="text-[12px] font-semibold text-green-600">{info}</p>}

        <button type="submit" disabled={loading || (!codeSent ? !emailValid : code.length < 6)}
          className={primaryBtn} style={primaryStyle}>
          {loading ? <Spinner size={16} /> : !codeSent ? 'Enviarme el código' : 'Entrar a Cobalto'}
        </button>

        <div className="flex items-center justify-end pt-2">
          <button type="button" onClick={onSwitchLogin} className="text-[12px] font-bold hover:underline text-[var(--accent-deep)]">
            Ya tengo cuenta
          </button>
        </div>
      </form>
    </div>
  )
}
