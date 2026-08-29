import { useState, useCallback, createContext, useContext } from 'react'

const ToastCtx = createContext()
export const useToast = () => useContext(ToastCtx)

const styles = {
  success: 'bg-[var(--success-bg)] text-[var(--success)] border-success-500/30',
  error:   'bg-[var(--error-bg)] text-[var(--error)] border-[var(--error)]/30',
  warn:    'bg-[var(--border-soft)] text-[var(--text-primary)] border-[var(--border)]',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), type === 'error' ? 6000 : 3000)
  }, [])

  // Lleva a Contacto con "Reportar un problema" ya elegido y el mensaje
  // prellenado con el error real y la pantalla donde ocurrió — así el reporte
  // captura el contexto exacto, sin que la persona tenga que describirlo.
  // ToastProvider vive fuera del Router (envuelve a RouterProvider en
  // App.jsx), así que no hay useNavigate/useLocation disponibles aquí: se
  // usa navegación directa del navegador y se pasan los datos por la URL.
  const reportError = useCallback((msg) => {
    const asunto = 'Reportar un problema'
    const mensaje = `Ocurrió esto en ${window.location.pathname}: ${msg}`
    window.location.href = `/contacto?asunto=${encodeURIComponent(asunto)}&mensaje=${encodeURIComponent(mensaje)}`
  }, [])

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="fixed inset-x-4 md:inset-x-auto md:right-6 z-[70] flex flex-col items-center md:items-end gap-2 pointer-events-none"
        style={{ top: 'calc(env(safe-area-inset-top) + 60px)' }}>
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-2 rounded-2xl border text-sm font-medium shadow-lg pointer-events-auto max-w-[calc(100vw-2rem)] md:max-w-sm ${styles[t.type]}`}>
            <div className="flex items-center gap-3">
              <span className="flex-1">{t.msg}</span>
              {t.type === 'error' && (
                <button onClick={() => reportError(t.msg)}
                  className="flex-shrink-0 text-[12px] font-bold underline underline-offset-2 whitespace-nowrap">
                  Reportar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
