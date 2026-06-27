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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-sm p-7 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="rounded-full bg-success-50 inline-flex items-center justify-center mb-3.5"
          style={{ width: 52, height: 52 }}>
          <Check size={26} className="text-success-700" />
        </div>

        <h2 className="font-medium text-base tracking-tight text-ink-900 mb-1.5">¡Publicación realizada!</h2>

        <p className="text-[13px] text-ink-500 mb-5 leading-relaxed">
          <strong className="text-ink-900 font-medium">{formattedCount} personas</strong> ya pueden ver tu publicación.
        </p>

        <div className="flex gap-2">
          <button onClick={onViewMyRequest}
            className="flex-1 bg-white text-ink-900 border border-ink-300 py-2 rounded-2xl text-xs font-medium hover:bg-slate-50">
            Ver mi publicación
          </button>
          <button onClick={onClose}
            className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-2xl text-xs font-medium">
            Volver al feed
          </button>
        </div>
      </div>
    </div>
  )
}
