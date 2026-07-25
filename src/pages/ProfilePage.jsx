import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Camera, Loader2, Lock, Globe, ShieldCheck, ArrowLeft } from 'lucide-react'
import { updateProfile, uploadAvatar } from '../api/profiles'
import { updatePassword } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'
import { DEPARTAMENTOS, isAdmin } from '../lib/constants'
import { safeErrorMessage } from '../lib/errors'
import { generateIdentityNumber } from '../lib/helpers'
import PrivacyBadge from '../components/shared/PrivacyBadge'
import UserAvatar from '../components/shared/UserAvatar'
import Spinner from '../components/shared/Spinner'
import MFASetup from '../components/auth/MFASetup'

const inputCls = 'w-full px-4 h-14 rounded-card text-[16px] focus:outline-none transition-all'
const inputStyle = { background: '#ffffff', border: 'none', boxShadow: '0 4px 14px rgba(0,71,171,0.07)', color: 'var(--text-primary)', fontWeight: 500 }
const labelCls = 'text-[14px] font-bold text-[var(--text-primary)] mb-1.5 block'

export default function ProfilePage() {
  const { session, profile, setProfile } = useAuth()
  const navigate = useNavigate()
  const userId = session?.user?.id || ''
  const rawEmail = session?.user?.email || ''
  // Ver nota en ProfileSetup.jsx: el registro exprés por celular usa un correo
  // sintético invisible que nunca debe tratarse como el email real.
  const isSyntheticEmail = rawEmail.endsWith('@phone.cobalto.app')
  const userEmail = isSyntheticEmail ? '' : rawEmail
  const defaultNumber = useMemo(() => generateIdentityNumber(userId), [userId])
  const avatarInputRef = useRef(null)

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
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
  const valid = form.full_name && form.phone

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
        className="flex items-center gap-1.5 text-[14px] font-medium text-gray-500 hover:text-gray-900 mb-4 transition-colors">
        <ArrowLeft size={16} /> Ver mi perfil público
      </button>
      <h2 className="font-extrabold text-[28px] text-[var(--text-primary)] mb-1" style={{ letterSpacing: '-0.03em' }}>Configuración</h2>
      <p className="text-[15px] text-gray-500 mb-6">Actualiza tus datos cuando quieras.</p>

      {/* Card pública actual — con foto */}
      <div className="bg-white rounded-3xl p-6 mb-5 flex items-center gap-4" style={{ boxShadow: '0 4px 24px rgba(17,24,39,0.05)' }}>
        {/* Foto de perfil con botón de cambiar */}
        <div className="relative flex-shrink-0">
          <UserAvatar seed={userId} avatarUrl={displayAvatar} size={52} />
          {uploadingAvatar && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
              <Loader2 size={16} className="text-white animate-spin" />
            </div>
          )}
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center border-2 border-white hover:bg-brand-700 transition-colors disabled:opacity-50"
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
          <p className="text-sm font-medium text-ink-900">{publicLabel}</p>
          <p className="text-[11px] text-ink-500 mt-0.5">{form.city || 'Sin departamento'}</p>
          <p className="text-[10px] text-ink-400 mt-0.5">Lo único público de tu cuenta.</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-3.5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-ink-500 mt-3">Datos privados</p>

        <div className="bg-white border border-ink-300 rounded-2xl p-4 space-y-3.5">
          <div>
            <div className="flex items-center justify-between mb-1"><label className={labelCls}>Nombre completo</label><PrivacyBadge variant="private" /></div>
            <input value={form.full_name} onChange={e => set('full_name', e.target.value)} className={inputCls} style={inputStyle} placeholder="Tu nombre" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1"><label className={labelCls}>Empresa</label><PrivacyBadge variant="private" /></div>
            <input value={form.company_name} onChange={e => set('company_name', e.target.value)} className={inputCls} style={inputStyle} placeholder="Nombre de tu empresa" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1"><label className={labelCls}>Email</label><PrivacyBadge variant="private" /></div>
            <input type="email" value={isSyntheticEmail ? '' : userEmail} disabled
              placeholder={isSyntheticEmail ? 'Aún no has agregado un correo' : ''}
              className={inputCls} style={{ ...inputStyle, background: '#F3F4F6', color: '#9CA3AF' }} />
            <p className="text-[11px] text-ink-500 mt-1">Tu email es 100% privado y nunca será visible.</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1"><label className={labelCls}>Teléfono</label><PrivacyBadge variant="private" /></div>
            <input value={form.phone} onChange={e => set('phone', e.target.value.replace(/[^0-9+ ]/g, '').slice(0, 15))} className={inputCls} style={inputStyle} placeholder="300 123 4567" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1"><label className={labelCls}>Departamento</label><PrivacyBadge variant="public" /></div>
            <select value={form.city} onChange={e => set('city', e.target.value)} className={inputCls}>
              <option value="">Seleccionar...</option>
              {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <p className="text-[11px] font-medium uppercase tracking-wider text-ink-500 mt-3">Identidad pública</p>

        {error && <p className="text-xs text-danger-500">{error}</p>}
        {saved && <p className="text-xs text-success-500">Perfil guardado.</p>}

        <button type="submit" disabled={!valid || loading}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-medium py-2.5 rounded-2xl disabled:opacity-50">
          {loading ? <Spinner size={16} /> : 'Guardar cambios'}
        </button>
      </form>

      {/* ─── Configuración: privacidad de tus datos ─── */}
      <div className="mt-5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-ink-500 mb-2">Configuración · Privacidad de tus datos</p>
        <div className="bg-white border border-ink-300 rounded-2xl p-4">
          <div className="flex items-start gap-2 mb-3">
            <ShieldCheck size={15} className="text-success-700 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-ink-500 leading-relaxed">
              Esto es lo que la comunidad <strong className="text-ink-900 font-medium">ve</strong> y lo que <strong className="text-ink-900 font-medium">nunca verá</strong> de tu cuenta.
            </p>
          </div>
          <div className="space-y-px">
            {[
              { label: 'Nombre completo', priv: true },
              { label: 'Empresa', priv: true },
              { label: 'Email', priv: true },
              { label: 'Teléfono', priv: true },
              { label: 'Departamento', priv: false },
              { label: 'Identidad pública (nombre o anónimo)', priv: false },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-ink-100 last:border-0">
                <span className="text-[13px] text-ink-900 flex items-center gap-2">
                  {row.priv
                    ? <Lock size={13} className="text-ink-400" />
                    : <Globe size={13} className="text-brand-600" />}
                  {row.label}
                </span>
                <PrivacyBadge variant={row.priv ? 'private' : 'public'} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {isSyntheticEmail && (
        <div className="mt-4">
          <SecureAccountSection userId={userId} />
        </div>
      )}

      {isAdmin(profile, session?.user?.email) && (
        <div className="mt-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-500 mb-2">Seguridad</p>
          <MFASetup />
        </div>
      )}
    </div>
  )
}

// ── Asegura tu cuenta: para quien se registró exprés (solo nombre + celular) ──
// Sin esto, si pierde el dispositivo o cierra sesión no tiene forma de volver a
// entrar, porque la cuenta se creó con una contraseña aleatoria que nadie conoce.
function SecureAccountSection({ userId }) {
  const [pass, setPass] = useState('')
  const [pass2, setPass2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const passValid = pass.trim().length >= 6 && pass === pass2

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!passValid) { setError('Escribe la misma contraseña dos veces, mínimo 6 caracteres.'); return }
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
          <Check size={18} style={{ color: '#16a34a' }} />
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
        <input type="password" value={pass} onChange={e => setPass(e.target.value)}
          placeholder="Nueva contraseña" autoComplete="new-password"
          className={inputCls} style={inputStyle} />
        <input type="password" value={pass2} onChange={e => setPass2(e.target.value)}
          placeholder="Repítela" autoComplete="new-password"
          className={inputCls} style={inputStyle} />
      </div>

      {error && <p className="t-caption font-semibold mt-2" style={{ color: '#dc2626' }}>{error}</p>}

      <button type="submit" disabled={loading || !passValid}
        className="mt-4 w-full flex items-center justify-center gap-2 text-white text-[14px] font-extrabold py-3 rounded-btn disabled:opacity-40 transition-all active:scale-95"
        style={{ background: 'var(--accent-deep)', boxShadow: 'var(--shadow-raised)' }}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Guardar contraseña'}
      </button>
    </form>
  )
}
