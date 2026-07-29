import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, MessageSquareText, Users } from 'lucide-react'
import { searchUsers } from '../api/users'
import { getOrCreateConversation, sendMessage } from '../api/messages'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/shared/Toast'
import { safeErrorMessage } from '../lib/errors'
import { publicName } from '../lib/helpers'
import UserAvatar from '../components/shared/UserAvatar'
import { Card, Button, SkeletonListRow, EmptyState } from '../components/ui'
import { hoverProps } from '../lib/hover'

export default function ContactsPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [contactingId, setContactingId] = useState(null)
  const debounceRef = useRef(null)

  const runSearch = useCallback(async (q) => {
    setLoading(true)
    try {
      const data = await searchUsers(session.user.id, q)
      setUsers(data)
    } catch (e) { toast(safeErrorMessage(e), 'error') }
    setLoading(false)
  }, [session?.user?.id, toast])

  useEffect(() => { runSearch('') }, [runSearch])

  const handleQueryChange = (v) => {
    setQuery(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(v), 350)
  }

  const handleStartChat = async (user) => {
    if (contactingId) return
    setContactingId(user.id)
    try {
      const conv = await getOrCreateConversation(session.user.id, user.id, null)
      navigate('/chats', { state: { convId: conv.id } })
    } catch (e) { toast(safeErrorMessage(e), 'error') }
    setContactingId(null)
  }

  return (
    <div className="page-enter max-w-lg mx-auto p-6">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 t-body-sm font-medium mb-6 transition-colors duration-[160ms]"
        style={{ color: 'var(--text-tertiary)' }}
        {...hoverProps(
          e => e.currentTarget.style.color = 'var(--text-secondary)',
          e => e.currentTarget.style.color = 'var(--text-tertiary)',
        )}>
        <ArrowLeft size={16} strokeWidth={2} /> Volver
      </button>

      <h1 className="t-h1" style={{ color: 'var(--text-primary)' }}>Contactos</h1>
      <p className="t-body mt-2 mb-8" style={{ color: 'var(--text-secondary)' }}>
        Busca a cualquier persona registrada y escríbele directamente.
      </p>

      <div className="relative mb-8">
        <Search size={18} strokeWidth={2} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--text-tertiary)' }} />
        <input
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          placeholder="Buscar por nombre, empresa o ciudad"
          aria-label="Buscar contactos"
          className="w-full h-[48px] pl-12 pr-4 rounded-input t-body-sm transition-all duration-[160ms] ease-premium"
          style={{ background: 'var(--surface)', color: 'var(--text-primary)', boxShadow: 'inset 0 0 0 1px var(--border)' }}
          onFocus={e => e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--border-focus), 0 0 0 3px var(--accent-soft)'}
          onBlur={e => e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--border)'}
        />
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">{[1,2,3,4].map(i => <SkeletonListRow key={i} />)}</div>
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No se encontraron personas"
          description="Prueba con otro nombre, empresa o ciudad." />
      ) : (
        <div className="flex flex-col gap-3">
          {users.map(user => {
            const isContacting = contactingId === user.id
            return (
              <Card key={user.id} className="flex items-center gap-3 p-4">
                <UserAvatar seed={user.id} avatarUrl={user.avatar_url} size={40} />
                <button className="min-w-0 flex-1 text-left" onClick={() => navigate(`/u/${user.id}`)}>
                  <p className="t-body-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {publicName(user)}
                  </p>
                  <p className="t-caption truncate mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {[user.company_name, user.city].filter(Boolean).join(' · ') || 'Sin más información'}
                  </p>
                </button>
                <Button variant="secondary" size="sm" onClick={() => handleStartChat(user)}
                  loading={isContacting} icon={MessageSquareText} aria-label="Enviar mensaje"
                  className="!px-3 flex-shrink-0" />
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
