import { useState, useMemo } from 'react'
import { Lock, Check, X, ArrowRight, ArrowLeft } from 'lucide-react'
import { updateProfile } from '../../api/profiles'
import { updatePassword, signOut } from '../../api/auth'
import { useAuth } from '../../contexts/AuthContext'
import { safeErrorMessage } from '../../lib/errors'
import { domainOf, generateIdentityNumber } from '../../lib/helpers'
import UserAvatar from '../shared/UserAvatar'
import PrivacyBadge from '../shared/PrivacyBadge'
import Spinner from '../shared/Spinner'

const inputCls = 'w-full px-4 py-3 rounded-btn border border-ink-200 bg-ink-50 text-ink-900 placeholder-ink-400 text-[14px] font-medium focus:outline-none focus:border-brand-600 focus:bg-white transition-colors'
const labelCls = 'text-[12px] font-bold text-[var(--text-primary)]'
const primaryBtn = 'w-full flex items-center justify-center gap-2 text-white text-[14px] font-extrabold h-[44px] rounded-btn disabled:opacity-40 transition-all active:scale-95'
const primaryStyle = { background: 'var(--accent-deep)', boxShadow: 'var(--shadow-raised)' }

// Reglas de seguridad de la contraseña: mayúscula, minúscula, número y longitud.
const PASS_RULES = [
  { id: 'len',   label: 'Mínimo 6 caracteres', test: p => p.length >= 6 },
  { id: 'upper', label: 'Una mayúscula',       test: p => /[A-Z]/.test(p) },
  { id: 'lower', label: 'Una minúscula',       test: p => /[a-z]/.test(p) },
  { id: 'num',   label: 'Un número',           test: p => /[0-9]/.test(p) },
]

