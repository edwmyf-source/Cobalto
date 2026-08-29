import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X, Camera, Loader2, Lock, ArrowLeft } from 'lucide-react'
import { updateProfile, uploadAvatar } from '../api/profiles'
import { updatePassword } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'
import { DEPARTAMENTOS } from '../lib/constants'
import { safeErrorMessage } from '../lib/errors'
import { generateIdentityNumber } from '../lib/helpers'
import PrivacyBadge from '../components/shared/PrivacyBadge'
import UserAvatar from '../components/shared/UserAvatar'
import Spinner from '../components/shared/Spinner'

// Campo "invisible": sin borde ni caja propia — el contorno lo da la fila
// que lo contiene (FormRow). Es el patrón de listas de Ajustes de iOS: el
// valor se ve como texto editable, no como una casilla de formulario aparte.
const fieldCls = 'w-full bg-transparent border-0 outline-none text-[15px] font-medium p-0 h-6'
const labelCls = 't-caption font-semibold'
const labelStyle = { color: 'var(--text-tertiary)' }

// Campo boxed: para SecureAccountSection, que vive fuera de la lista
// agrupada (es su propia tarjeta), así que sí necesita borde propio.
const boxedFieldCls = 'w-full px-4 h-12 rounded-input text-[15px] focus:outline-none transition-all'
const boxedFieldStyle = { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 500 }

// Una fila de la lista agrupada: etiqueta chica arriba, campo abajo, línea
// divisoria fina entre filas. Cuando el campo es obligatorio y está vacío,
// la fila se tiñe suavemente y muestra un punto — así se ve de un vistazo
// qué falta, sin necesidad de textos de ayuda en cada campo.
function FormRow({ label, htmlFor, privacy, hint, isLast, pendiente, children }) {
  return (
    <div className="px-4 py-3 transition-colors"
      style={{
        borderBottom: isLast ? undefined : '1px solid var(--border-soft)',
        background: pendiente ? 'var(--warning-bg)' : 'transparent',
      }}>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={htmlFor} className={`${labelCls} inline-flex items-center gap-1.5`} style={labelStyle}>
          {pendiente && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--warning)' }} />}
          {label}
        </label>
        {privacy && <PrivacyBadge variant={privacy} />}
      </div>
      <div style={{ color: 'var(--text-primary)' }}>{children}</div>
      {hint && <p className="t-caption mt-1" style={{ color: 'var(--text-tertiary)', opacity: 0.8 }}>{hint}</p>}
    </div>
  )
}

