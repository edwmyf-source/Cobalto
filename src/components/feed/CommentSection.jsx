import { useState, useEffect, useRef } from 'react'
import { Send } from 'lucide-react'
import { getComments, createComment } from '../../api/comments'
import { createNotification } from '../../api/notifications'
import { getMentionCandidates } from '../../api/follows'
import { useAuth } from '../../contexts/AuthContext'
import { publicName, timeAgo } from '../../lib/helpers'
import UserAvatar from '../shared/UserAvatar'
import Spinner from '../shared/Spinner'

// Resalta las menciones @nombre dentro de un comentario
function renderWithMentions(content) {
  const parts = content.split(/(@[\w.\-]+)/g)
  return parts.map((part, i) =>
    part.startsWith('@')
      ? <span key={i} className="text-brand-600 font-medium">{part}</span>
      : part
  )
}

export default function CommentSection({ post, isOpen }) {
  const { session } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const loadedRef = useRef(false)

  // ─── Menciones ───
  const [candidates, setCandidates] = useState([])      // seguidores + seguidos
  const [mentionQuery, setMentionQuery] = useState(null) // texto tras "@" o null si no estamos mencionando
  const [mentioned, setMentioned] = useState([])         // perfiles efectivamente etiquetados
  const inputRef = useRef(null)

  useEffect(() => {
    if (!isOpen || !post?.id || loadedRef.current) return
    loadedRef.current = true
    setLoading(true)
    getComments(post.id)
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isOpen, post?.id])

  // Cargar candidatos a mención una vez al abrir
  useEffect(() => {
    if (!isOpen || !session?.user?.id) return
    getMentionCandidates(session.user.id).then(setCandidates).catch(() => {})
  }, [isOpen, session?.user?.id])

  // Detecta si el usuario está escribiendo una mención (@algo) al final del texto
  const onChangeText = (value) => {
    setText(value)
    const match = value.match(/@([\w.\-]*)$/)
    setMentionQuery(match ? match[1].toLowerCase() : null)
  }

  const suggestions = mentionQuery !== null
    ? candidates
        .filter(p => publicName(p).toLowerCase().replace(/\s+/g, '').includes(mentionQuery.replace(/\s+/g, '')))
        .slice(0, 5)
    : []

  const pickMention = (prof) => {
    const handle = publicName(prof).replace(/\s+/g, '')
    // Reemplaza el "@parcial" final por "@Nombre "
    const newText = text.replace(/@([\w.\-]*)$/, `@${handle} `)
    setText(newText)
    setMentionQuery(null)
    setMentioned(prev => prev.find(m => m.id === prof.id) ? prev : [...prev, prof])
    inputRef.current?.focus()
  }

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

      // Notificar al autor del post
      if (post.author_id !== session.user.id) {
        createNotification({
          user_id: post.author_id,
          from_user_id: session.user.id,
          type: 'comment',
          content: `comentó en tu publicación: "${text.trim().slice(0, 60)}"`,
          post_id: post.id,
        })
      }

      // Notificar a los mencionados (que sigan apareciendo en el texto final)
      const finalText = text.trim()
      for (const m of mentioned) {
        const handle = publicName(m).replace(/\s+/g, '')
        if (!finalText.includes(`@${handle}`)) continue
        if (m.id === session.user.id || m.id === post.author_id) continue
        createNotification({
          user_id: m.id,
          from_user_id: session.user.id,
          type: 'mention',
          content: `te mencionó en un comentario`,
          post_id: post.id,
        })
      }

      setText('')
      setMentioned([])
      setMentionQuery(null)
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
                      <p className="text-xs text-ink-700 mt-0.5">{renderWithMentions(c.content)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {comments.length === 0 && (
            <p className="text-[11px] text-ink-400 text-center mb-3">Sé el primero en comentar</p>
          )}

          <div className="relative">
            {/* Desplegable de sugerencias de mención */}
            {suggestions.length > 0 && (
              <div className="absolute bottom-full mb-1 left-8 right-0 bg-white border border-ink-300 rounded-xl shadow-lg overflow-hidden z-10">
                {suggestions.map(p => (
                  <button key={p.id} type="button" onClick={() => pickMention(p)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-ink-100 text-left">
                    <UserAvatar seed={p.id} avatarUrl={p.avatar_url} size={22} />
                    <span className="text-xs text-ink-900">{publicName(p)}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <UserAvatar seed={session?.user?.id || 'me'} size={26} />
              <input ref={inputRef} value={text} onChange={e => onChangeText(e.target.value)}
                placeholder="Escribe un comentario... (usa @ para etiquetar)"
                className="flex-1 px-3 py-1.5 rounded-full border border-ink-200 text-xs focus:outline-none focus:border-brand-600 bg-ink-100/50"
                onKeyDown={e => { if (e.key === 'Enter' && suggestions.length === 0) handleSubmit() }} />
              <button onClick={handleSubmit} disabled={!text.trim() || sending}
                className="p-1.5 rounded-full bg-brand-600 text-white disabled:opacity-30 hover:bg-brand-700">
                {sending ? <Spinner size={12} /> : <Send size={12} />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
