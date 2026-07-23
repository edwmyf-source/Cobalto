import { useState } from 'react'
import { Check, X, Phone, Mail, ArrowLeft } from 'lucide-react'
import { signUp, sendPhoneCode, verifyPhoneCode, normalizePhone } from '../../api/auth'
import Spinner from '../shared/Spinner'

const ERR_MAP = {
  'User already registered': 'Este email ya está registrado.',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 8 caracteres.',
  'Invalid login credentials': 'Código incorrecto.',
  'Token has expired or is invalid': 'El código expiró o no es válido. Pide uno nuevo.',
  'Signups not allowed for otp': 'El registro por celular no está habilitado todavía.',
  'Unsupported phone provider': 'El envío de SMS no está configurado aún.',
}

const RULES = [
  { id: 'len',   label: 'Mínimo 8 caracteres',  test: p => p.length >= 8 },
  { id: 'upper', label: 'Una mayúscula',        test: p => /[A-Z]/.test(p) },
  { id: 'lower', label: 'Una minúscula',        test: p => /[a-z]/.test(p) },
  { id: 'num',   label: 'Un número',            test: p => /[0-9]/.test(p) },
  { id: 'sym',   label: 'Un símbolo (!@#$...)', test: p => /[^A-Za-z0-9]/.test(p) },
]

const COMMON = ['12345678','password','contrasena','contraseña','qwerty123','abc12345','cobalto11','cobalto123']

const inputCls = 'w-full px-4 py-3 rounded-[14px] border border-ink-200 bg-ink-50 text-ink-900 placeholder-ink-400 text-[14px] font-medium focus:outline-none focus:border-brand-600 focus:bg-white transition-colors'
const primaryBtn = 'w-full flex items-center justify-center gap-2 text-white text-[14px] font-extrabold py-3 rounded-[14px] disabled:opacity-40 transition-all active:scale-95'
const primaryStyle = { background: 'linear-gradient(135deg,#0B2E68,#1A5AC8)', boxShadow: '0 8px 20px rgba(11,46,104,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' }

