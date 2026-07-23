import { useState, useMemo } from 'react'
import { Lock, Eye, Check, ArrowRight, ArrowLeft } from 'lucide-react'
import { updateProfile } from '../../api/profiles'
import { updatePassword, signOut } from '../../api/auth'
import { useAuth } from '../../contexts/AuthContext'
import { safeErrorMessage } from '../../lib/errors'
import { domainOf, generateIdentityNumber } from '../../lib/helpers'
import UserAvatar from '../shared/UserAvatar'
import PrivacyBadge from '../shared/PrivacyBadge'
import Spinner from '../shared/Spinner'

const inputCls = 'w-full px-4 py-3 rounded-[14px] border border-ink-200 bg-ink-50 text-ink-900 placeholder-ink-400 text-[14px] font-medium focus:outline-none focus:border-brand-600 focus:bg-white transition-colors'
const labelCls = 'text-[12px] font-bold text-[#0A2A5C]'
const primaryBtn = 'w-full flex items-center justify-center gap-2 text-white text-[14px] font-extrabold py-3 rounded-[14px] disabled:opacity-40 transition-all active:scale-95'
const primaryStyle = { background: 'linear-gradient(135deg,#0B2E68,#1A5AC8)', boxShadow: '0 8px 20px rgba(11,46,104,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' }

