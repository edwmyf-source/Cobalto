import { useState } from 'react'
import { Send } from 'lucide-react'
import { getOrCreateConversation, sendMessage } from '../../api/messages'
import { createNotification } from '../../api/notifications'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../shared/Toast'
import { safeErrorMessage } from '../../lib/errors'
import { publicName } from '../../lib/helpers'
import Modal from '../shared/Modal'
import Spinner from '../shared/Spinner'

export default function ContactModal({ post, open, onClose, onSent }) {
  const { session } = useAuth()
  const toast = useToast()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  if (!post) return null
  const authorName = publicName(post.profiles || {})

  const handleSend = async () => {
    if (!message.trim() || sending) return
    setSending(true)
    try {
      const conv = await getOrCreateConversation(session.user.id, post.author_id, post.id)
      await sendMessage({
        conversation_id: conv.id,
        sender_id: session.user.id,
        content: message.trim(),
      })
      createNotification({
        user_id: post.author_id,
        from_user_id: session.user.id,
        type: 'message',
        content: `te envió un mensaje sobre "${post.title.slice(0, 50)}"`,
        post_id: post.id,
      })
      toast('Mensaje enviado', 'success')
      setMessage('')
      onClose()
      onSent?.()
    } catch (e) {
      toast(safeErrorMessage(e), 'error')
    }
    setSending(false)
  }

  const quickMessages = [
    'Me interesa, te escribo al privado',
    '¿Podrías darme más información?',
    '¿Cuál es el precio?',
    '¿Está disponible?',
  ]

  return (
    <Modal open={open} onClose={onClose} title={`Contactar a ${authorName}`}>
      <div className="space-y-3">
        <div className="bg-ink-100 rounded-2xl p-3">
          <p className="font-medium text-xs text-ink-900">{post.title}</p>
          {post.content && <p className="text-xs text-ink-500 mt-1 line-clamp-2">{post.content}</p>}
        </div>

        {/* Quick messages */}
        <div>
          <p className="text-[11px] text-ink-500 font-medium mb-1.5">Mensajes rápidos:</p>
          <div className="flex flex-wrap gap-1.5">
            {quickMessages.map(qm => (
              <button key={qm} onClick={() => setMessage(qm)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                  message === qm
                    ? 'bg-brand-500/10 border-brand-500/30 text-brand-700'
                    : 'border-ink-200 text-ink-500 hover:bg-slate-50'
                }`}>
                {qm}
              </button>
            ))}
          </div>
        </div>

        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
          placeholder="Escribe tu mensaje..."
          className="w-full px-3 py-2 rounded-2xl border border-ink-300 text-[13px] resize-none focus:outline-none focus:border-brand-600" />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-ink-900 hover:bg-slate-50 rounded-2xl">Cancelar</button>
          <button onClick={handleSend} disabled={!message.trim() || sending}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium px-4 py-2 rounded-2xl disabled:opacity-50">
            {sending ? <Spinner size={14} /> : <><Send size={13} /> Enviar mensaje</>}
          </button>
        </div>
      </div>
    </Modal>
  )
}
