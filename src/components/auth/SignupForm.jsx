import { useState } from 'react'
import { Phone, Mail, ArrowLeft } from 'lucide-react'
import { sendPhoneCode, verifyPhoneCode, normalizePhone, sendEmailCode, verifyEmailCode } from '../../api/auth'
import Spinner from '../shared/Spinner'

const ERR_MAP = {
  'Token has expired or is invalid': 'El código expiró o no es válido. Pide uno nuevo.',
  'Invalid login credentials': 'Código incorrecto.',
  'Unsupported phone provider': 'El envío de SMS no está configurado aún.',
  'Signups not allowed for otp': 'El registro no está habilitado todavía.',
  'Email rate limit exceeded': 'Demasiados intentos. Espera un momento.',
  'For security purposes, you can only request this after 60 seconds': 'Espera 60 segundos antes de pedir otro código.',
}

const inputCls = 'w-full px-4 py-3 rounded-[14px] border border-ink-200 bg-ink-50 text-ink-900 placeholder-ink-400 text-[14px] font-medium focus:outline-none focus:border-brand-600 focus:bg-white transition-colors'
const codeCls = 'w-full px-3 py-3 rounded-[14px] border border-ink-200 bg-ink-50 text-center text-2xl font-mono tracking-[0.4em] text-ink-900 focus:outline-none focus:border-brand-600 focus:bg-white transition-colors'
const primaryBtn = 'w-full flex items-center justify-center gap-2 text-white text-[14px] font-extrabold py-3 rounded-[14px] disabled:opacity-40 transition-all active:scale-95'
const primaryStyle = { background: 'linear-gradient(135deg,#0B2E68,#1A5AC8)', boxShadow: '0 8px 20px rgba(11,46,104,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' }
const ghostBtn = 'w-full flex items-center justify-center gap-2 text-[13px] font-bold py-3 rounded-[14px] transition-all active:scale-95'
const ghostStyle = { boxShadow: 'inset 0 0 0 1.5px #DDE7FA', color: '#0047AB', background: '#fff' }

export default function SignupForm({ onSwitchLogin }) {
  const [method, setMethod] = useState(null)   // null | 'phone' | 'email'
  const [contact, setContact] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const isPhone = method === 'phone'
  const contactValid = isPhone
    ? contact.replace(/\D/g, '').length >= 10
    : /\S+@\S+\.\S+/.test(contact)

  const reset = () => { setError(''); setInfo('') }

  const sendCode = async (e) => {
    e?.preventDefault()
    reset()
    if (!contactValid) {
      setError(isPhone ? 'Ingresa un celular válido.' : 'Ingresa un correo válido.')
      return
    }
    setLoading(true)
    try {
      if (isPhone) {
        await sendPhoneCode(contact)
        setInfo(`Código enviado por SMS a ${normalizePhone(contact)}`)
      } else {
        await sendEmailCode(contact)
        setInfo(`Código enviado a ${contact.trim().toLowerCase()}`)
      }
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
      if (isPhone) await verifyPhoneCode(contact, code)
      else await verifyEmailCode(contact, code)
      // Sesión abierta: App.jsx lleva a completar el perfil en 2 pasos.
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

  // ── Elegir método ──────────────────────────────────────────────────────────
  if (!method) {
    return (
      <div className="space-y-4">
        <Header title="Crear cuenta" sub="Te enviaremos un código para verificarte" />
        <button type="button" onClick={() => { setMethod('phone'); reset() }} className={primaryBtn} style={primaryStyle}>
          <Phone size={16} /> Con mi celular
        </button>
        <div className="relative flex items-center gap-3 py-1">
          <div className="flex-1 h-px" style={{ background: '#DDE7FA' }} />
          <span className="text-[10px] font-medium" style={{ color: '#8FA3C7' }}>o</span>
          <div className="flex-1 h-px" style={{ background: '#DDE7FA' }} />
        </div>
        <button type="button" onClick={() => { setMethod('email'); reset() }} className={ghostBtn} style={ghostStyle}>
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

  // ── Ingresar contacto o código ─────────────────────────────────────────────
  return (
    <form onSubmit={codeSent ? verify : sendCode} className="space-y-4">
      <Header
        title={codeSent ? 'Ingresa el código' : (isPhone ? 'Tu celular' : 'Tu correo')}
        sub={codeSent
          ? (isPhone ? 'Te lo enviamos por SMS' : 'Revisa tu bandeja de entrada')
          : 'Te enviaremos un código de 6 dígitos'} />

      {!codeSent ? (
        <div>
          <label className="block text-[12px] font-bold text-[#0A2A5C] mb-1.5">
            {isPhone ? 'Número de celular' : 'Correo electrónico'}
          </label>
          {isPhone ? (
            <input type="tel" inputMode="tel" autoComplete="tel" autoFocus value={contact}
              onChange={e => setContact(e.target.value.replace(/[^0-9+ ]/g, '').slice(0, 16))}
              placeholder="300 123 4567" className={inputCls} />
          ) : (
            <input type="email" autoComplete="email" autoFocus value={contact}
              onChange={e => setContact(e.target.value)}
              placeholder="tu@empresa.com" className={inputCls} />
          )}
          {isPhone && <p className="text-[11px] mt-1.5 text-[#8FA3C7]">Colombia (+57) por defecto.</p>}
        </div>
      ) : (
        <div>
          <label className="block text-[12px] font-bold text-[#0A2A5C] mb-1.5">Código de 6 dígitos</label>
          <input type="text" inputMode="numeric" autoComplete="one-time-code" autoFocus value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000" className={codeCls} />
          <button type="button" onClick={sendCode} disabled={loading}
            className="text-[12px] font-bold hover:underline mt-2 inline-block text-[#0047AB]">
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
        <button type="button"
          onClick={() => { codeSent ? (setCodeSent(false), setCode('')) : setMethod(null); reset() }}
          className="flex items-center gap-1 text-[12px] font-bold hover:underline text-[#0047AB]">
          <ArrowLeft size={13} /> Volver
        </button>
        <button type="button" onClick={onSwitchLogin} className="text-[12px] font-bold hover:underline text-[#0047AB]">
          Ya tengo cuenta
        </button>
      </div>
    </form>
  )
}
