import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { getNotifications, markAsRead, markAllRead } from '../api/notifications'
import { getOrCreateConversation } from '../api/messages'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/shared/Toast'
import { safeErrorMessage } from '../lib/errors'
import { timeAgo, publicName } from '../lib/helpers'
import Spinner from '../components/shared/Spinner'
import { Card, Badge, EmptyState } from '../components/ui'
import UserAvatar from '../components/shared/UserAvatar'

// Etiqueta humana según el tipo/title de la notificacion
const ACTION_LABEL = {
  reaction:    'reaccionó a tu publicación',
  like:        'reaccionó a tu publicación',
  comment:     'comentó en tu publicación',
  message:     'te envió un mensaje',
  follow:      'empezó a seguirte',
  mention:     'te mencionó',
}

const getActionLabel = (n) => {
  const t = (n.title || '').toLowerCase()
  return ACTION_LABEL[t] || ACTION_LABEL[n.type] || null
}

const getSenderName = (n) => {
  const p = n.from_profile
  if (!p) return null
  return publicName(p)
}

const getInitials = (name) =>
  (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

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
      .then(data => {
        if (!mounted) return
        // Filtramos notificaciones del sistema antiguo (sin from_user_id = sin interaccion social)
        const social = data.filter(n => n.from_user_id)
        setNotifs(social)
      })
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
      if ((n.title || '').toLowerCase() === 'message') {
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

  return (
    <div className="page-enter max-w-2xl mx-auto p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="t-h2" style={{ color: 'var(--text-primary)' }}>Notificaciones</h1>
          {unreadCount > 0 && <Badge tone="brand">{unreadCount} nuevas</Badge>}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAll}
            className="t-body-sm font-medium transition-opacity duration-[160ms] hover:opacity-70"
            style={{ color: 'var(--accent)' }}>
            Marcar leídas
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1,2,3].map(i => (
            <Card key={i} className="flex items-center gap-3 p-4">
              <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 999 }} />
              <div className="flex-1">
                <div className="skeleton" style={{ width: '55%', height: 12 }} />
                <div className="skeleton mt-2" style={{ width: '25%', height: 10 }} />
              </div>
            </Card>
          ))}
        </div>
      ) : notifs.length === 0 ? (
        <Card>
          <EmptyState icon={Bell} title="Sin notificaciones todavía"
            description="Cuando alguien reaccione, comente o te escriba, aparecerá aquí." />
        </Card>
      ) : (
        <div>
          {ORDER.filter(lbl => groups[lbl]?.length).map(lbl => (
            <div key={lbl} className="mb-6">
              <p className="t-eyebrow mb-3" style={{ color: 'var(--text-tertiary)' }}>{lbl}</p>

              <div className="flex flex-col gap-2">
                {groups[lbl].map(n => {
                  const isUnread   = !n.read
                  const senderName = getSenderName(n)
                  const action     = getActionLabel(n)
                  const snippet    = n.post_content || n.post?.content || ''

                  if (!senderName && !action) return null

                  return (
                    <button key={n.id} onClick={() => handleOpen(n)}
                      disabled={opening === n.id}
                      className="w-full text-left rounded-card transition-all duration-[160ms] ease-premium disabled:opacity-60 active:scale-[0.99] overflow-hidden"
                      style={{
                        background: isUnread ? 'var(--accent-softer)' : 'var(--surface)',
                        border: `1px solid ${isUnread ? 'var(--accent-soft)' : 'var(--border-soft)'}`,
                      }}>

                      <div className="flex items-center gap-3 px-4 py-3">
                        <UserAvatar seed={n.from_user_id || senderName || '?'}
                          avatarUrl={n.from_profile?.avatar_url} size={38} />

                        <div className="flex-1 min-w-0">
                          <p className="t-body-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
                            <span className="font-semibold">{senderName || 'Usuario'}</span>
                            {action && <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}> {action}</span>}
                          </p>
                          <p className="t-caption mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                            {timeAgo(n.created_at)}
                          </p>
                        </div>

                        {isUnread && (
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                        )}
                      </div>

                      {snippet && (
                        <div className="mx-4 mb-3 px-3 py-2.5 rounded-input t-caption leading-relaxed"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', color: 'var(--text-secondary)' }}>
                          {snippet.slice(0, 120)}{snippet.length > 120 ? '…' : ''}
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
