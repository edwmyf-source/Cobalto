import { useState } from 'react'
import { signIn } from '../../api/auth'
import Spinner from '../shared/Spinner'

const ERR_MAP = {
  'Invalid login credentials': 'Email o contraseña incorrectos.',
  'Email not confirmed': 'Confirma tu email antes de iniciar sesión.',
}

export default function LoginForm({ onSwitchSignup, onSwitchReset }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, pass)
    } catch (err) {
      setError(ERR_MAP[err.message] || err.message)
    }
    setLoading(false)
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-2xl border border-ink-300 bg-gray-50 text-ink-900 placeholder-ink-400 text-[13px] focus:outline-none focus:border-brand-600 focus:bg-white transition-colors'

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h2 className="font-semibold text-lg text-ink-900 tracking-tight">Iniciar sesión</h2>
        <p className="text-xs mt-0.5 text-ink-500">Bienvenido de vuelta</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-900 mb-1.5">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
          placeholder="tu@empresa.com" className={inputCls} />
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-900 mb-1.5">Contraseña</label>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)} required minLength={6}
          placeholder="••••••••" className={inputCls} />
        <button type="button" onClick={onSwitchReset} className="text-xs text-brand-600 hover:underline mt-2 inline-block">
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {error && <p className="text-xs text-danger-500">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-medium py-2.5 rounded-2xl disabled:opacity-50 transition-colors">
        {loading ? <Spinner size={16} /> : 'Entrar'}
      </button>

      <div className="text-center text-xs pt-4 border-t border-ink-200 text-ink-500">
        ¿Sin cuenta?{' '}
        <button type="button" onClick={onSwitchSignup} className="text-brand-600 hover:underline font-medium">
          Crear cuenta
        </button>
      </div>
    </form>
  )
}
