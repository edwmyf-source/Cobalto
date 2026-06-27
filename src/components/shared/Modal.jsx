import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} overflow-y-auto`}
        style={{ maxHeight: 'min(90dvh, 90vh)' }}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="px-6 pt-5 pb-2 border-b border-ink-100">
            <h2 className="font-bold text-lg text-ink-900">{title}</h2>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
