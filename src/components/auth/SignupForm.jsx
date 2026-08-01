import { useState } from 'react'
import { Mail, Check, X } from 'lucide-react'
import { signUp, signUpWithPhoneOnly, sendPhoneCode, verifyPhoneCode, normalizePhone, sendEmailCode, verifyEmailCode } from '../../api/auth'
import { PHONE_AUTH_ENABLED, EMAIL_CODE_AUTH_ENABLED, PHONE_AUTH_CHANNEL } from '../../lib/constants'
import Spinner from '../shared/Spinner'

const ERR_MAP = {
  'User already registered': 'Este email ya está registrado.',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 8 caracteres.',
  'Token has expired or is invalid': 'El código expiró o no es válido. Pide uno nuevo.',
  'Invalid login credentials': 'Código incorrecto.',
  'Unsupported phone provider': 'El envío de SMS no está configurado aún.',
  'Signups not allowed for otp': 'El registro no está habilitado todavía.',
  'Email rate limit exceeded': 'Demasiados intentos. Espera un momento.',
  'For security purposes, you can only request this after 60 seconds': 'Espera 60 segundos antes de pedir otro código.',
}

const RULES = [
  { id: 'len',   label: 'Mínimo 8 caracteres',  test: p => p.length >= 8 },
  { id: 'upper', label: 'Una mayúscula',        test: p => /[A-Z]/.test(p) },
  { id: 'lower', label: 'Una minúscula',        test: p => /[a-z]/.test(p) },
  { id: 'num',   label: 'Un número',            test: p => /[0-9]/.test(p) },
  { id: 'sym',   label: 'Un símbolo (!@#$...)', test: p => /[^A-Za-z0-9]/.test(p) },
]
const COMMON = ['12345678','password','contrasena','contraseña','qwerty123','abc12345','cobalto11','cobalto123']

const inputCls = 'w-full px-4 py-3 rounded-btn border border-ink-200 bg-ink-50 text-ink-900 placeholder-ink-400 text-[14px] font-medium focus:outline-none focus:border-brand-600 focus:bg-white transition-colors'
const codeCls = 'w-full px-3 py-3 rounded-btn border border-ink-200 bg-ink-50 text-center text-2xl font-mono tracking-[0.4em] text-ink-900 focus:outline-none focus:border-brand-600 focus:bg-white transition-colors'
const primaryBtn = 'w-full flex items-center justify-center gap-2 text-white text-[14px] font-extrabold h-[44px] rounded-btn disabled:opacity-40 transition-all active:scale-95'
const primaryStyle = { background: 'var(--accent-deep)', boxShadow: 'var(--shadow-raised)' }
const ghostBtn = 'w-full flex items-center justify-center gap-2 text-[14px] font-bold h-[44px] rounded-btn transition-all active:scale-95'
const ghostStyle = { boxShadow: 'inset 0 0 0 1px var(--border)', color: 'var(--accent-deep)', background: '#fff' }

const Header = ({ title, sub }) => (
  <div>
    <h2 className="font-extrabold text-[20px] text-[var(--text-primary)]" style={{ letterSpacing: '-0.02em' }}>{title}</h2>
    {sub && <p className="text-[12px] mt-1 font-medium text-[var(--text-tertiary)]">{sub}</p>}
  </div>
)

export default function SignupForm({ onSwitchLogin }) {
  const [wantsEmail, setWantsEmail] = useState(false)

  // ══════════════════════════════════════════════════════════════════════════
  // Vía por defecto: nombre + celular, sin verificación por ahora.
  // Cuando PHONE_AUTH_ENABLED esté activo, este mismo formulario pedirá además
  // el código de 6 dígitos por SMS antes de crear la cuenta.
  // ══════════════════════════════════════════════════════════════════════════
  if (!wantsEmail) {
    return <QuickPhoneSignup onSwitchLogin={onSwitchLogin} onWantsEmail={() => setWantsEmail(true)} />
  }

  // Vía secundaria: correo, para quien la prefiera.
  if (!EMAIL_CODE_AUTH_ENABLED) {
    return <ClassicEmailSignup onSwitchLogin={onSwitchLogin} onBack={() => setWantsEmail(false)} />
  }
  return <EmailCodeSignup onSwitchLogin={onSwitchLogin} onBack={() => setWantsEmail(false)} />
}