export default function ProfilePage() {
  const { session, profile, setProfile } = useAuth()
  const navigate = useNavigate()
  const userId = session?.user?.id || ''
  const rawEmail = session?.user?.email || ''
  // Ver nota en ProfileSetup.jsx: el registro exprés por celular usa un correo
  // sintético invisible que nunca debe tratarse como el email real.
  const isSyntheticEmail = rawEmail.endsWith('@phone.redcobalto.com')
  const userEmail = isSyntheticEmail ? '' : rawEmail
  const defaultNumber = useMemo(() => generateIdentityNumber(userId), [userId])
  const avatarInputRef = useRef(null)

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    headline: profile?.headline || '',
    company_name: profile?.company_name || '',
    phone: profile?.phone || '',
    city: profile?.city || '',
    identity_mode: 'real',
    identity_number: profile?.identity_number || defaultNumber,
  })
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSaved(false) }

  // Para guardar hace falta el perfil mínimo completo: nombre, teléfono y una
  // frase sobre ti. El correo llega del login, así que no se pide aparte.
  const faltaNombre   = !form.full_name.trim()
  const faltaTelefono = !form.phone.trim()
  const faltaHeadline = !form.headline.trim()
  const valid = !faltaNombre && !faltaTelefono && !faltaHeadline
  const pendientes = [faltaNombre, faltaTelefono, faltaHeadline].filter(Boolean).length

  // Manejar selección de nueva foto
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('La foto no puede superar 5 MB'); return }

    // Preview local inmediato
    const localUrl = URL.createObjectURL(file)
    setAvatarPreview(localUrl)
    setUploadingAvatar(true)
    setError('')

    try {
      const url = await uploadAvatar(userId, file)
      setAvatarUrl(url)
      setAvatarPreview(null)
      // Guardar en el perfil inmediatamente
      const p = await updateProfile(userId, {
        full_name: form.full_name.trim(),
        headline: form.headline.trim() || null,
        company_name: form.company_name.trim(),
        phone: form.phone.trim(),
        city: form.city,
        identity_mode: form.identity_mode,
        identity_number: form.identity_number,
        ...(userEmail ? { email: userEmail, email_domain: null } : {}),
        avatar_url: url,
      })
      setProfile(p)
    } catch (err) {
      setError(safeErrorMessage(err))
      setAvatarPreview(null)
    }
    setUploadingAvatar(false)
    e.target.value = ''
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!valid) return
    setLoading(true); setError(''); setSaved(false)
    try {
      const p = await updateProfile(userId, {
        full_name: form.full_name.trim(),
        headline: form.headline.trim() || null,
        company_name: form.company_name.trim(),
        phone: form.phone.trim(),
        city: form.city,
        identity_mode: form.identity_mode,
        identity_number: form.identity_number,
        ...(userEmail ? { email: userEmail, email_domain: null } : {}),
        avatar_url: avatarUrl || null,
      })
      setProfile(p)
      setSaved(true)
    } catch (err) { setError(safeErrorMessage(err)) }
    setLoading(false)
  }

  const publicLabel = form.identity_mode === 'real'
    ? (form.full_name || 'Tu nombre')
    : `Usuario-${form.identity_number}`

  const displayAvatar = avatarPreview || avatarUrl

  return (
    <div className="page-enter max-w-lg mx-auto px-1">
      <button onClick={() => navigate(userId ? `/u/${userId}` : '/feed')}
        className="flex items-center gap-1.5 t-body-sm font-semibold mb-4 transition-colors"
        style={{ color: 'var(--text-tertiary)' }}>
        <ArrowLeft size={16} /> Ver mi perfil público
      </button>
      <h1 className="t-h1 mb-5" style={{ color: 'var(--text-primary)' }}>Mi perfil</h1>

      {/* Card pública actual — con foto */}
      <div className="rounded-panel p-5 mb-5 flex items-center gap-4"
        style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-soft)' }}>
        {/* Foto de perfil con botón de cambiar */}
        <div className="relative flex-shrink-0">
          <UserAvatar seed={userId} name={publicLabel} avatarUrl={displayAvatar} size={52} />
          {uploadingAvatar && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
              <Loader2 size={16} className="text-white animate-spin" />
            </div>
          )}
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors disabled:opacity-50"
            style={{ background: 'var(--accent-deep)', borderColor: 'var(--surface)' }}
            title="Cambiar foto"
            aria-label="Cambiar foto de perfil"
          >
            <Camera size={11} className="text-white" />
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="t-body-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{publicLabel}</p>
          <p className="t-caption mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{form.city || 'Sin departamento'}</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-3.5">
        <div className="rounded-panel overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)' }}>
          <FormRow label="Nombre" privacy="private" htmlFor="profile-fullname" pendiente={faltaNombre}>
            <input id="profile-fullname" value={form.full_name} onChange={e => set('full_name', e.target.value)}
              className={fieldCls} placeholder="Tu nombre" />
          </FormRow>

          <FormRow label="Sobre ti" privacy="public" htmlFor="profile-headline" pendiente={faltaHeadline}>
            <input id="profile-headline" value={form.headline} maxLength={120}
              onChange={e => set('headline', e.target.value)}
              className={fieldCls} placeholder="Ej: Química farmacéutica" />
          </FormRow>

          <FormRow label="Email" privacy="private" htmlFor="profile-email">
            <input id="profile-email" type="email" value={isSyntheticEmail ? '' : userEmail} disabled
              placeholder={isSyntheticEmail ? 'Sin correo' : ''}
              className={fieldCls} style={{ color: 'var(--text-tertiary)' }} />
          </FormRow>

          <FormRow label="Teléfono" privacy="private" htmlFor="profile-phone" pendiente={faltaTelefono}>
            <input id="profile-phone" value={form.phone} inputMode="tel"
              onChange={e => set('phone', e.target.value.replace(/[^0-9+ ]/g, '').slice(0, 15))}
              className={fieldCls} placeholder="300 123 4567" />
          </FormRow>

          <FormRow label="Departamento" privacy="public" isLast htmlFor="profile-city">
            <select id="profile-city" value={form.city} onChange={e => set('city', e.target.value)}
              className={fieldCls + ' appearance-none'}>
              <option value="">Seleccionar...</option>
              {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </FormRow>
        </div>

        {error && <p role="alert" className="t-caption font-semibold px-1" style={{ color: 'var(--error)' }}>{error}</p>}
        {saved && <p className="t-caption font-semibold px-1" style={{ color: 'var(--success)' }}>Perfil guardado.</p>}

        <button type="submit" disabled={!valid || loading}
          className="w-full flex items-center justify-center gap-2 text-white t-body-sm font-semibold h-12 rounded-full disabled:opacity-40 transition-all active:scale-[0.98]"
          style={{ background: 'var(--accent)' }}>
          {loading
            ? <Spinner size={16} />
            : valid
              ? 'Guardar cambios'
              : `Falta ${pendientes} ${pendientes === 1 ? 'campo' : 'campos'}`}
        </button>
      </form>

      {isSyntheticEmail && (
        <div className="mt-4">
          <SecureAccountSection userId={userId} />
        </div>
      )}
    </div>
  )
}