export default function ProfileSetup() {
  const { session, profile, setProfile } = useAuth()
  const userId = session?.user?.id || ''
  const userEmail = session?.user?.email || ''
  const userPhone = session?.user?.phone || ''
  const defaultNumber = useMemo(() => generateIdentityNumber(userId), [userId])

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || userPhone || '',
    identity_mode: profile?.identity_mode || 'anon',
    identity_number: profile?.identity_number || defaultNumber,
    password: '',
    password2: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Si entró por SMS ya tiene teléfono verificado; si entró por correo lo pedimos.
  const phoneAlreadyVerified = Boolean(userPhone)
  const phoneValid = phoneAlreadyVerified || form.phone.replace(/\D/g, '').length >= 10

  // La contraseña es obligatoria solo si aún no tiene uno (registro por SMS).
  const needsPassword = !userEmail
  const passFilled = form.password.trim().length > 0
  const passLongEnough = form.password.trim().length >= 6
  const passMatch = form.password === form.password2
  const passValid = needsPassword
    ? (passLongEnough && passMatch)
    : (!passFilled || (passLongEnough && passMatch))

  const step1Valid = form.full_name.trim().length >= 2 && phoneValid
  const step2Valid = passValid

  const goNext = (e) => {
    e.preventDefault()
    if (!step1Valid) { setError('Completa tu nombre y celular.'); return }
    setError('')
    setStep(2)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!step2Valid || loading) return
    if (passFilled && !passMatch) { setError('Las contraseñas no coinciden.'); return }
    if (passFilled && !passLongEnough) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    setLoading(true)
    setError('')
    try {
      if (passFilled) await updatePassword(form.password.trim())
      const payload = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        identity_mode: form.identity_mode,
        identity_number: form.identity_number,
        ...(userEmail ? { email: userEmail, email_domain: domainOf(userEmail) } : {}),
      }
      const p = await updateProfile(userId, payload)
      setProfile(p)
    } catch (err) {
      setError(safeErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const IdentityCard = ({ mode, icon, label, preview, anon }) => {
    const active = form.identity_mode === mode
    return (
      <label
        onClick={() => set('identity_mode', mode)}
        className={`flex-1 flex flex-col items-center text-center gap-2 p-3.5 px-2.5 bg-white rounded-2xl cursor-pointer relative ${
          active ? 'border-[1.5px] border-brand-600' : 'border border-ink-200'
        }`}
      >
        {active && (
          <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-brand-600 flex items-center justify-center">
            <Check size={9} strokeWidth={3} className="text-white" />
          </span>
        )}
        {anon ? (
          <UserAvatar seed={userId + '-anon'} size={38} />
        ) : (
          <div className="w-[38px] h-[38px] rounded-full bg-ink-100 flex items-center justify-center">{icon}</div>
        )}
        <div>
          <p className="text-[12px] font-bold text-ink-900">{label}</p>
          <p className={`text-[11px] text-ink-500 mt-0.5 font-medium ${anon ? 'font-mono' : ''}`}>{preview}</p>
        </div>
      </label>
    )
  }

  const StepDots = () => (
    <div className="flex items-center gap-2 mb-4">
      {[1, 2].map(n => (
        <div key={n} className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all"
            style={step >= n
              ? { background: 'linear-gradient(135deg,#0B2E68,#1A5AC8)', color: '#fff' }
              : { background: '#EBF1FC', color: '#8FA3C7' }}>
            {step > n ? <Check size={12} strokeWidth={3} /> : n}
          </div>
          {n === 1 && <div className="w-8 h-[2px] rounded-full" style={{ background: step > 1 ? '#1A5AC8' : '#EBF1FC' }} />}
        </div>
      ))}
      <span className="ml-1 text-[11px] font-bold text-[#8FA3C7]">
        {step === 1 ? 'Tus datos' : 'Tu contraseña'}
      </span>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: '#E4EBF7', WebkitOverflowScrolling: 'touch' }}>
      <div className="min-h-full flex items-start justify-center p-4 py-8">
        <div className="bg-white rounded-[22px] w-full max-w-md p-7" style={{ boxShadow: '0 16px 44px rgba(8,31,74,0.16)' }}>

          <span className="font-extrabold text-[21px] block mb-4" style={{ color: '#0A2A5C', letterSpacing: '-0.03em' }}>
            Cobalto<span style={{ color: '#1A5AC8' }}>.</span>
          </span>

          <h2 className="font-extrabold text-[20px] text-[#0A2A5C]" style={{ letterSpacing: '-0.02em' }}>
            Crea tu cuenta en 2 pasos
          </h2>
          <p className="text-[12px] mt-1 mb-4 font-medium text-[#8FA3C7]">
            Solo nosotros sabemos quién eres. La comunidad no.
          </p>

          <StepDots />

          {/* ═════════ PASO 1: NOMBRE + CELULAR + IDENTIDAD ═════════ */}
          {step === 1 && (
            <form onSubmit={goNext} className="space-y-4">
              <div className="rounded-[14px] p-3 flex gap-2.5 items-start" style={{ background: '#F0FDF4' }}>
                <Lock size={15} className="text-green-700 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] leading-relaxed text-green-800">
                  Tu nombre y celular son <strong>100% privados</strong>. Nadie en la comunidad los verá.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelCls}>Nombre completo</label>
                  <PrivacyBadge variant="private" />
                </div>
                <input autoFocus value={form.full_name} onChange={e => set('full_name', e.target.value)}
                  placeholder="Tu nombre" className={inputCls} autoComplete="name" />
              </div>

              {!phoneAlreadyVerified && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={labelCls}>Celular</label>
                    <PrivacyBadge variant="private" />
                  </div>
                  <input type="tel" inputMode="tel" autoComplete="tel" value={form.phone}
                    onChange={e => set('phone', e.target.value.replace(/[^0-9+ ]/g, '').slice(0, 16))}
                    placeholder="300 123 4567" className={inputCls} />
                </div>
              )}

              <div className="rounded-[14px] p-3.5" style={{ background: '#F4F7FD' }}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Eye size={13} style={{ color: '#0047AB' }} />
                  <span className="text-[12px] font-bold text-[#0A2A5C]">¿Cómo te identifica la comunidad?</span>
                </div>
                <p className="text-[11px] mb-3 text-[#8FA3C7]">Lo único público. Puedes cambiarlo cuando quieras.</p>
                <div className="flex gap-2.5">
                  <IdentityCard mode="anon" anon label="Anónimo" preview={`Usuario-${form.identity_number}`} />
                  <IdentityCard mode="real" icon={<Check size={17} style={{ color: '#0047AB' }} />}
                    label="Mi nombre" preview={form.full_name || 'Tu nombre'} />
                </div>
              </div>

              {error && <p className="text-[12px] font-semibold text-red-500">{error}</p>}

              <button type="submit" disabled={!step1Valid} className={primaryBtn} style={primaryStyle}>
                Continuar <ArrowRight size={16} />
              </button>
              <button type="button" onClick={signOut}
                className="w-full text-center text-[12px] font-bold text-[#8FA3C7] hover:underline py-1">
                Cerrar sesión
              </button>
            </form>
          )}

          {/* ═════════ PASO 2: CONTRASEÑA ═════════ */}
          {step === 2 && (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelCls}>Contraseña</label>
                  <PrivacyBadge variant="private" />
                </div>
                <input type="password" value={form.password} autoComplete="new-password"
                  onChange={e => set('password', e.target.value)}
                  placeholder={needsPassword ? 'Mínimo 6 caracteres' : 'Déjalo vacío para no cambiarla'}
                  className={inputCls} />
              </div>

              <div>
                <label className={`${labelCls} block mb-1.5`}>Repite la contraseña</label>
                <input type="password" value={form.password2} autoComplete="new-password"
                  onChange={e => set('password2', e.target.value)}
                  placeholder="Escríbela de nuevo" className={inputCls} />
                {passFilled && form.password2.length > 0 && (
                  <p className="text-[11px] mt-1.5 font-bold" style={{ color: passMatch ? '#16a34a' : '#dc2626' }}>
                    {passMatch ? '✓ Las contraseñas coinciden' : 'No coinciden'}
                  </p>
                )}
                {!needsPassword && (
                  <p className="text-[11px] mt-1.5 text-[#8FA3C7]">Opcional: solo si quieres establecer una nueva.</p>
                )}
              </div>

              {error && <p className="text-[12px] font-semibold text-red-500">{error}</p>}

              <button type="submit" disabled={!step2Valid || loading} className={primaryBtn} style={primaryStyle}>
                {loading ? <Spinner size={16} /> : 'Entrar a Cobalto'}
              </button>
              <button type="button" onClick={() => { setStep(1); setError('') }}
                className="w-full flex items-center justify-center gap-1.5 text-[12px] font-bold text-[#0047AB] hover:underline py-1">
                <ArrowLeft size={13} /> Volver
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