// ── Registro exprés: nombre + celular. Nada más. ───────────────────────────────
function QuickPhoneSignup({ onSwitchLogin, onWantsEmail }) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const nameValid  = fullName.trim().length >= 2
  const phoneValid = phone.replace(/\D/g, '').length >= 10
  const formValid  = nameValid && phoneValid

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!formValid) { setError('Escribe tu nombre y un celular válido.'); return }
    setLoading(true)
    try {
      if (PHONE_AUTH_ENABLED) {
        // Con Twilio activo: primero se verifica el número con un código.
        if (!codeSent) {
          await sendPhoneCode(phone)
          setInfo(`Código enviado por ${PHONE_AUTH_CHANNEL === 'whatsapp' ? 'WhatsApp' : 'SMS'} a ${normalizePhone(phone)}`)
          setCodeSent(true)
          setLoading(false)
          return
        }
        if (code.trim().length < 6) { setError('Ingresa el código de 6 dígitos.'); setLoading(false); return }
        await verifyPhoneCode(phone, code)
        // El nombre se completa después, ya con sesión abierta, en ProfileSetup
        // (ahí guardamos full_name junto con el resto del perfil).
        sessionStorage.setItem('cobalto-pending-name', fullName.trim())
      } else {
        // Sin verificación: se crea la cuenta directo con el número.
        await signUpWithPhoneOnly(phone)
        sessionStorage.setItem('cobalto-pending-name', fullName.trim())
      }
    } catch (err) {
      setError(ERR_MAP[err.message] || err.message)
      setLoading(false)
      return
    }
    setLoading(false)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Header title="Crear cuenta"
        sub={codeSent ? `Te enviamos un código por ${PHONE_AUTH_CHANNEL === 'whatsapp' ? 'WhatsApp' : 'SMS'}` : 'Solo tu nombre y celular'} />

      {!codeSent ? (
        <>
          <div>
            <label className="block text-[12px] font-bold text-[var(--text-primary)] mb-1.5">Nombre completo</label>
            <input type="text" autoComplete="name" autoFocus value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Tu nombre" className={inputCls} />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-[var(--text-primary)] mb-1.5">Número de celular</label>
            <input type="tel" inputMode="tel" autoComplete="tel" value={phone}
              onChange={e => setPhone(e.target.value.replace(/[^0-9+ ]/g, '').slice(0, 16))}
              placeholder="300 123 4567" className={inputCls} />
            <p className="text-[12px] mt-1.5 text-[var(--text-tertiary)]">Colombia (+57) por defecto.</p>
          </div>
        </>
      ) : (
        <div>
          <label className="block text-[12px] font-bold text-[var(--text-primary)] mb-1.5">Código de 6 dígitos</label>
          <input type="text" inputMode="numeric" autoComplete="one-time-code" autoFocus value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000" className={codeCls} />
          <button type="button" onClick={() => { setCodeSent(false); setCode(''); setError(''); setInfo('') }}
            className="text-[12px] font-bold hover:underline mt-2 inline-block text-[var(--accent-deep)]">
            Cambiar número
          </button>
        </div>
      )}

      {error && <p className="text-[12px] font-semibold text-red-500">{error}</p>}
      {info && !error && <p className="text-[12px] font-semibold text-green-600">{info}</p>}

      <button type="submit" disabled={loading || !formValid || (codeSent && code.length < 6)}
        className={primaryBtn} style={primaryStyle}>
        {loading ? <Spinner size={16} /> : codeSent ? 'Verificar y entrar' : 'Crear cuenta'}
      </button>

      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={onWantsEmail}
          className="flex items-center gap-1.5 text-[12px] font-bold hover:underline text-[var(--accent-deep)]">
          <Mail size={13} /> Prefiero registrarme con correo
        </button>
        <button type="button" onClick={onSwitchLogin} className="text-[12px] font-bold hover:underline text-[var(--accent-deep)]">
          Ya tengo cuenta
        </button>
      </div>
    </form>
  )
}

