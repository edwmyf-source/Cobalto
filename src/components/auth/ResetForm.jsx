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

  const inputCls = 'w-full px-3 py-2.5 rounded-2xl border border-ink-300 bg-gray-50 text-ink-900 placeholder-ink-400 text-[13px] focus:outline-none focus:border-brand-600 focus:bg-white transition-colors'

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h2 className="font-semibold text-lg text-ink-900 tracking-tight">Restablecer contraseña</h2>
        <p className="text-xs mt-0.5 text-ink-500">Te enviaremos un enlace por email.</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-900 mb-1.5">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
          placeholder="tu@empresa.com" className={inputCls} />
      </div>

      {error && <p className="text-xs text-danger-500">{error}</p>}
      {success && <p className="text-xs text-success-500">{success}</p>}

      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-medium py-2.5 rounded-2xl disabled:opacity-50 transition-colors">
        {loading ? <Spinner size={16} /> : 'Enviar enlace'}
      </button>

      <div className="text-center text-xs text-ink-500">
        <button type="button" onClick={onSwitchLogin} className="text-brand-600 hover:underline">
          Volver
        </button>
      </div>
    </form>
  )
}