export default function ProfileSetup() {
  const { session, profile, setProfile } = useAuth()
  const userId = session?.user?.id || ''
  const rawEmail = session?.user?.email || ''
  // El registro exprés por celular usa un correo sintético invisible
  // (numero@phone.redcobalto.com) solo para que Supabase pueda crear la cuenta.
  // Nunca debe tratarse como el email real de la persona.
  const isSyntheticEmail = rawEmail.endsWith('@phone.redcobalto.com')
  const userEmail = isSyntheticEmail ? '' : rawEmail
  const userPhone = session?.user?.phone || (isSyntheticEmail ? rawEmail.split('@')[0].replace(/^(\d)/, '+$1') : '')
  const defaultNumber = useMemo(() => generateIdentityNumber(userId), [userId])

  const pendingName = (() => {
    try { return sessionStorage.getItem('cobalto-pending-name') || '' } catch { return '' }
  })()

  const initialFullName = profile?.full_name || pendingName || ''
  const initialPhone = profile?.phone || userPhone || ''
  // Si el registro exprés (nombre + celular) ya dejó ambos datos listos, no
  // tiene sentido mostrar un Paso 1 vacío — se salta directo a la contraseña.
  const canSkipStep1 = initialFullName.trim().length >= 2 && initialPhone.replace(/\D/g, '').length >= 10

  const [step, setStep] = useState(canSkipStep1 ? 2 : 1)
  const [form, setForm] = useState({
    full_name: initialFullName,
    phone: initialPhone,
    identity_mode: profile?.identity_mode || 'real',
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
  const passRulesPassed = PASS_RULES.filter(r => r.test(form.password))
  const passStrength = passRulesPassed.length // 0 a 4
  const passLongEnough = passStrength === PASS_RULES.length
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
    if (passFilled && !passLongEnough) { setError('La contraseña debe tener mayúscula, minúscula, número y mínimo 6 caracteres.'); return }
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
      try { sessionStorage.removeItem('cobalto-pending-name') } catch {}
    } catch (err) {
      setError(safeErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const StepDots = () => (
    <div className="flex items-center gap-2 mb-4">
      {[1, 2].map(n => (
        <div key={n} className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-extrabold transition-all"
            style={step >= n
              ? { background: 'var(--accent-deep)', color: '#fff' }
              : { background: 'var(--accent-soft)', color: 'var(--text-tertiary)' }}>
            {step > n ? <Check size={12} strokeWidth={3} /> : n}
          </div>
          {n === 1 && <div className="w-8 h-[2px] rounded-full" style={{ background: step > 1 ? 'var(--accent)' : 'var(--accent-soft)' }} />}
        </div>
      ))}
      <span className="ml-1 text-[12px] font-bold text-[var(--text-tertiary)]">
        {step === 1 ? 'Tus datos' : 'Tu contraseña'}
      </span>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: 'var(--bg-app)', WebkitOverflowScrolling: 'touch' }}>
      <div className="min-h-full flex items-start justify-center p-4 py-8">
        <div className="bg-white rounded-modal w-full max-w-md p-7" style={{ boxShadow: 'var(--shadow-modal)' }}>

          <span className="font-extrabold text-[20px] block mb-4" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            <span style={{ color: 'var(--brand-red)' }}>Red</span> Cobalto<span style={{ color: 'var(--accent)' }}>.</span>
          </span>

          <h2 className="font-extrabold text-[20px] text-[var(--text-primary)]" style={{ letterSpacing: '-0.02em' }}>
            Crea tu cuenta en 2 pasos
          </h2>
          <p className="text-[12px] mt-1 mb-4 font-medium text-[var(--text-tertiary)]">
            Solo nosotros sabemos quién eres. La comunidad no.
          </p>

          <StepDots />

          {/* ═════════ PASO 1: NOMBRE + CELULAR + IDENTIDAD ═════════ */}
          {step === 1 && (
            <form onSubmit={goNext} className="space-y-4">
              <div className="rounded-btn p-3 flex gap-2.5 items-start" style={{ background: '#F0FDF4' }}>
                <Lock size={15} className="text-green-700 mt-0.5 flex-shrink-0" />
                <p className="text-[12px] leading-relaxed text-green-800">
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

              {error && <p className="text-[12px] font-semibold text-red-500">{error}</p>}

              <button type="submit" disabled={!step1Valid} className={primaryBtn} style={primaryStyle}>
                Continuar <ArrowRight size={16} />
              </button>
              <button type="button" onClick={signOut}
                className="w-full text-center text-[12px] font-bold text-[var(--text-tertiary)] hover:underline py-1">
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
                  placeholder={needsPassword ? 'Mayúscula, minúscula y número' : 'Déjalo vacío para no cambiarla'}
                  className={inputCls} />

                {passFilled && (() => {
                  const level = passStrength <= 2 ? 'low' : passStrength === 3 ? 'mid' : 'high'
                  const meta = {
                    low:  { label: 'Seguridad baja',  color: '#dc2626', bg: '#FEE2E2' },
                    mid:  { label: 'Seguridad media',  color: '#d97706', bg: '#FEF3C7' },
                    high: { label: 'Seguridad alta',   color: '#16a34a', bg: '#DCFCE7' },
                  }[level]
                  return (
                    <div className="mt-2.5">
                      {/* Barra de tres segmentos, cada uno se enciende con una animacion suave */}
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map(i => {
                          const on = (level === 'low' && i === 0) || (level === 'mid' && i <= 1) || (level === 'high')
                          return (
                            <div key={i} className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: 'var(--accent-soft)' }}>
                              <div className="h-full rounded-full transition-all duration-500 ease-out"
                                style={{ width: on ? '100%' : '0%', background: meta.color }} />
                            </div>
                          )
                        })}
                      </div>
                      <p key={level} className="text-[12px] mt-1.5 font-bold transition-all duration-300"
                        style={{ color: meta.color, animation: 'fadeInUp 220ms ease-out' }}>
                        {meta.label}
                      </p>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
                        {PASS_RULES.map(r => {
                          const ok = r.test(form.password)
                          return (
                            <div key={r.id} className="flex items-center gap-1.5 transition-all duration-300"
                              style={{ opacity: ok ? 1 : 0.55 }}>
                              <span className="flex items-center justify-center w-4 h-4 rounded-full flex-shrink-0 transition-all duration-300"
                                style={{ background: ok ? '#DCFCE7' : 'var(--accent-soft)', transform: ok ? 'scale(1)' : 'scale(0.9)' }}>
                                {ok
                                  ? <Check size={10} strokeWidth={3} style={{ color: '#16a34a' }} />
                                  : <X size={9} strokeWidth={2.5} style={{ color: 'var(--text-tertiary)' }} />}
                              </span>
                              <span className="text-[11px] font-medium" style={{ color: ok ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                                {r.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}
              </div>

              <div>
                <label className={`${labelCls} block mb-1.5`}>Repite la contraseña</label>
                <input type="password" value={form.password2} autoComplete="new-password"
                  onChange={e => set('password2', e.target.value)}
                  placeholder="Escríbela de nuevo" className={inputCls} />
                {passFilled && form.password2.length > 0 && (
                  <p className="text-[12px] mt-1.5 font-bold" style={{ color: passMatch ? '#16a34a' : '#dc2626' }}>
                    {passMatch ? '✓ Las contraseñas coinciden' : 'No coinciden'}
                  </p>
                )}
                {!needsPassword && (
                  <p className="text-[12px] mt-1.5 text-[var(--text-tertiary)]">Opcional: solo si quieres establecer una nueva.</p>
                )}
              </div>

              {error && <p className="text-[12px] font-semibold text-red-500">{error}</p>}

              <button type="submit" disabled={!step2Valid || loading} className={primaryBtn} style={primaryStyle}>
                {loading ? <Spinner size={16} /> : 'Entrar a Cobalto'}
              </button>
              {!canSkipStep1 ? (
                <button type="button" onClick={() => { setStep(1); setError('') }}
                  className="w-full flex items-center justify-center gap-1.5 text-[12px] font-bold text-[var(--accent-deep)] hover:underline py-1">
                  <ArrowLeft size={13} /> Volver
                </button>
              ) : (
                <button type="button" onClick={signOut}
                  className="w-full text-center text-[12px] font-bold text-[var(--text-tertiary)] hover:underline py-1">
                  Cerrar sesión
                </button>
              )}
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
