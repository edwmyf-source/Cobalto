import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, MessageSquareText, Users, SlidersHorizontal, MapPin, BriefcaseBusiness, ChevronRight } from 'lucide-react'
import { searchUsers } from '../api/users'
import { getOrCreateConversation } from '../api/messages'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/shared/Toast'
import { safeErrorMessage } from '../lib/errors'
import { publicName } from '../lib/helpers'
import UserAvatar from '../components/shared/UserAvatar'
import { Card, Button, SkeletonListRow, EmptyState } from '../components/ui'

const accents = ['var(--accent-soft)', '#EEF8F6', '#F3F0FF', '#FFF6E8', '#EEF6FF']
const accentIcons = ['var(--accent)', 'var(--accent-mint)', 'var(--accent-violet)', 'var(--accent-amber)', 'var(--accent-sky)']

function PersonCard({ user, index, contactingId, onOpenProfile, onMessage }) {
  const isContacting = contactingId === user.id
  const meta = [user.company_name, user.city].filter(Boolean)
  return (
    <Card className="group relative overflow-hidden !rounded-[20px] p-5 transition-all duration-[180ms] hover:-translate-y-[1px]"
      style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--border-soft)' }}
    >
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: accentIcons[index % accentIcons.length] }} />
      <div className="flex items-start gap-4">
        <button
          type="button"
          className="flex-shrink-0 rounded-full focus-visible:ring-2"
          style={{ '--tw-ring-color': 'var(--border-focus)' }}
          onClick={() => onOpenProfile(user)}
          aria-label={`Ver perfil de ${publicName(user)}`}
        >
          <UserAvatar seed={user.id} avatarUrl={user.avatar_url} size={52} />
        </button>
        <div className="min-w-0 flex-1 pt-0.5">
          <button type="button" className="block max-w-full text-left" onClick={() => onOpenProfile(user)}>
            <p className="t-h4 truncate" style={{ color: 'var(--text-primary)' }}>{publicName(user)}</p>
          </button>
          {meta.length > 0 ? (
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
              {user.company_name && <span className="inline-flex min-w-0 items-center gap-1.5 t-caption" style={{ color: 'var(--text-secondary)' }}><BriefcaseBusiness size={13} /> <span className="truncate">{user.company_name}</span></span>}
              {user.city && <span className="inline-flex items-center gap-1.5 t-caption" style={{ color: 'var(--text-tertiary)' }}><MapPin size={13} /> {user.city}</span>}
            </div>
          ) : (
            <p className="t-caption mt-1.5" style={{ color: 'var(--text-tertiary)' }}>Perfil profesional</p>
          )}
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 t-caption" style={{ background: accents[index % accents.length], color: accentIcons[index % accentIcons.length] }}>
          Comunidad REDCOBALTO
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onMessage(user)}
          loading={isContacting}
          icon={MessageSquareText}
          aria-label={`Enviar mensaje a ${publicName(user)}`}
          className="!min-h-[40px] !rounded-[12px] !px-3.5"
        >
          <span className="hidden sm:inline">Mensaje</span>
        </Button>
      </div>
    </Card>
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
      <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-7 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 t-body-sm transition-colors duration-[160ms]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={17} strokeWidth={2} />
            Volver
          </button>
          <div className="hidden items-center gap-2 rounded-full border px-3 py-1.5 sm:inline-flex" style={{ borderColor: 'var(--border)', background: 'rgba(255,255,255,.72)', color: 'var(--text-tertiary)' }}>
            <Users size={14} />
            <span className="t-caption">Personas en REDCOBALTO</span>
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[28px] border p-6 sm:p-8" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F7F9FF 55%, #F6FBFA 100%)', borderColor: 'var(--border-soft)', boxShadow: 'var(--shadow-card)' }}>
          <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full opacity-60" style={{ background: 'radial-gradient(circle, rgba(36,87,197,.13), transparent 68%)' }} />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full opacity-70" style={{ background: 'radial-gradient(circle, rgba(24,184,154,.09), transparent 68%)' }} />
          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 t-eyebrow" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
              <Users size={13} /> Comunidad profesional
            </div>
            <h1 className="t-h1 max-w-xl" style={{ color: 'var(--text-primary)' }}>Encuentra a las personas que hacen crecer tu red.</h1>
            <p className="t-body mt-3 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              Descubre profesionales, abre conversaciones y construye conexiones con intención.
            </p>
            <div className="relative mt-6">
              <Search size={19} strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
              <input
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                placeholder="Buscar por nombre, empresa o ciudad"
                aria-label="Buscar contactos"
                className="h-12 w-full rounded-[15px] border bg-white pl-12 pr-12 t-body-sm transition-all duration-[160ms] focus:outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', boxShadow: '0 4px 16px rgba(15,23,42,.04)' }}
              />
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-[10px] p-2" style={{ background: 'var(--bg-subtle)', color: 'var(--text-tertiary)' }}>
                <SlidersHorizontal size={15} />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-7 flex items-end justify-between gap-4">
          <div>
            <p className="t-eyebrow" style={{ color: 'var(--text-tertiary)' }}>Personas</p>
            <h2 className="t-h3 mt-1" style={{ color: 'var(--text-primary)' }}>{query ? 'Resultados' : 'Descubrir profesionales'}</h2>
          </div>
          <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>{loading ? 'Buscando…' : `${users.length} resultados`}</span>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="grid gap-3 md:grid-cols-2">{[1,2,3,4].map(i => <SkeletonListRow key={i} />)}</div>
          ) : users.length === 0 ? (
            <div className="mt-4 rounded-[24px] border bg-white p-4 sm:p-8" style={{ borderColor: 'var(--border-soft)' }}>
              <EmptyState icon={Users} title="No se encontraron personas" description="Prueba con otro nombre, empresa o ciudad." />
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {users.map((user, index) => (
                <PersonCard
                  key={user.id}
                  user={user}
                  index={index}
                  contactingId={contactingId}
                  onOpenProfile={u => navigate(`/u/${u.id}`)}
                  onMessage={handleStartChat}
                />
              ))}
            </div>
          )}
        </div>

        {!loading && users.length > 0 && (
          <button type="button" onClick={() => navigate('/')} className="mx-auto mt-8 inline-flex items-center gap-2 t-body-sm" style={{ color: 'var(--text-secondary)' }}>
            Volver al feed <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>
  )
}