// ── Registro por correo con código (cuando EMAIL_CODE_AUTH_ENABLED esté activo) ──
function EmailCodeSignup({ onSwitchLogin, onBack }) {
  const [contact, setContact] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const contactValid = /\S+@\S+\.\S+/.test(contact)
  const reset = () => { setError(''); setInfo('') }

  const sendCode = async (e) => {
    e?.preventDefault()
    reset()
    if (!contactValid) { setError('Ingresa un correo válido.'); return }
    setLoading(true)
    try {
      await sendEmailCode(contact)
      setInfo(`Código enviado a ${contact.trim().toLowerCase()}`)
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
      await verifyEmailCode(contact, code)
    } catch (err) {
      setError(ERR_MAP[err.message] || err.message)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={codeSent ? verify : sendCode} className="space-y-4">
      <Header title={codeSent ? 'Ingresa el código' : 'Tu correo'}
        sub={codeSent ? 'Revisa tu bandeja de entrada' : 'Te enviaremos un código de 6 dígitos'} />

      {!codeSent ? (
        <div>
          <label className="block text-[12px] font-bold text-[var(--text-primary)] mb-1.5">Correo electrónico</label>
          <input type="email" autoComplete="email" autoFocus value={contact}
            onChange={e => setContact(e.target.value)}
            placeholder="tu@empresa.com" className={inputCls} />
        </div>
      ) : (
        <div>
          <label className="block text-[12px] font-bold text-[var(--text-primary)] mb-1.5">Código de 6 dígitos</label>
          <input type="text" inputMode="numeric" autoComplete="one-time-code" autoFocus value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000" className={codeCls} />
          <button type="button" onClick={sendCode} disabled={loading}
            className="text-[12px] font-bold hover:underline mt-2 inline-block text-[var(--accent-deep)]">
            Reenviar código
          </button>
        </div>
      )}

      {error && <p className="text-[12px] font-semibold text-red-500">{error}</p>}
      {info && !error && <p className="text-[12px] font-semibold text-green-600">{info}</p>}

      <button type="submit" disabled={loading || (codeSent ? code.length < 6 : !contactValid)}
        className={primaryBtn} style={primaryStyle}>
        {loading ? <Spinner size={16} /> : codeSent ? 'Verificar y continuar' : 'Enviarme el código'}
      </button>

      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={onBack}
          className="text-[12px] font-bold hover:underline text-[var(--accent-deep)]">
          Volver
        </button>
        <button type="button" onClick={onSwitchLogin} className="text-[12px] font-bold hover:underline text-[var(--accent-deep)]">
          Ya tengo cuenta
        </button>
      </div>
    </form>
  )
}

// ── Registro tradicional: correo + contraseña ──────────────────────────────────
function ClassicEmailSignup({ onSwitchLogin, onBack }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const passed   = RULES.filter(r => r.test(pass))
  const isCommon = COMMON.includes(pass.toLowerCase())
  const strong   = passed.length === RULES.length && !isCommon
  const strength = isCommon ? 0 : passed.length
  const barColor = strength <= 2 ? '#dc2626' : strength <= 4 ? 'var(--accent)' : '#16a34a'
  const barLabel = isCommon ? 'Muy común, elige otra'
    : strength <= 2 ? 'Débil' : strength <= 3 ? 'Media' : strength === 4 ? 'Buena' : 'Fuerte'

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!strong) {
      setTouched(true)
      setError(isCommon
        ? 'Esa contraseña es demasiado común. Elige una diferente.'
        : 'La contraseña no cumple los requisitos de seguridad.')
      return
    }
    setLoading(true)
    try {
      await signUp(email, pass)
      setSuccess('Revisa tu email para confirmar tu cuenta.')
    } catch (err) {
      setError(ERR_MAP[err.message] || err.message)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Header title="Crear cuenta" sub="Con tu correo electrónico" />

      <div>
        <label className="block text-[12px] font-bold text-[var(--text-primary)] mb-1.5">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
          placeholder="tu@empresa.com" className={inputCls} autoComplete="email" />
      </div>

      <div>
        <label className="block text-[12px] font-bold text-[var(--text-primary)] mb-1.5">Contraseña</label>
        <input type="password" value={pass} required autoComplete="new-password"
          onChange={e => { setPass(e.target.value); if (!touched) setTouched(true) }}
          placeholder="••••••••" className={inputCls} />

        {touched && pass.length > 0 && (
          <div className="mt-2">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--accent-soft)' }}>
              <div className="h-full transition-all" style={{ width: `${(strength / RULES.length) * 100}%`, background: barColor }} />
            </div>
            <p className="text-[12px] mt-1 font-bold" style={{ color: barColor }}>{barLabel}</p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1.5">
              {RULES.map(r => {
                const ok = r.test(pass)
                return (
                  <div key={r.id} className="flex items-center gap-1">
                    {ok ? <Check size={11} style={{ color: '#16a34a', flexShrink: 0 }} />
                        : <X size={11} style={{ color: '#C9D9F2', flexShrink: 0 }} />}
                    <span className="text-[12px]" style={{ color: ok ? '#16a34a' : 'var(--text-tertiary)' }}>{r.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-[12px] font-semibold text-red-500">{error}</p>}
      {success && <p className="text-[12px] font-semibold text-green-600">{success}</p>}

      <button type="submit" disabled={loading} className={primaryBtn} style={primaryStyle}>
        {loading ? <Spinner size={16} /> : 'Crear cuenta'}
      </button>

      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={onBack}
          className="text-[12px] font-bold hover:underline text-[var(--accent-deep)]">
          Volver
        </button>
        <button type="button" onClick={onSwitchLogin} className="text-[12px] font-bold hover:underline text-[var(--accent-deep)]">
          Ya tengo cuenta
        </button>
      </div>
    </form>
  )
}
