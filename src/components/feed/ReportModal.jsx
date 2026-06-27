import { useState } from 'react'
import { Flag } from 'lucide-react'
import { reportPost } from '../../api/moderation'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../shared/Toast'
import Modal from '../shared/Modal'
import Spinner from '../shared/Spinner'

const REASONS = [
  'Spam o publicidad no deseada',
  'Contenido falso o engañoso',
  'Lenguaje ofensivo o acoso',
  'Contenido inapropiado',
  'Información personal sensible',
  'Otro',
]

export default function ReportModal({ post, open, onClose }) {
  const { session } = useAuth()
  const toast = useToast()
  const [reason, setReason] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!reason || sending) return
    setSending(true)
    try {
      await reportPost({ post_id: post.id, reporter_id: session.user.id, reason })
      toast('Reporte enviado. Lo revisaremos pronto.', 'success')
      setReason('')
      onClose()
    } catch { toast('Error al enviar el reporte', 'error') }
    setSending(false)
  }

  if (!post) return null

  return (
    <Modal open={open} onClose={onClose} title="Reportar publicación">
      <div className="space-y-3">
        <p className="text-xs text-ink-500 leading-relaxed">
          ¿Por qué quieres reportar esta publicación? Tu reporte es anónimo.
        </p>
        <div className="space-y-1.5">
          {REASONS.map(r => (
            <button key={r} onClick={() => setReason(r)}
              className={`w-full text-left px-3 py-2.5 rounded-2xl text-[12px] border transition-all ${
                reason === r
                  ? 'border-brand-500 bg-brand-500/8 text-brand-700 font-medium'
                  : 'border-ink-200 text-ink-700 hover:bg-ink-50'
              }`}>
              {r}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-ink-700 hover:bg-slate-50 rounded-2xl">
            Cancelar
          </button>
          <button onClick={handleSend} disabled={!reason || sending}
            className="flex items-center gap-2 bg-danger-500 hover:bg-danger-600 text-white text-xs font-medium px-4 py-2 rounded-2xl disabled:opacity-50">
            {sending ? <Spinner size={14} /> : <><Flag size={13} /> Enviar reporte</>}
          </button>
        </div>
      </div>
    </Modal>
  )
}
