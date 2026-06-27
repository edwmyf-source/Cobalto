import { useState, useEffect, useRef } from 'react'
import { Send } from 'lucide-react'
import { getComments, createComment } from '../../api/comments'
import { createNotification } from '../../api/notifications'
import { useAuth } from '../../contexts/AuthContext'
import { publicName, timeAgo } from '../../lib/helpers'
import UserAvatar from '../shared/UserAvatar'
import Spinner from '../shared/Spinner'

export default function CommentSection({ post, isOpen }) {
  const { session } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  // Solo cargamos comentarios la primera vez que se abre la sección
  const loadedRef = useRef(false)

  useEffect(() => {
    if (!isOpen || !post?.id || loadedRef.current) return
    loadedRef.current = true
    setLoading(true)
    getComments(post.id)
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isOpen, post?.id])

  const handleSubmit = async () => {
    if (!text.trim() || sending) return
    setSending(true)
    try {
      const comment = await createComment({
        post_id: post.id,
        user_id: session.user.id,
        content: text.trim(),
      })
      setComments(prev => [...prev, comment])
      setText('')
      // Notify post author
      if (post.author_id !== session.user.id) {
        createNotification({
          user_id: post.author_id,
          from_user_id: session.user.id,
          type: 'comment',
          content: `comentó en tu publicación: "${text.trim().slice(0, 60)}"`,
          post_id: post.id,
        })
      }
    } catch (e) {
      console.error('Comment error:', e)
    }
    setSending(false)
  }

  if (!isOpen) return null

  return (
    <div className="border-t border-ink-100 pt-3 mt-3">
      {loading ? (
        <div className="flex justify-center py-3"><Spinner size={16} className="text-brand-600" /></div>
      ) : (
        <>
          {comments.length > 0 && (
            <div className="space-y-2.5 mb-3 max-h-[200px] overflow-y-auto">
              {comments.map(c => {
                const prof = c.profiles || {}
                const name = publicName(prof)
                return (
                  <div key={c.id} className="flex items-start gap-2">
                    <UserAvatar seed={prof.id || name} size={26} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-ink-900">{name}</span>
                        <span className="text-[10px] text-ink-400">{timeAgo(c.created_at)}</span>
                      </div>
                      <p className="text-xs text-ink-700 mt-0.5">{c.content}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {comments.length === 0 && (
            <p className="text-[11px] text-ink-400 text-center mb-3">Sé el primero en comentar</p>
          )}

          <div className="flex items-center gap-2">
            <UserAvatar seed={session?.user?.id || 'me'} size={26} />
            <input value={text} onChange={e => setText(e.target.value)}
              placeholder="Escribe un comentario..."
              className="flex-1 px-3 py-1.5 rounded-full border border-ink-200 text-xs focus:outline-none focus:border-brand-600 bg-ink-100/50"
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} />
            <button onClick={handleSubmit} disabled={!text.trim() || sending}
              className="p-1.5 rounded-full bg-brand-600 text-white disabled:opacity-30 hover:bg-brand-700">
              {sending ? <Spinner size={12} /> : <Send size={12} />}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
