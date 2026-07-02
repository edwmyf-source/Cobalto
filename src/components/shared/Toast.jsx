import { useState, useCallback, createContext, useContext } from 'react'

const ToastCtx = createContext()
export const useToast = () => useContext(ToastCtx)

const styles = {
  success: 'bg-success-50 text-success-500 border-success-500/30',
  error:   'bg-danger-50 text-danger-500 border-danger-500/30',
  warn:    'bg-ink-100 text-ink-900 border-ink-300',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }, [])

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="fixed top-4 inset-x-4 md:inset-x-auto md:top-6 md:right-6 z-[60] flex flex-col items-center md:items-end gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-2 rounded-2xl border text-sm font-medium shadow-lg pointer-events-auto max-w-[calc(100vw-2rem)] md:max-w-sm ${styles[t.type]}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