export default function SignupForm({ onSwitchLogin }) {
  // method: null (elegir) | 'phone' | 'email'
  const [method, setMethod] = useState(null)

  // --- flujo celular ---
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)

  // --- flujo email ---
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
  const barColor = strength <= 2 ? '#dc2626' : strength <= 4 ? '#2C6BD4' : '#16a34a'
  const barLabel = isCommon ? 'Muy común, elige otra'
    : strength <= 2 ? 'Débil' : strength <= 3 ? 'Media' : strength === 4 ? 'Buena' : 'Fuerte'

  const phoneValid = phone.replace(/\D/g, '').length >= 10

  const reset = () => { setError(''); setSuccess('') }

  const handleSendCode = async (e) => {
    e.preventDefault()
    reset()
    if (!phoneValid) { setError('Ingresa un número de celular válido.'); return }
    setLoading(true)
    try {
      await sendPhoneCode(phone)
      setCodeSent(true)
      setSuccess(`Te enviamos un código por SMS a ${normalizePhone(phone)}`)
    } catch (err) {
      setError(ERR_MAP[err.message] || err.message)
    }
    setLoading(false)
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    reset()
    if (code.trim().length < 4) { setError('Ingresa el código que recibiste.'); return }
    setLoading(true)
    try {
      await verifyPhoneCode(phone, code)
      // La sesión se abre sola; App.jsx enviará a completar el perfil.
    } catch (err) {
      setError(ERR_MAP[err.message] || err.message)
    }
    setLoading(false)
  }

  const handleEmailSignup = async (e) => {
    e.preventDefault()
    reset()
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

  const Header = ({ title, sub }) => (
    <div>
      <h2 className="font-extrabold text-[20px] text-[#0A2A5C]" style={{ letterSpacing: '-0.02em' }}>{title}</h2>
      {sub && <p className="text-[12px] mt-1 font-medium text-[#8FA3C7]">{sub}</p>}
    </div>
  )

  const Back = ({ onClick }) => (
    <button type="button" onClick={onClick}
      className="flex items-center gap-1 text-[12px] font-bold hover:underline text-[#0047AB]">
      <ArrowLeft size={13} /> Volver
    </button>
  )

  // ── Paso 0: elegir método ──────────────────────────────────────────────────
  if (!method) {
    return (
      <div className="space-y-4">
        <Header title="Crear cuenta" sub="Elige cómo quieres registrarte" />
        <button type="button" onClick={() => { setMethod('phone'); reset() }}
          className={primaryBtn} style={primaryStyle}>
          <Phone size={16} /> Con mi celular
        </button>
        <div className="relative flex items-center gap-3 py-1">
          <div className="flex-1 h-px" style={{ background: '#DDE7FA' }} />
          <span className="text-[10px] font-medium" style={{ color: '#8FA3C7' }}>o</span>
          <div className="flex-1 h-px" style={{ background: '#DDE7FA' }} />
        </div>
        <button type="button" onClick={() => { setMethod('email'); reset() }}
          className="w-full flex items-center justify-center gap-2 text-[13px] font-bold py-3 rounded-[14px] transition-all active:scale-95"
          style={{ boxShadow: 'inset 0 0 0 1.5px #DDE7FA', color: '#0047AB', background: '#fff' }}>
          <Mail size={15} /> Con mi correo
        </button>
        <div className="text-center text-[12px] pt-4 font-medium text-[#8FA3C7]" style={{ borderTop: '1px solid #EBF1FC' }}>
          ¿Ya tienes cuenta?{' '}
          <button type="button" onClick={onSwitchLogin} className="font-bold hover:underline text-[#0047AB]">
            Iniciar sesión
          </button>
        </div>
      </div>
    )
  }

  // ── Registro por celular ───────────────────────────────────────────────────
  if (method === 'phone') {
    return (
      <form onSubmit={codeSent ? handleVerifyCode : handleSendCode} className="space-y-4">
        <Header
          title={codeSent ? 'Ingresa el código' : 'Tu celular'}
          sub={codeSent ? 'Te lo enviamos por SMS' : 'Te enviaremos un código para verificarlo'} />

        {!codeSent ? (
          <div>
            <label className="block text-[12px] font-bold text-[#0A2A5C] mb-1.5">Número de celular</label>
            <input type="tel" value={phone} inputMode="tel" autoComplete="tel"
              onChange={e => setPhone(e.target.value.replace(/[^0-9+ ]/g, '').slice(0, 16))}
              placeholder="300 123 4567" className={inputCls} />
            <p className="text-[11px] mt-1.5 text-[#8FA3C7]">Colombia (+57) por defecto. Incluye el indicativo si es de otro país.</p>
          </div>
        ) : (
          <div>
            <label className="block text-[12px] font-bold text-[#0A2A5C] mb-1.5">Código de 6 dígitos</label>
            <input type="text" value={code} inputMode="numeric" autoComplete="one-time-code"
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-3 py-3 rounded-[14px] border border-ink-200 bg-ink-50 text-center text-2xl font-mono tracking-[0.4em] text-ink-900 focus:outline-none focus:border-brand-600 focus:bg-white transition-colors" />
            <button type="button" onClick={handleSendCode} disabled={loading}
              className="text-[12px] font-bold hover:underline mt-2 inline-block text-[#0047AB]">
              Reenviar código
            </button>
          </div>
        )}

        {error && <p className="text-[12px] font-semibold text-red-500">{error}</p>}
        {success && !error && <p className="text-[12px] font-semibold text-green-600">{success}</p>}

        <button type="submit" disabled={loading || (!codeSent && !phoneValid)}
          className={primaryBtn} style={primaryStyle}>
          {loading ? <Spinner size={16} /> : codeSent ? 'Verificar y entrar' : 'Enviarme el código'}
        </button>

        <div className="flex items-center justify-between pt-2">
          <Back onClick={() => { codeSent ? setCodeSent(false) : setMethod(null); reset() }} />
          <button type="button" onClick={onSwitchLogin} className="text-[12px] font-bold hover:underline text-[#0047AB]">
            Ya tengo cuenta
          </button>
        </div>
      </form>
    )
  }

  // ── Registro por correo ────────────────────────────────────────────────────
  return (
    <form onSubmit={handleEmailSignup} className="space-y-4">
      <Header title="Crear cuenta" sub="Con tu correo electrónico" />

      <div>
        <label className="block text-[12px] font-bold text-[#0A2A5C] mb-1.5">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
          placeholder="tu@empresa.com" className={inputCls} autoComplete="email" />
      </div>

      <div>
        <label className="block text-[12px] font-bold text-[#0A2A5C] mb-1.5">Contraseña</label>
        <input type="password" value={pass} required autoComplete="new-password"
          onChange={e => { setPass(e.target.value); if (!touched) setTouched(true) }}
          placeholder="••••••••" className={inputCls} />

        {touched && pass.length > 0 && (
          <div className="mt-2">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#EBF1FC' }}>
              <div className="h-full transition-all" style={{ width: `${(strength / RULES.length) * 100}%`, background: barColor }} />
            </div>
            <p className="text-[10px] mt-1 font-bold" style={{ color: barColor }}>{barLabel}</p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1.5">
              {RULES.map(r => {
                const ok = r.test(pass)
                return (
                  <div key={r.id} className="flex items-center gap-1">
                    {ok ? <Check size={11} style={{ color: '#16a34a', flexShrink: 0 }} />
                        : <X size={11} style={{ color: '#C9D9F2', flexShrink: 0 }} />}
                    <span className="text-[10px]" style={{ color: ok ? '#16a34a' : '#8FA3C7' }}>{r.label}</span>
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
        <Back onClick={() => { setMethod(null); reset() }} />
        <button type="button" onClick={onSwitchLogin} className="text-[12px] font-bold hover:underline text-[#0047AB]">
          Ya tengo cuenta
        </button>
      </div>
    </form>
  )
}
