import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Heart, MessageCircle, UserPlus, AtSign, CheckCheck, ArrowUpRight } from 'lucide-react'
import { getNotifications, markAsRead, markAllRead } from '../api/notifications'
import { getOrCreateConversation } from '../api/messages'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/shared/Toast'
import { safeErrorMessage } from '../lib/errors'
import { timeAgo, publicName } from '../lib/helpers'
import { Card, Badge, EmptyState } from '../components/ui'
import UserAvatar from '../components/shared/UserAvatar'

// Etiqueta humana según el tipo/title de la notificacion
const ACTION_LABEL = {
  reaction: 'reaccionó a tu publicación',
  like: 'reaccionó a tu publicación',
  comment: 'comentó en tu publicación',
  message: 'te envió un mensaje',
  follow: 'empezó a seguirte',
  mention: 'te mencionó',
}

const ACTION_META = {
  reaction: { Icon: Heart, color: 'var(--brand-red)', bg: '#FFF1F2' },
  like: { Icon: Heart, color: 'var(--brand-red)', bg: '#FFF1F2' },
  comment: { Icon: MessageCircle, color: 'var(--accent)', bg: 'var(--accent-soft)' },
  message: { Icon: MessageCircle, color: 'var(--accent-violet)', bg: '#F2EEFF' },
  follow: { Icon: UserPlus, color: 'var(--accent-mint)', bg: '#EAF9F5' },
  mention: { Icon: AtSign, color: 'var(--accent-amber)', bg: '#FFF7E9' },
}

const getActionKey = (n) => {
  const t = (n.title || '').toLowerCase()
  return ACTION_LABEL[t] ? t : (ACTION_LABEL[n.type] ? n.type : null)
}

const getActionLabel = (n) => {
  const key = getActionKey(n)
  return key ? ACTION_LABEL[key] : null
}

const getActionMeta = (n) => ACTION_META[getActionKey(n)] || { Icon: Bell, color: 'var(--accent)', bg: 'var(--accent-soft)' }

const getSenderName = (n) => {
  const p = n.from_profile
  if (!p) return null
  return publicName(p)
}

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
    <div className="page-enter max-w-3xl mx-auto px-4 py-5 sm:px-6 sm:py-8">
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl"
              style={{ background: 'var(--accent-soft)' }}>
              <Bell size={18} strokeWidth={1.9} style={{ color: 'var(--accent)' }} />
            </span>
            <span className="t-eyebrow" style={{ color: 'var(--text-tertiary)' }}>Centro de actividad</span>
          </div>
          <h1 className="t-h1" style={{ color: 'var(--text-primary)' }}>Notificaciones</h1>
          <p className="t-body-sm mt-1 max-w-lg" style={{ color: 'var(--text-secondary)' }}>
            Lo importante de tu comunidad, en un solo lugar.
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAll}
            className="inline-flex h-10 items-center gap-2 rounded-full px-3.5 t-body-sm font-semibold transition-all duration-[160ms] hover:-translate-y-px"
            style={{ background: 'var(--surface)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
            <CheckCheck size={16} />
            <span className="hidden sm:inline">Marcar leídas</span>
            <span className="sm:hidden">Leer todo</span>
          </button>
        )}
      </div>

      <Card className="overflow-hidden" style={{ boxShadow: 'var(--shadow-raised)' }}>
        <div className="flex items-center justify-between border-b px-4 py-3.5 sm:px-5"
          style={{ borderColor: 'var(--border-soft)', background: 'var(--surface-raised)' }}>
          <div className="flex items-center gap-2">
            <span className="t-body-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Actividad</span>
            {unreadCount > 0 && (
              <Badge tone="brand">{unreadCount} nuevas</Badge>
            )}
          </div>
          <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>{notifs.length} en total</span>
        </div>

        {loading ? (
          <div className="p-4 sm:p-5">
            <div className="flex flex-col gap-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex items-center gap-3 rounded-[16px] px-3 py-3">
                  <div className="skeleton flex-shrink-0" style={{ width: 42, height: 42, borderRadius: 14 }} />
                  <div className="min-w-0 flex-1">
                    <div className="skeleton" style={{ width: i === 1 ? '62%' : '48%', height: 11, borderRadius: 6 }} />
                    <div className="skeleton mt-2" style={{ width: '28%', height: 9, borderRadius: 6 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : notifs.length === 0 ? (
          <div className="px-4 py-6 sm:px-6 sm:py-8">
            <EmptyState icon={Bell} title="Tu actividad aparecerá aquí"
              description="Cuando alguien reaccione, comente, te mencione, te siga o te escriba, verás la notificación aquí." />
          </div>
        ) : (
          <div className="p-3 sm:p-4">
            {ORDER.filter(lbl => groups[lbl]?.length).map(lbl => (
              <div key={lbl} className="mb-5 last:mb-0">
                <div className="flex items-center gap-2 px-2 pb-2 pt-1">
                  <span className="t-eyebrow" style={{ color: 'var(--text-tertiary)' }}>{lbl}</span>
                  <span className="h-px flex-1" style={{ background: 'var(--border-soft)' }} />
                </div>

                <div className="flex flex-col gap-1">
                  {groups[lbl].map(n => {
                    const isUnread   = !n.read
                    const senderName = getSenderName(n)
                    const action     = getActionLabel(n)
                    const snippet    = n.post_content || n.post?.content || ''
                    const { Icon, color: iconColor, bg: iconBg } = getActionMeta(n)

                    if (!senderName && !action) return null

                    return (
                      <button key={n.id} onClick={() => handleOpen(n)}
                        disabled={opening === n.id}
                        className="group w-full overflow-hidden rounded-[18px] px-2.5 py-2 text-left transition-all duration-[160ms] hover:-translate-y-px active:scale-[0.995] disabled:opacity-60"
                        style={{
                          background: isUnread ? 'var(--accent-softer)' : 'transparent',
                          border: `1px solid ${isUnread ? 'var(--accent-soft)' : 'transparent'}`,
                        }}>

                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <UserAvatar seed={n.from_user_id || senderName || '?'} name={senderName}
                              avatarUrl={n.from_profile?.avatar_url} size={42} />
                            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2"
                              style={{ background: iconBg, color: iconColor, borderColor: 'var(--surface)' }}>
                              <Icon size={11} strokeWidth={2.2} />
                            </span>
                          </div>

                          <div className="min-w-0 flex-1 pt-0.5">
                            <div className="flex items-start justify-between gap-3">
                              <p className="t-body-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
                                <span className="font-semibold">{senderName || 'Usuario'}</span>
                                {action && <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}> {action}</span>}
                              </p>
                              <span className="t-caption flex-shrink-0 pt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                                {timeAgo(n.created_at)}
                              </span>
                            </div>

                            {snippet && (
                              <div className="mt-2 max-w-xl rounded-[14px] px-3 py-2"
                                style={{ background: isUnread ? 'var(--surface)' : 'var(--bg-subtle)', border: '1px solid var(--border-soft)' }}>
                                <p className="t-caption leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                  {snippet.slice(0, 140)}{snippet.length > 140 ? '…' : ''}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-shrink-0 items-center pt-1">
                            {isUnread ? (
                              <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--accent)' }} />
                            ) : (
                              <ArrowUpRight size={16} className="opacity-0 transition-opacity duration-[160ms] group-hover:opacity-100"
                                style={{ color: 'var(--text-tertiary)' }} />
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
