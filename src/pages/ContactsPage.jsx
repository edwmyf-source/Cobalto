import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, MessageSquareText, Users, MapPin, X } from 'lucide-react'
import { searchUsers } from '../api/users'
import { getOrCreateConversation } from '../api/messages'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/shared/Toast'
import { safeErrorMessage } from '../lib/errors'
import { publicName } from '../lib/helpers'
import UserAvatar from '../components/shared/UserAvatar'
import Spinner from '../components/shared/Spinner'
import { SkeletonListRow, EmptyState } from '../components/ui'

// Una fila de persona, estilo lista de Contactos: avatar + nombre + ciudad,
// sin tarjeta propia ni sombra — el contorno lo da la línea divisoria entre
// filas, igual que en Configuración de perfil.
function PersonRow({ user, isLast, contactingId, onOpenProfile, onMessage }) {
  const isContacting = contactingId === user.id
  return (
    <div className="flex items-center gap-3 px-4 py-3"
      style={!isLast ? { borderBottom: '1px solid var(--border-soft)' } : undefined}>
      <button type="button" className="flex-shrink-0 rounded-full" onClick={() => onOpenProfile(user)}
        aria-label={`Ver perfil de ${publicName(user)}`}>
        <UserAvatar seed={user.id} avatarUrl={user.avatar_url} size={42} />
      </button>

      <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onOpenProfile(user)}>
        <p className="t-body-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{publicName(user)}</p>
        {user.city ? (
          <span className="inline-flex items-center gap-1 t-caption" style={{ color: 'var(--text-tertiary)' }}>
            <MapPin size={11} /> {user.city}
          </span>
        ) : (
          <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>Perfil profesional</span>
        )}
      </button>

      <button type="button" onClick={() => onMessage(user)} disabled={isContacting}
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-50"
        style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
        aria-label={`Enviar mensaje a ${publicName(user)}`}>
        {isContacting ? <Spinner size={14} /> : <MessageSquareText size={16} />}
      </button>
    </div>
  )
}

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
      const conv = await getOrCreateConversation(session.user.id, user.id, null)
      navigate('/chats', { state: { convId: conv.id } })
    } catch (e) { toast(safeErrorMessage(e), 'error') }
    setContactingId(null)
  }

  return (
    <div className="page-enter min-h-full" style={{ background: 'var(--bg-app)' }}>
      <div className="mx-auto w-full max-w-lg px-4 py-5 sm:px-6 sm:py-8">
        <button type="button" onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 t-body-sm font-semibold mb-4"
          style={{ color: 'var(--text-tertiary)' }}>
          <ArrowLeft size={16} /> Volver
        </button>

        <h1 className="t-h1" style={{ color: 'var(--text-primary)' }}>Red</h1>
        <p className="t-body-sm mt-1 mb-5" style={{ color: 'var(--text-tertiary)' }}>
          Encuentra profesionales y abre una conversación.
        </p>

        {/* Buscador estilo sistema: fondo plano, sin sombra */}
        <div className="relative mb-2">
          <Search size={17} strokeWidth={2} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
          <input
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            placeholder="Buscar por nombre o ciudad"
            aria-label="Buscar personas"
            className="h-11 w-full rounded-full pl-10 pr-10 t-body-sm border-0 outline-none transition-colors"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-primary)' }}
          />
          {query && (
            <button type="button" onClick={() => handleQueryChange('')} aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: 'var(--border)', color: 'var(--text-tertiary)' }}>
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between px-1 mt-5 mb-2">
          <p className="t-eyebrow" style={{ color: 'var(--text-tertiary)' }}>
            {query ? 'Resultados' : 'Sugeridos'}
          </p>
          <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
            {loading ? '' : `${users.length}`}
          </span>
        </div>

        {loading ? (
          <div className="space-y-2">{[1, 2, 3, 4].map(i => <SkeletonListRow key={i} />)}</div>
        ) : users.length === 0 ? (
          <div className="rounded-panel p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)' }}>
            <EmptyState icon={Users} title="No se encontraron personas" description="Prueba con otro nombre o ciudad." />
          </div>
        ) : (
          <div className="rounded-panel overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)' }}>
            {users.map((user, index) => (
              <PersonRow
                key={user.id}
                user={user}
                isLast={index === users.length - 1}
                contactingId={contactingId}
                onOpenProfile={u => navigate(`/u/${u.id}`)}
                onMessage={handleStartChat}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
