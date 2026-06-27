import { useState } from 'react'
import { signUp } from '../../api/auth'
import Spinner from '../shared/Spinner'

const ERR_MAP = {
  'User already registered': 'Este email ya está registrado.',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
}

export default function SignupForm({ onSwitchLogin }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp(email, pass)
      setSuccess('Revisa tu email para confirmar tu cuenta.')
    } catch (err) {
      setError(ERR_MAP[err.message] || err.message)
    }
    setLoading(false)
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-2xl border border-ink-300 bg-gray-50 text-ink-900 placeholder-ink-400 text-[13px] focus:outline-none focus:border-brand-600 focus:bg-white transition-colors'

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h2 className="font-semibold text-lg text-ink-900 tracking-tight">Crear cuenta</h2>
        <p className="text-xs mt-0.5 text-ink-500">Te tomará menos de 1 minuto</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-900 mb-1.5">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
          placeholder="tu@empresa.com" className={inputCls} />
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-900 mb-1.5">Contraseña</label>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)} required minLength={6}
          placeholder="Mínimo 6 caracteres" className={inputCls} />
      </div>

      {error && <p className="text-xs text-danger-500">{error}</p>}
      {success && <p className="text-xs text-success-500">{success}</p>}

      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-medium py-2.5 rounded-2xl disabled:opacity-50 transition-colors">
        {loading ? <Spinner size={16} /> : 'Crear cuenta'}
      </button>

      <div className="text-center text-xs pt-4 border-t border-ink-200 text-ink-500">
        ¿Ya tienes cuenta?{' '}
        <button type="button" onClick={onSwitchLogin} className="text-brand-600 hover:underline font-medium">
          Iniciar sesión
        </button>
      </div>
    </form>
  )
}
