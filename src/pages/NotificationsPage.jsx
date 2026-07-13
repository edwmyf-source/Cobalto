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

  // Agrupar HOY / AYER / ESTA SEMANA / ANTES
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

              <div className="flex flex-col gap-1.5">
                {groups[lbl].map(n => {
                  const title = n.title || 'Notificación'
                  const body  = n.body || n.content || ''
                  const isUnread = !n.read

                  return (
                    <button key={n.id} onClick={() => handleOpen(n)}
                      disabled={opening === n.id}
                      className="w-full text-left flex overflow-hidden rounded-2xl transition-opacity disabled:opacity-60 active:opacity-70"
                      style={{
                        background: '#ffffff',
                        border: '1px solid #DDE7F4',
                        borderLeft: isUnread ? '4px solid #001A3D' : '1px solid #DDE7F4',
                      }}>

                      {/* Contenido */}
                      <div className="flex-1 px-3 py-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[11px] font-bold tracking-wide leading-none"
                            style={{ color: '#001A3D', letterSpacing: '0.07em' }}>
                            {title.toUpperCase()}
                          </span>
                          <span className="text-[10px] flex-shrink-0" style={{ color: '#B8C9E0' }}>
                            {timeAgo(n.created_at)}
                          </span>
                        </div>
                        <p className="text-[13px] leading-snug" style={{ color: '#5D8BC7' }}>
                          {body}
                        </p>
                      </div>

                      {/* Punto no leído */}
                      {isUnread && (
                        <div className="flex items-center px-3">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: '#FFB703', boxShadow: '0 0 6px rgba(255,183,3,0.6)' }} />
                        </div>
                      )}
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
