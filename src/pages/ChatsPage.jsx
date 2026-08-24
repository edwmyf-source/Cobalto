import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowLeft, Send, Search, MessageSquareText, MoreHorizontal, Paperclip, Smile, CheckCheck, Sparkles, FileText } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getConversations, getMessages, sendMessage, uploadMessageAttachment, getAttachmentUrl } from '../api/messages'
import { createNotification } from '../api/notifications'
import { useAuth } from '../contexts/AuthContext'
import { useRealtime } from '../hooks/useRealtime'
import { useToast } from '../components/shared/Toast'
import { safeErrorMessage } from '../lib/errors'
import { publicName, timeAgo } from '../lib/helpers'
import { CATEGORY_MAP } from '../lib/constants'
import UserAvatar from '../components/shared/UserAvatar'
import Spinner from '../components/shared/Spinner'
import { Card, EmptyState } from '../components/ui'

/* ─── Bandeja estilo B1 (WhatsApp) ─── */
function ConversationList({ conversations, activeId, onSelect, userId }) {
  const [search, setSearch] = useState('')

  const filtered = conversations.filter(conv => {
    const other = conv.user1_id === userId ? conv.user2 : conv.user1
    const name = publicName(other || '').toLowerCase()
    return name.includes(search.toLowerCase())
  })

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--surface)' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-soft)' }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="t-eyebrow mb-1" style={{ color: 'var(--accent)' }}>REDCobalto</p>
            <h2 className="t-h2" style={{ color: 'var(--text-primary)' }}>Mensajes</h2>
          </div>
          <button aria-label="Más opciones" className="w-9 h-9 rounded-pill flex items-center justify-center" style={{ background:'var(--bg-subtle)', color:'var(--text-secondary)' }}>
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="px-4 py-3 flex-shrink-0">
        <div className="relative">
          <Search size={15} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-tertiary)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar conversación"
            aria-label="Buscar conversación"
            className="w-full h-10 pl-9 pr-3 rounded-input t-body-sm transition-all duration-[160ms]"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {filtered.length === 0 ? (
          <EmptyState icon={MessageSquareText}
            title={search ? 'Sin resultados' : 'Sin conversaciones aún'}
            description={search ? 'Prueba con otro nombre.' : 'Contacta a alguien desde el feed para empezar.'} />
        ) : (
          filtered.map(conv => {
            const other = conv.user1_id === userId ? conv.user2 : conv.user1
            const name   = publicName(other || {})
            const active = activeId === conv.id
            const unread = conv.unread_count > 0

            return (
              <button key={conv.id} onClick={() => onSelect(conv)}
                className="w-full text-left mb-2 rounded-card transition-all duration-[160ms] ease-premium active:scale-[0.99]"
                style={{
                  background: active ? 'var(--accent-softer)' : 'var(--surface)',
                  boxShadow: active ? 'var(--shadow-card)' : 'none',
                  border: active ? '1px solid var(--accent-soft)' : '1px solid transparent',
                }}>
                <div className="flex items-center gap-3 px-3 py-3 relative">
                  {active && <span className="absolute left-0 top-3 bottom-3 w-1 rounded-pill" style={{ background:'var(--accent)' }} />}

                  <div className="relative flex-shrink-0">
                    <UserAvatar seed={other?.id || name} avatarUrl={other?.avatar_url} size={40} />
                    {unread && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full"
                        style={{ background: 'var(--accent)', border: '2px solid var(--surface)' }} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="t-body-sm truncate" style={{ color: 'var(--text-primary)', fontWeight: unread ? 600 : 500 }}>
                        {name}
                      </span>
                      <span className="t-caption flex-shrink-0 ml-2" style={{ color: 'var(--text-tertiary)' }}>
                        {timeAgo(conv.updated_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="t-caption truncate"
                        style={{ color: unread ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: unread ? 500 : 400 }}>
                        {conv.last_message || (conv.posts ? `Sobre: ${conv.posts.title}` : 'Nueva conversación')}
                      </span>
                      {unread && (
                        <span className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-semibold px-1 tnum"
                          style={{ background: 'var(--accent-deep)', color: '#fff' }}>
                          {conv.unread_count > 9 ? '9+' : conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

/* ─── Adjunto de un mensaje ───
   El archivo vive en un bucket privado, así que hay que pedir una URL firmada
   antes de poder mostrarlo o descargarlo. */
function MessageAttachment({ msg, isMine }) {
  const [url, setUrl] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    getAttachmentUrl(msg.media_url)
      .then(u => { if (alive) setUrl(u) })
      .catch(() => { if (alive) setFailed(true) })
    return () => { alive = false }
  }, [msg.media_url])

  const isImage = msg.media_type?.startsWith('image/')

  if (failed) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
        style={{ background: isMine ? 'rgba(255,255,255,0.15)' : 'var(--bg-subtle)' }}>
        <FileText size={18} style={{ color: isMine ? '#fff' : 'var(--text-tertiary)', flexShrink: 0 }} />
        <span className="text-[12px]" style={{ color: isMine ? '#fff' : 'var(--text-tertiary)' }}>
          Adjunto no disponible
        </span>
      </div>
    )
  }

  if (!url) {
    return (
      <div className="flex items-center justify-center rounded-xl"
        style={{ width: isImage ? 180 : 150, height: isImage ? 120 : 44,
                 background: isMine ? 'rgba(255,255,255,0.15)' : 'var(--bg-subtle)' }}>
        <Spinner size={15} />
      </div>
    )
  }

  if (isImage) {
    return (
      <img src={url} alt={msg.media_name || 'Adjunto'} loading="lazy" decoding="async"
        onClick={() => window.open(url, '_blank')}
        className="rounded-2xl cursor-pointer block"
        style={{ maxWidth: '100%', maxHeight: 280, objectFit: 'cover' }} />
    )
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-opacity hover:opacity-85"
      style={{ background: isMine ? 'rgba(255,255,255,0.15)' : 'var(--bg-subtle)' }}>
      <FileText size={20} strokeWidth={2} style={{ color: isMine ? '#fff' : 'var(--accent-deep)', flexShrink: 0 }} />
      <span className="text-[13px] font-medium truncate" style={{ color: isMine ? '#fff' : 'var(--text-primary)' }}>
        {msg.media_name || 'Archivo adjunto'}
      </span>
    </a>
  )
}

/* ─── Hilo de mensajes estilo C6 (yo celeste, ellos blanco) ─── */
function ChatThread({ conversation, userId, myProfile }) {
  const toast = useToast()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const bottomRef = useRef(null)

  const other = conversation.user1_id === userId ? conversation.user2 : conversation.user1
  const otherName = publicName(other || {})

  const fetchMessages = useCallback(async () => {
    try {
      const data = await getMessages(conversation.id)
      setMessages(data)
    } catch (e) { toast(safeErrorMessage(e), 'error') }
  }, [conversation.id, toast])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setMessages([])
    fetchMessages().finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [fetchMessages])

  useRealtime('messages', 'INSERT', useCallback((payload) => {
    const msg = payload.new
    if (msg?.conversation_id !== conversation.id) return
    if (msg.sender_id === userId) return
    setMessages(prev => [...prev, { ...msg, profiles: other }])
  }, [conversation.id, userId, other]))

  useEffect(() => {
    if (!loading) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (media = null) => {
    const content = text.trim()
    if (!content && !media) return
    if (sending) return
    setText('')
    setSending(true)
    try {
      const sent = await sendMessage({
        conversation_id: conversation.id, sender_id: userId, content,
        media_url: media?.url, media_type: media?.type, media_name: media?.name,
      })
      setMessages(prev => [...prev, { ...sent, profiles: myProfile || {} }])
      const otherId = conversation.user1_id === userId ? conversation.user2_id : conversation.user1_id
      createNotification({
        user_id: otherId,
        from_user_id: userId,
        type: 'message',
        content: media ? 'te envió un adjunto' : 'te envió un mensaje',
        post_id: conversation.post_id,
      })
    } catch (e) { toast(safeErrorMessage(e), 'error'); if (content) setText(content) }
    setSending(false)
  }

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permite volver a elegir el mismo archivo después
    if (!file) return
    setUploading(true)
    try {
      const media = await uploadMessageAttachment(file, userId)
      await handleSend(media)
    } catch (err) {
      toast(safeErrorMessage(err), 'error')
    }
    setUploading(false)
  }

  // Agrupar mensajes por fecha
  const grouped = messages.reduce((acc, msg) => {
    const day = new Date(msg.created_at).toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long' })
    if (!acc[day]) acc[day] = []
    acc[day].push(msg)
    return acc
  }, {})

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 flex-shrink-0"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border-soft)' }}>
        <div className="relative">
          <UserAvatar seed={other?.id || otherName} avatarUrl={other?.avatar_url} size={42} />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full" style={{ background:'var(--accent-mint)', border:'2px solid var(--surface)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="t-body font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{otherName}</p>
          <div className="flex items-center gap-2">
            <span className="t-caption" style={{ color: 'var(--accent-mint)', fontWeight:600 }}>Disponible</span>
            {other?.city && <span className="t-caption truncate" style={{ color: 'var(--text-tertiary)' }}>· {other.city}</span>}
          </div>
        </div>
        <button aria-label="Más opciones" className="w-9 h-9 rounded-pill flex items-center justify-center" style={{ background:'var(--bg-subtle)', color:'var(--text-secondary)' }}>
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Post de referencia */}
      {conversation.posts && (
        <button onClick={() => navigate('/feed', { state: { scrollToPostId: conversation.posts.id } })}
          className="mx-4 mt-3 flex-shrink-0 flex items-start gap-3 px-4 py-3 rounded-card text-left transition-all duration-[160ms] active:scale-[0.99]"
          style={{ background: 'linear-gradient(135deg, var(--accent-softer), #ffffff)', border: '1px solid var(--accent-soft)' }}>
          <span className="w-9 h-9 rounded-input flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: 'var(--surface)' }}>
            <MessageSquareText size={16} strokeWidth={2} style={{ color: 'var(--accent-deep)' }} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="t-eyebrow" style={{ color: 'var(--accent-deep)' }}>
                {CATEGORY_MAP[conversation.posts.category]?.label || conversation.posts.category}
              </span>
              <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>· Ver publicación</span>
            </div>
            <p className="t-body-sm font-medium leading-snug line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
              {[conversation.posts.title, conversation.posts.content].filter(Boolean).join(' — ').slice(0, 90)}
            </p>
          </div>
        </button>
      )}

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-6 py-6" style={{ background: 'linear-gradient(180deg, var(--bg-app) 0%, #F9FAFC 100%)' }}>
        {loading ? (
          <div className="flex justify-center py-6"><Spinner size={20} /></div>
        ) : messages.length === 0 ? (
          <p className="t-body-sm text-center py-6" style={{ color: 'var(--text-tertiary)' }}>Inicia la conversación.</p>
        ) : (
          Object.entries(grouped).map(([day, msgs]) => (
            <div key={day}>
              {/* Separador de fecha */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="t-caption font-medium px-3 py-1 rounded-full capitalize"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>{day}</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>

              <div className="flex flex-col gap-2">
                {msgs.map((msg, i) => {
                  const isMine = msg.sender_id === userId
                  const isLast = i === msgs.length - 1 ||
                    msgs[i+1]?.sender_id !== msg.sender_id
                  return (
                    <div key={msg.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div style={{ maxWidth: '75%' }}>
                        <div className={`t-body-sm leading-relaxed whitespace-pre-wrap break-words ${msg.media_url ? 'p-1.5' : 'px-4 py-3'}`}
                          style={{
                            background: isMine ? 'var(--accent)' : 'var(--surface)',
                            color: isMine ? '#ffffff' : 'var(--text-primary)',
                            borderRadius: isMine
                              ? isLast ? '18px 18px 5px 18px' : '18px'
                              : isLast ? '18px 18px 18px 5px' : '18px',
                            boxShadow: isMine ? 'none' : 'var(--shadow-card)',
                            border: isMine ? 'none' : '1px solid var(--border-soft)',
                          }}>
                          {msg.media_url && <MessageAttachment msg={msg} isMine={isMine} />}
                          {msg.content && <div className={msg.media_url ? 'px-2.5 pt-2' : ''}>{msg.content}</div>}
                        </div>
                        {isLast && (
                          <div className={`t-caption mt-1.5 ${isMine ? 'text-right pr-1' : 'pl-1'}`}
                            style={{ color: 'var(--text-tertiary)' }}>
                            {new Date(msg.created_at).toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' })}
                            {isMine && ' · Enviado'}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 flex-shrink-0 flex items-end gap-3"
        style={{ background: 'var(--surface)', borderTop: '1px solid var(--border-soft)' }}>
        <div className="flex items-center gap-1.5 pb-0.5">
          <input ref={fileInputRef} type="file" className="hidden"
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFileSelected} />
          <button aria-label="Adjuntar archivo" disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-pill flex items-center justify-center disabled:opacity-50"
            style={{ color:'var(--text-secondary)', background:'var(--bg-subtle)' }}>
            {uploading ? <Spinner size={15} /> : <Paperclip size={17}/>}
          </button>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Escribe un mensaje"
          rows={1}
          className="flex-1 px-4 py-3 t-body-sm resize-none focus:outline-none rounded-input transition-all duration-[160ms]"
          style={{ background: 'var(--bg-subtle)', color: 'var(--text-primary)', maxHeight: 110, lineHeight: 1.4 }}
          onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-soft)'}
          onBlur={e => e.currentTarget.style.boxShadow = 'none'}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
        />
        <button aria-label="Añadir emoji" className="hidden sm:flex w-9 h-9 rounded-pill flex items-center justify-center" style={{ color:'var(--text-secondary)', background:'transparent' }}><Smile size={17}/></button>
        <button onClick={() => handleSend()} disabled={!text.trim() || sending} aria-label="Enviar mensaje"
          className="w-11 h-11 rounded-btn flex items-center justify-center flex-shrink-0 transition-all duration-[160ms] active:scale-95 disabled:opacity-40"
          style={{ background: 'var(--accent)', color:'#fff' }}>
          {sending ? <Spinner size={16} color="#fff" /> : <Send size={17} strokeWidth={2} color="#fff" />}
        </button>
      </div>
    </div>
  )
}

/* ─── Página principal ─── */
export default function ChatsPage() {
  const { session, profile: myProfile } = useAuth()
  const toast = useToast()
  const location = useLocation()
  const [conversations, setConversations] = useState([])
  const [active, setActive] = useState(null)
  const [loading, setLoading] = useState(true)
  const autoSelected = useRef(false)

  const loadConversations = useCallback(async () => {
    try {
      const data = await getConversations(session.user.id)
      setConversations(data)
      const convId = location.state?.convId
      if (convId && !autoSelected.current) {
        autoSelected.current = true
        const found = data.find(c => c.id === convId)
        if (found) setActive(found)
      }
    } catch (e) { toast(safeErrorMessage(e), 'error') }
  }, [session.user.id, toast, location.state?.convId])

  useEffect(() => {
    let mounted = true
    loadConversations().finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [loadConversations])

  useRealtime('messages', 'INSERT', useCallback((payload) => {
    const msg = payload?.new
    if (!msg) return
    const myId = session?.user?.id
    const inMyConvs = conversations.some(c => c.id === msg.conversation_id)
    if (inMyConvs || msg.sender_id === myId) loadConversations()
  }, [loadConversations, conversations, session?.user?.id]))

  return (
    <div className="page-enter flex overflow-hidden rounded-panel"
      style={{ height: 'calc(100dvh - 140px)', background: '#ffffff', boxShadow: 'var(--shadow-raised)', border:'1px solid var(--border)' }}>

      {/* Bandeja */}
      <div className={`md:w-[340px] md:border-r flex-shrink-0 overflow-hidden flex flex-col ${active ? 'hidden md:flex' : 'w-full flex'}`}
        style={{ borderColor: 'var(--border)' }}>
        {loading ? (
          <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-16" />)}</div>
        ) : (
          <ConversationList conversations={conversations} activeId={active?.id}
            onSelect={setActive} userId={session.user.id} />
        )}
      </div>

      {/* Hilo */}
      <div className={`flex-1 flex flex-col overflow-hidden ${active ? 'flex' : 'hidden md:flex'}`}>
        {active ? (
          <>
            <div className="md:hidden flex items-center gap-2 px-4 py-3 flex-shrink-0"
              style={{ background: '#ffffff' }}>
              <button onClick={() => setActive(null)} className="p-1 rounded-lg"
                style={{ color: 'var(--accent-deep)' }}>
                <ArrowLeft size={20} />
              </button>
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--accent-deep)' }}>Mensajes</p>
            </div>
            <ChatThread conversation={active} userId={session.user.id} myProfile={myProfile} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="w-14 h-14 rounded-card flex items-center justify-center mb-4" style={{ background:'var(--accent-softer)', color:'var(--accent)' }}><Sparkles size={22}/></div>
            <p className="t-h3 mb-1" style={{ color: 'var(--text-primary)' }}>Tu espacio de conexión</p>
            <p className="t-body-sm max-w-xs" style={{ color: 'var(--text-tertiary)' }}>Selecciona una conversación para continuar o contacta a alguien desde tu comunidad.</p>
          </div>
        )}
      </div>
    </div>
  )
}