// ── Asegura tu cuenta: para quien se registró exprés (solo nombre + celular) ──
// Sin esto, si pierde el dispositivo o cierra sesión no tiene forma de volver a
// entrar, porque la cuenta se creó con una contraseña aleatoria que nadie conoce.
// Mayúscula, minúscula, número y longitud mínima — igual que en el registro.
const PASS_RULES = [
  { id: 'len',   label: 'Mínimo 6 caracteres', test: p => p.length >= 6 },
  { id: 'upper', label: 'Una mayúscula',       test: p => /[A-Z]/.test(p) },
  { id: 'lower', label: 'Una minúscula',       test: p => /[a-z]/.test(p) },
  { id: 'num',   label: 'Un número',           test: p => /[0-9]/.test(p) },
]

function SecureAccountSection({ userId }) {
  const [pass, setPass] = useState('')
  const [pass2, setPass2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const passStrength = PASS_RULES.filter(r => r.test(pass)).length
  const passStrong = passStrength === PASS_RULES.length
  const passValid = passStrong && pass === pass2

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!passValid) { setError('La contraseña debe tener mayúscula, minúscula, número y coincidir en ambos campos.'); return }
    setLoading(true)
    try {
      await updatePassword(pass.trim())
      setDone(true)
    } catch (err) {
      setError(safeErrorMessage(err))
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="rounded-panel p-5" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--accent-soft)' }}>
        <div className="flex items-center gap-2">
          <Check size={18} style={{ color: 'var(--success)' }} />
          <p className="t-body-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Contraseña guardada</p>
        </div>
        <p className="t-caption mt-1" style={{ color: 'var(--text-tertiary)' }}>
          Ya puedes entrar con tu celular y esta contraseña desde cualquier dispositivo.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-panel p-5" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--accent-soft)' }}>
      <div className="flex items-center gap-2 mb-1">
        <Lock size={16} style={{ color: 'var(--accent-deep)' }} />
        <p className="t-body-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Asegura tu cuenta</p>
      </div>
      <p className="t-caption mb-4" style={{ color: 'var(--text-tertiary)' }}>
        Creaste tu cuenta solo con tu celular. Agrega una contraseña para poder entrar
        también desde otro dispositivo si pierdes el acceso a este.
      </p>

      <div className="space-y-3">
        <label htmlFor="profile-newpass" className="sr-only">Nueva contraseña</label>
        <input id="profile-newpass" type="password" value={pass} onChange={e => setPass(e.target.value)}
          placeholder="Nueva contraseña" autoComplete="new-password"
          className={boxedFieldCls} style={boxedFieldStyle} />

        {pass.length > 0 && (() => {
          const level = passStrength <= 2 ? 'low' : passStrength === 3 ? 'mid' : 'high'
          const meta = {
            low:  { label: 'Seguridad baja',  color: 'var(--error)' },
            mid:  { label: 'Seguridad media', color: 'var(--warning)' },
            high: { label: 'Seguridad alta',  color: 'var(--success)' },
          }[level]
          return (
            <div>
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
              <p key={level} className="text-[12px] mt-1.5 font-bold" style={{ color: meta.color, animation: 'fadeInUp 220ms ease-out' }}>
                {meta.label}
              </p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
                {PASS_RULES.map(r => {
                  const ok = r.test(pass)
                  return (
                    <div key={r.id} className="flex items-center gap-1.5 transition-all duration-300" style={{ opacity: ok ? 1 : 0.55 }}>
                      <span className="flex items-center justify-center w-4 h-4 rounded-full flex-shrink-0 transition-all duration-300"
                        style={{ background: ok ? 'var(--success-bg)' : 'var(--accent-soft)', transform: ok ? 'scale(1)' : 'scale(0.9)' }}>
                        {ok ? <Check size={10} strokeWidth={3} style={{ color: 'var(--success)' }} />
                            : <X size={9} strokeWidth={2.5} style={{ color: 'var(--text-tertiary)' }} />}
                      </span>
                      <span className="text-[11px] font-medium" style={{ color: ok ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{r.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}

        <label htmlFor="profile-pass2" className="sr-only">Repetir contraseña</label>
        <input id="profile-pass2" type="password" value={pass2} onChange={e => setPass2(e.target.value)}
          placeholder="Repítela" autoComplete="new-password"
          className={boxedFieldCls} style={boxedFieldStyle} />
      </div>

      {error && <p role="alert" className="t-caption font-semibold mt-2" style={{ color: 'var(--error)' }}>{error}</p>}

      <button type="submit" disabled={loading || !passValid}
        className="mt-4 w-full flex items-center justify-center gap-2 text-white text-[14px] font-extrabold py-3 rounded-btn disabled:opacity-40 transition-all active:scale-95"
        style={{ background: 'var(--accent-deep)', boxShadow: 'var(--shadow-raised)' }}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Guardar contraseña'}
      </button>
    </form>
  )
}
