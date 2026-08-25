import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, MessageSquareText, Users, MapPin, UserPlus, UserCheck } from 'lucide-react'
import { searchUsers } from '../api/users'
import { getOrCreateConversation } from '../api/messages'
import { followUser, unfollowUser, getFollowingIds } from '../api/follows'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/shared/Toast'
import { safeErrorMessage } from '../lib/errors'
import { publicName } from '../lib/helpers'
import UserAvatar from '../components/shared/UserAvatar'
import Spinner from '../components/shared/Spinner'
import { EmptyState } from '../components/ui'

export default function ContactsPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const toast = useToast()
  const userId = session?.user?.id
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [contactingId, setContactingId] = useState(null)
  const [followingIds, setFollowingIds] = useState(new Set())
  const [followBusyId, setFollowBusyId] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (userId) getFollowingIds(userId).then(setFollowingIds)
  }, [userId])

  const handleToggleFollow = async (e, user) => {
    e.stopPropagation()
    if (followBusyId) return
    const nowFollowing = followingIds.has(user.id)
    setFollowBusyId(user.id)
    // Optimista: refleja el cambio de inmediato, revierte si falla.
    setFollowingIds(prev => {
      const next = new Set(prev)
      nowFollowing ? next.delete(user.id) : next.add(user.id)
      return next
    })
    try {
      if (nowFollowing) await unfollowUser(userId, user.id)
      else await followUser(userId, user.id)
    } catch (err) {
      setFollowingIds(prev => {
        const next = new Set(prev)
        nowFollowing ? next.add(user.id) : next.delete(user.id)
        return next
      })
      toast(safeErrorMessage(err), 'error')
    }
    setFollowBusyId(null)
  }

  const runSearch = useCallback(async (q) => {
    setLoading(true)
    try {
      const data = await searchUsers(userId, q)
      setUsers(data)
    } catch (e) { toast(safeErrorMessage(e), 'error') }
    setLoading(false)
  }, [userId, toast])

  useEffect(() => {
    runSearch('')
    return () => debounceRef.current && clearTimeout(debounceRef.current)
  }, [runSearch])

  const handleQueryChange = (value) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(value), 350)
  }

  const handleStartChat = async (user) => {
    if (contactingId) return
    setContactingId(user.id)
    try {
      const conv = await getOrCreateConversation(userId, user.id, null)
      navigate('/chats', { state: { convId: conv.id } })
    } catch (e) { toast(safeErrorMessage(e), 'error') }
    setContactingId(null)
  }

  return (
    <div className="page-enter flex flex-col h-full" style={{ background: 'var(--surface)' }}>

      {/* Header — mismo patrón que la bandeja de Mensajes */}
      <div className="px-5 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-soft)' }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="t-eyebrow mb-1" style={{ color: 'var(--accent)' }}>REDCobalto</p>
            <h2 className="t-h2" style={{ color: 'var(--text-primary)' }}>Red</h2>
          </div>
          <button aria-label="Volver" onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-pill flex items-center justify-center"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>

      {/* Buscador — idéntico al de Mensajes */}
      <div className="px-4 py-3 flex-shrink-0">
        <div className="relative">
          <Search size={15} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-tertiary)' }} />
          <input
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            placeholder="Buscar por nombre o ciudad"
            aria-label="Buscar personas"
            className="w-full h-10 pl-9 pr-3 rounded-input t-body-sm transition-all duration-[160ms]"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Lista — mismas filas que la bandeja de Mensajes */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {loading ? null : users.length === 0 ? (
          <EmptyState icon={Users}
            title={query ? 'Sin resultados' : 'Sin personas aún'}
            description={query ? 'Prueba con otro nombre o ciudad.' : 'Todavía no hay más profesionales para mostrar.'} />
        ) : (
          users.map(user => {
            const isContacting = contactingId === user.id
            const isFollowing = followingIds.has(user.id)
            const isFollowBusy = followBusyId === user.id
            return (
              <button key={user.id} onClick={() => navigate(`/u/${user.id}`)}
                className="w-full text-left mb-2 rounded-card transition-all duration-[160ms] ease-premium active:scale-[0.99]"
                style={{ background: 'var(--surface)', border: '1px solid transparent' }}>
                <div className="flex items-center gap-3 px-3 py-3">
                  <div className="relative flex-shrink-0">
                    <UserAvatar seed={user.id} avatarUrl={user.avatar_url} size={40} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="t-body-sm truncate block" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {publicName(user)}
                    </span>
                    <span className="t-caption truncate flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                      {user.city ? <><MapPin size={11} /> {user.city}</> : 'Perfil profesional'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={(e) => handleToggleFollow(e, user)}
                      disabled={isFollowBusy}
                      aria-label={isFollowing ? `Dejar de seguir a ${publicName(user)}` : `Seguir a ${publicName(user)}`}
                      aria-pressed={isFollowing}
                      className="w-9 h-9 rounded-pill flex items-center justify-center transition-all active:scale-90 disabled:opacity-50"
                      style={isFollowing
                        ? { background: 'var(--accent-soft)', color: 'var(--accent)' }
                        : { background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
                      {isFollowBusy ? <Spinner size={14} /> : isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStartChat(user) }}
                      disabled={isContacting}
                      aria-label={`Enviar mensaje a ${publicName(user)}`}
                      className="w-9 h-9 rounded-pill flex items-center justify-center transition-all active:scale-90 disabled:opacity-50"
                      style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
                      {isContacting ? <Spinner size={14} /> : <MessageSquareText size={16} />}
                    </button>
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
