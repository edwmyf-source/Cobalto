import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Bell } from 'lucide-react'
import { getNotifications, markAsRead, markAllRead } from '../api/notifications'
import { getOrCreateConversation } from '../api/messages'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/shared/Toast'
import { safeErrorMessage } from '../lib/errors'
import { timeAgo } from '../lib/helpers'
import Spinner from '../components/shared/Spinner'

export default function NotificationsPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [opening, setOpening] = useState(null)

  useEffect(() => {
    let mounted = true
    getNotifications(session.user.id)
      .then(data => { if (mounted) setNotifs(data) })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [session.user.id])

  const handleMarkAll = async () => {
    await markAllRead(session.user.id)
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleOpen = async (n) => {
    if (opening) return
    await markAsRead(n.id)
    setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
    if (!n.post_id) return
    setOpening(n.id)
    try {
      if (n.title === 'message') {
        const conv = await getOrCreateConversation(session.user.id, n.from_user_id, n.post_id)
        navigate('/chats', { state: { convId: conv.id } })
      } else {
        navigate('/feed', { state: { scrollToPostId: n.post_id } })
      }
    } catch (e) { toast(safeErrorMessage(e), 'error') }
    setOpening(null)
  }

  const unreadCount = notifs.filter(n => !n.read).length

  const groupLabel = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
    if (diff === 0) return 'HOY'
    if (diff === 1) return 'AYER'
    if (diff < 7) return 'ESTA SEMANA'
    return 'ANTES'
  }

  const groups = notifs.reduce((acc, n) => {
    const lbl = groupLabel(n.created_at)
    if (!acc[lbl]) acc[lbl] = []
    acc[lbl].push(n)
    return acc
  }, {})

  const ORDER = ['HOY', 'AYER', 'ESTA SEMANA', 'ANTES']

  // Iniciales del remitente para avatar
  const initials = (name) => (name || '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()

  return (
    <div className="page-enter max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-xl" style={{ color: '#001A3D' }}>Notificaciones</h2>
          {unreadCount > 0 && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
              style={{ background: '#FFB703', color: '#001A3D' }}>
              {unreadCount} nuevas
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAll}
            className="flex items-center gap-1.5 text-xs font-medium hover:opacity-70"
            style={{ color: '#5D8BC7' }}>
            <Check size={14} /> Marcar leídas
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner size={20} /></div>
      ) : notifs.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center" style={{ border: '1px solid #DDE7F4' }}>
          <Bell size={32} className="mx-auto mb-3" style={{ color: '#CDDBEC' }} />
          <p className="text-sm" style={{ color: '#5D8BC7' }}>No tienes notificaciones aún.</p>
        </div>
      ) : (
        <div>
          {ORDER.filter(lbl => groups[lbl]?.length).map(lbl => (
            <div key={lbl}>
              <p className="text-[11px] font-bold tracking-widest pb-2 pt-3"
                style={{ color: '#B8C9E0' }}>{lbl}</p>

              <div className="flex flex-col gap-2">
                {groups[lbl].map(n => {
                  const isUnread = !n.read
                  const senderName = n.sender_name || n.from_user_name || n.title || 'Usuario'
                  const action    = n.action_label || n.body || n.content || ''
                  const snippet   = n.post_excerpt || n.post_body || n.excerpt || ''

                  return (
                    <button key={n.id} onClick={() => handleOpen(n)}
                      disabled={opening === n.id}
                      className="w-full text-left rounded-2xl transition-opacity disabled:opacity-60 active:opacity-70 overflow-hidden"
                      style={{
                        background: '#ffffff',
                        border: '1px solid #DDE7F4',
                        borderLeft: isUnread ? '4px solid #001A3D' : '1px solid #DDE7F4',
                      }}>

                      <div className="flex items-center gap-3 px-3 py-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-bold"
                          style={{ background: isUnread ? '#001A3D' : '#EDF3FB', color: isUnread ? '#fff' : '#5D8BC7' }}>
                          {initials(senderName)}
                        </div>

                        {/* Texto */}
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] leading-snug" style={{ color: '#001A3D' }}>
                            <span className="font-semibold">{senderName}</span>
                            {' '}<span style={{ color: '#5D8BC7', fontWeight: 400 }}>{action}</span>
                          </div>
                          <div className="text-[11px] mt-0.5" style={{ color: '#B8C9E0' }}>
                            {timeAgo(n.created_at)}
                          </div>
                        </div>

                        {/* Punto no leído — naranja cálido */}
                        {isUnread && (
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: '#FFB703', boxShadow: '0 0 8px rgba(255,183,3,0.65)' }} />
                        )}
                      </div>

                      {/* Snippet de la publicación */}
                      {snippet ? (
                        <div className="mx-3 mb-3 px-3 py-2 rounded-lg text-[12px] leading-relaxed"
                          style={{ background: '#F2F7FF', borderLeft: '3px solid #CDDBEC', color: '#5D8BC7' }}>
                          "{snippet}"
                        </div>
                      ) : n.post_id ? (
                        <div className="mx-3 mb-3 px-3 py-2 rounded-lg text-[12px]"
                          style={{ background: '#F2F7FF', borderLeft: '3px solid #CDDBEC', color: '#B8C9E0' }}>
                          Ver publicación →
                        </div>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
