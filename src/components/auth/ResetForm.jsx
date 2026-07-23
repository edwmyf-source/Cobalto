import { useState } from 'react'
import { supabase } from '../../api/supabase'
import Spinner from '../shared/Spinner'

export default function ResetForm({ onSwitchLogin }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
      setSuccess('Te enviamos un enlace para restablecer tu contraseña.')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const inputCls = 'w-full px-4 py-3 rounded-[14px] border border-ink-200 bg-ink-50 text-ink-900 placeholder-ink-400 text-[14px] font-medium focus:outline-none focus:border-brand-600 focus:bg-white transition-colors'

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h2 className="font-extrabold text-[20px] text-[#0A2A5C]" style={{ letterSpacing: '-0.02em' }}>Restablecer contraseña</h2>
        <p className="text-[12px] mt-1 font-medium text-[#8FA3C7]">Te enviaremos un enlace por email.</p>
      </div>

      <div>
        <label className="block text-[12px] font-bold text-[#0A2A5C] mb-1.5">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
          placeholder="tu@empresa.com" className={inputCls} />
      </div>

      {error && <p className="text-[12px] font-semibold text-red-500">{error}</p>}
      {success && <p className="text-[12px] font-semibold text-green-600">{success}</p>}

      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 text-white text-[14px] font-extrabold py-3 rounded-[14px] disabled:opacity-50 transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg,#0B2E68,#1A5AC8)', boxShadow: '0 8px 20px rgba(11,46,104,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
        {loading ? <Spinner size={16} /> : 'Enviar enlace'}
      </button>

      <div className="text-center text-[12px] font-medium text-[#8FA3C7]">
        <button type="button" onClick={onSwitchLogin} className="text-brand-600 hover:underline">
          Volver
        </button>
      </div>
    </form>
  )
}
