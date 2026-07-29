import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { getCommunityStats } from '../../api/stats'

export default function PublishSuccessModal({ open, onClose, onViewMyRequest }) {
  const [count, setCount] = useState(null)

  useEffect(() => {
    if (open) {
      getCommunityStats()
        .then(s => setCount(s.activeThisWeek || s.connections || 0))
        .catch(() => setCount(0))
    }
  }, [open])

  if (!open) return null

  const formattedCount = count !== null ? count.toLocaleString('es-CO') : '—'

  return (
    // Anclado ARRIBA (no centrado): en pantallas altas o con el teclado abierto,
    // un modal centrado queda por debajo del pliegue y parece "perdido abajo".
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 overflow-y-auto"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 72px)', paddingBottom: 24,
        background: 'rgba(15,23,42,0.32)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="pub-ok-title">
      <div className="modal-enter rounded-modal w-full max-w-sm p-6 text-center"
        style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-modal)' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="rounded-full inline-flex items-center justify-center mb-4"
          style={{ width: 52, height: 52, background: 'var(--success-bg)' }}>
          <Check size={26} strokeWidth={2.2} style={{ color: 'var(--success)' }} />
        </div>

        <h2 id="pub-ok-title" className="t-h4 mb-1.5" style={{ color: 'var(--text-primary)' }}>
          ¡Publicación realizada!
        </h2>

        <p className="t-body-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formattedCount} personas</strong> ya pueden ver tu publicación.
        </p>

        <div className="flex gap-3">
          <button onClick={onViewMyRequest}
            className="flex-1 h-[44px] rounded-btn text-[14px] font-semibold transition-all duration-[160ms] active:scale-[0.98]"
            style={{ background: 'var(--surface)', color: 'var(--text-primary)', boxShadow: 'inset 0 0 0 1px var(--border)' }}>
            Ver mi publicación
          </button>
          <button onClick={onClose}
            className="flex-1 h-[44px] rounded-btn text-[14px] font-semibold text-white transition-all duration-[160ms] active:scale-[0.98]"
            style={{ background: 'var(--accent-deep)' }}>
            Volver al feed
          </button>
        </div>
      </div>
    </div>
  )
}
