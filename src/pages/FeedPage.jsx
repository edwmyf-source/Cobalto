import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sparkles, Clock, ArrowUp, FileText } from 'lucide-react'
import { listPosts } from '../api/posts'
import { getOrCreateConversation, sendMessage } from '../api/messages'
import { createNotification } from '../api/notifications'
import { getBlockedUsers } from '../api/moderation'
import { useAuth } from '../contexts/AuthContext'
import { useRealtime } from '../hooks/useRealtime'
import { useToast } from '../components/shared/Toast'
import { safeErrorMessage } from '../lib/errors'
import PostCard from '../components/feed/PostCard'
import PublishBox from '../components/feed/PublishBox'
import FilterBar from '../components/feed/FilterBar'
import PublishSuccessModal from '../components/feed/PublishSuccessModal'
import BannerCarousel from '../components/feed/BannerCarousel'
import Spinner from '../components/shared/Spinner'
import { Button, Panel, SkeletonPostCard, EmptyState, SectionLabel } from '../components/ui'
import ErrorBoundary from '../components/shared/ErrorBoundary'
import { TAB_COLOR } from '../lib/constants'
import { getCommunityStats } from '../api/stats'
import FeedWidgets from '../components/feed/FeedWidgets'
import { publicName } from '../lib/helpers'
import UserAvatar from '../components/shared/UserAvatar'
import { preloadedFeed } from '../lib/feedPreloader'
import { registerCacheCleaner } from '../lib/cacheManager'

// Cache local — se inicializa desde el preloader si ya tiene datos
const FEED_CACHE_TTL = 3 * 60 * 1000
let _feedCache = preloadedFeed

// Cache de usuarios bloqueados (raramente cambia)
let _blockedCache = null

// Al cerrar sesión, limpiar caches para que el siguiente usuario no vea datos ajenos
registerCacheCleaner(() => {
  _feedCache = { posts: [], ts: 0, filters: '{}', sort: 'smart' }
  _blockedCache = null
})

const SORT_OPTIONS = [
  { value: 'smart',   label: 'Relevante', icon: Sparkles },
  { value: 'recent',  label: 'Reciente',  icon: Clock },
]

function useDebounce(value, ms) {
  const [deb, setDeb] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDeb(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return deb
}

export default function FeedPage() {
  const { session, profile, loading: authLoading } = useAuth()
  const navigate    = useNavigate()
  const location    = useLocation()

  const [focusSearch, setFocusSearch] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('publish') === '1') {
      setPublishOpen(true)
      navigate('/feed', { replace: true })
    }
    if (params.get('buscar') === '1') {
      setFocusSearch(true)
      navigate('/feed', { replace: true })
      setTimeout(() => setFocusSearch(false), 800)
    }
  }, [location.search, navigate])

  const toast = useToast()

  const [posts,          setPosts         ] = useState(() => {
    // Inicializar con cache si es válido — cero flicker al volver al feed
    const c = _feedCache
    const noFilters = c.filters === '{}' && c.sort === 'smart'
    if (noFilters && c.posts.length > 0 && Date.now() - c.ts < FEED_CACHE_TTL) return c.posts
    return []
  })
  const [loading,        setLoading       ] = useState(posts.length === 0)
  const [loadingMore,    setLoadingMore   ] = useState(false)
  const [hasMore,        setHasMore       ] = useState(true)
  const [filters,        setFilters       ] = useState({})
  const [sort,           setSort          ] = useState('recent')
  const [publishOpen,    setPublishOpen   ] = useState(false)
  const [successOpen,    setSuccessOpen   ] = useState(false)
  const [lastPublishedId,setLastPublishedId] = useState(null)
  const [contactingPost, setContactingPost] = useState(null)
  const [blockedUsers,   setBlockedUsers  ] = useState(_blockedCache || [])
  const [communityStats, setCommunityStats] = useState({ connections: 0, requests: 0, activeThisWeek: 0 })
  const sentinel = useRef(null)

  const debouncedFilters = useDebounce(filters, 400)

  useEffect(() => {
    if (!session?.user?.id) return
    if (_blockedCache) { setBlockedUsers(_blockedCache); return }
    getBlockedUsers(session.user.id).then(list => {
      _blockedCache = list
      setBlockedUsers(list)
    }).catch(() => {})
  }, [session?.user?.id])

  useEffect(() => {
    getCommunityStats().then(setCommunityStats).catch(() => {})
  }, [])

  const fetchPosts = useCallback(async (cursor, append = false) => {
    // Reintento automático: si la primera llamada falla (típico tras recargar
    // cuando el cliente aún está renovando el token), reintenta hasta 2 veces.
    const attempt = async () => {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5000)
      )
      return Promise.race([
        listPosts({ cursor, limit: 20, filters: debouncedFilters, sort, userId: session?.user?.id, blockedIds: blockedUsers }),
        timeout,
      ])
    }

    try {
      let data
      let lastErr
      for (let i = 0; i < 2; i++) {
        try {
          data = await attempt()
          break
        } catch (e) {
          lastErr = e
          if (i < 1) await new Promise(r => setTimeout(r, 600))
        }
      }
      if (data === undefined) throw lastErr || new Error('No se pudo cargar el feed')

      if (append) {
        setPosts(p => [...p, ...data])
      } else {
        setPosts(data)
        const filtersKey = JSON.stringify(debouncedFilters)
        if (filtersKey === '{}' && !cursor) {
          _feedCache = { posts: data, ts: Date.now(), filters: filtersKey, sort }
        }
      }
      setHasMore(data.length === 20)
    } catch (e) {
      // DIAGNÓSTICO: mostrar el error real en pantalla
      const detail = e?.message || e?.error_description || e?.code || JSON.stringify(e).slice(0, 100)
      toast(`Feed falló: ${detail}`, 'error')
      console.error('FEED ERROR COMPLETO:', e)
    }
  }, [debouncedFilters, sort, toast, session?.user?.id, blockedUsers])

  useEffect(() => {
    let mounted = true
    // Esperar a que la autenticación termine de resolverse antes de pedir posts.
    // Al recargar, si pedimos posts mientras el token aún se valida, la query
    // se cuelga. Si hay cache, lo mostramos mientras tanto (cero espera visible).
    if (authLoading) return

    const filtersKey = JSON.stringify(debouncedFilters)
    const noFilters  = filtersKey === '{}'
    const cacheValid = noFilters && sort === 'smart'
      && _feedCache.posts.length > 0
      && _feedCache.filters === filtersKey
      && _feedCache.sort === sort
      && (Date.now() - _feedCache.ts < FEED_CACHE_TTL)

    // Si el cache es válido, mostramos el contenido al instante y refrescamos en silencio
    if (!cacheValid) setLoading(true)
    fetchPosts().finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [fetchPosts, debouncedFilters, sort, authLoading])

  const [newPostsAvailable, setNewPostsAvailable] = useState(false)
  useRealtime('posts', 'INSERT', useCallback(() => {
    setNewPostsAvailable(true)
  }, []))

  // Al volver a la pestaña tras estar inactivo, refrescar el feed en silencio.
  // Esto evita ver contenido obsoleto y "revive" la app si el realtime se durmió.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        const stale = Date.now() - _feedCache.ts > 60_000
        if (stale) fetchPosts()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [fetchPosts])

  const loadNewPosts = useCallback(() => {
    setNewPostsAvailable(false)
    fetchPosts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [fetchPosts])

  const stateRef = useRef({ posts, hasMore, loadingMore })
  stateRef.current = { posts, hasMore, loadingMore }

  // Ref a fetchPosts para que el IntersectionObserver no se recree en cada cambio
  const fetchPostsRef = useRef(fetchPosts)
  fetchPostsRef.current = fetchPosts

  useEffect(() => {
    if (!sentinel.current) return
    const obs = new IntersectionObserver(([entry]) => {
      const { posts: ps, hasMore: hm, loadingMore: lm } = stateRef.current
      if (entry.isIntersecting && hm && !lm && ps.length > 0) {
        setLoadingMore(true)
        const cursor = ps[ps.length - 1].created_at
        fetchPostsRef.current(cursor, true).finally(() => setLoadingMore(false))
      }
    }, { rootMargin: '300px' })
    obs.observe(sentinel.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const targetId = location.state?.scrollToPostId
    if (!targetId || loading || posts.length === 0) return
    handleScrollToPost(targetId)
  }, [location.state?.scrollToPostId, loading, posts])

  const handlePublished = (newPost) => {
    setLastPublishedId(newPost?.id || null)
    setPublishOpen(false)
    setSuccessOpen(true)
    // Al publicar siempre se vuelve a "Reciente": si el usuario estaba en
    // "Relevante", su publicación podría no quedar arriba y parecería perdida.
    setSort('recent')
    // Optimista: el post aparece YA en el feed, sin esperar el refetch de red
    if (newPost?.id) {
      const optimistic = {
        ...newPost,
        profiles: profile || null,
        reaction_count: 0, comment_count: 0, reactions: [],
      }
      setPosts(p => [optimistic, ...p.filter(x => x.id !== newPost.id)])
    }
    fetchPosts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Quita la publicación borrada de la lista, sin recargar el feed.
  const handlePostDeleted = useCallback((deletedId) => {
    setPosts(prev => prev.filter(p => p.id !== deletedId))
  }, [])

  const handleContact = useCallback(async (post) => {
    if (contactingPost) return
    setContactingPost(post.id)
    try {
      const conv = await getOrCreateConversation(session.user.id, post.author_id, post.id)
      if (conv.isNew) {
        const excerpt = [post.title, post.content].filter(Boolean).join(' — ').slice(0, 120)
        await sendMessage({
          conversation_id: conv.id,
          sender_id: session.user.id,
          content: `Hola, vi tu publicación${excerpt ? ` "${excerpt}${excerpt.length >= 120 ? '…' : ''}"` : ''}`,
        })
      }
      if (post.author_id !== session.user.id) {
        createNotification({
          user_id: post.author_id, from_user_id: session.user.id,
          type: 'message', content: `quiere contactarte sobre "${post.title.slice(0, 50)}"`,
          post_id: post.id,
        })
      }
      navigate('/chats', { state: { convId: conv.id } })
    } catch (e) { toast(safeErrorMessage(e), 'error') }
    setContactingPost(null)
  }, [session?.user?.id, navigate, toast, contactingPost])

  const handleScrollToPost = (postId) => {
    const el = document.getElementById(`post-${postId}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    else setSort('recent')
  }

  const activeTab  = filters.tab || 'todo'
  const tabStyle   = TAB_COLOR[activeTab] || TAB_COLOR.todo
  const feedBg     = tabStyle.bg

  const name = publicName(profile)
  const firstName = (profile?.full_name || name).trim().split(' ')[0]
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="page-enter" style={{ paddingBottom: 80 }}>

      {/* ── DESKTOP: Layout 3 columnas tipo LinkedIn ── */}
      <div className="hidden md:grid grid-cols-[248px,minmax(0,1fr),292px] gap-6 max-w-[1500px] mx-auto px-6 lg:px-8 pt-6 items-start">

        {/* ── Columna izquierda (sticky) ── */}
        <div className="w-full flex-shrink-0 space-y-4" style={{ position: 'sticky', top: 88 }}>

          {/* Mini perfil */}
          <div className="overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-card)', boxShadow: 'var(--shadow-card)' }}>
            <div className="h-14 w-full" style={{ background: 'linear-gradient(135deg, #162A4A 0%, #2457C5 72%, #4C9BE8 100%)' }} />
            <div className="px-4 pb-4 -mt-7">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-base mb-3 shadow-sm overflow-hidden"
                style={{ border: '3px solid var(--surface)', background: 'var(--accent-deep)' }}>
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} loading="lazy" decoding="async" className="w-14 h-14 object-cover" alt={name} />
                  : <span>{initials}</span>}
              </div>
              <p className="text-[15px] font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{name}</p>
              {profile?.city && <p className="text-[12px] mt-1" style={{ color: 'var(--text-tertiary)' }}>{profile.city}</p>}
              <div className="mt-4 pt-4 space-y-2" style={{ borderTop: '1px solid var(--border-soft)' }}>
                <div className="flex justify-between">
                  <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Publicaciones</span>
                  <span className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>{communityStats.requests || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Activos hoy</span>
                  <span className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>{communityStats.activeThisWeek || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Próximos eventos */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-card)', boxShadow: 'var(--shadow-card)' }}>
            <div className="px-4 pt-4 pb-1 flex items-center justify-between">
              <p className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>Próximos eventos</p>
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-mint)' }} />
            </div>
            <div className="px-4 pb-4 space-y-3">
              {[
                { day: '12', mon: 'Jul', name: 'Expoquímica Bogotá', loc: 'Corferias · Presencial' },
                { day: '18', mon: 'Jul', name: 'Webinar Formulación', loc: 'Virtual · Gratis' },
                { day: '2',  mon: 'Ago', name: 'Taller reactivos lab', loc: 'Medellín · Cupos ltdos.' },
              ].map(ev => (
                <div key={ev.name} className="flex gap-2 items-start">
                  <div className="w-10 flex-shrink-0 text-center rounded-[12px] py-1.5" style={{ background: 'var(--accent-softer)', border: '1px solid var(--accent-soft)' }}>
                    <p className="text-sm font-bold leading-none" style={{ color: 'var(--accent-deep)' }}>{ev.day}</p>
                    <p className="text-[9px] uppercase tracking-[0.08em]" style={{ color: 'var(--accent)' }}>{ev.mon}</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{ev.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{ev.loc}</p>
                  </div>
                </div>
              ))}
              <button className="text-[12px] font-semibold mt-1" style={{ color: 'var(--accent)' }}>Ver todos →</button>
            </div>
          </div>

        </div>

        {/* ── Columna central ── */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="hidden md:flex items-center justify-between px-1">
            <div>
              <p className="text-[12px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--text-tertiary)' }}>Tu comunidad</p>
              <p className="text-[24px] font-semibold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>Inicio</p>
            </div>
            <button onClick={() => setPublishOpen(true)} className="h-10 px-4 rounded-btn text-[13px] font-semibold text-white transition-all duration-[160ms] hover:-translate-y-px active:translate-y-0" style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-raised)' }}>
              + Nueva publicación
            </button>
          </div>
          <ErrorBoundary><FilterBar filters={filters} setFilters={setFilters} autoFocusSearch={focusSearch} /></ErrorBoundary>
          {publishOpen === false && <button onClick={() => setPublishOpen(true)} className="md:hidden w-full flex items-center gap-3 p-3.5 rounded-card text-left transition-all duration-[160ms] active:scale-[0.995]" style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-card)' }}>
            <UserAvatar seed={session?.user?.id || 'me'} avatarUrl={profile?.avatar_url} size={38} />
            <span className="flex-1 text-[14px]" style={{ color: 'var(--text-tertiary)' }}>¿Qué quieres compartir con tu comunidad?</span>
            <span className="inline-flex items-center justify-center px-3 h-9 rounded-btn text-[12px] font-semibold text-white" style={{ background: 'var(--accent)' }}>Publicar</span>
          </button>}
          {activeTab === 'todo' && <BannerCarousel />}
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: 'var(--accent)' }}>
              {loading ? '...' : `${posts.length} publicaciones`}
            </span>
            <div className="flex bg-white border border-ink-200 rounded-xl overflow-hidden">
              {SORT_OPTIONS.map(opt => { const Icon = opt.icon; return (
                <button key={opt.value} onClick={() => setSort(opt.value)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium transition-colors ${sort === opt.value ? 'text-white' : 'text-ink-500 hover:bg-ink-50'}`}
                  style={sort === opt.value ? { background: 'var(--accent-deep)' } : {}}>
                  <Icon size={12} />{opt.label}
                </button>
              )})}
            </div>
          </div>
          {newPostsAvailable && (
            <button onClick={loadNewPosts}
              className="w-full flex items-center justify-center gap-1.5 text-white text-xs font-medium py-2 rounded-xl"
              style={{ background: 'var(--accent-deep)' }}>
              <ArrowUp size={13} /> Hay novedades, mira
            </button>
          )}
          {loading ? (
            <div className="space-y-4">{[1,2,3].map(i => <SkeletonPostCard key={i} />)}</div>
          ) : posts.length === 0 ? (
            <Panel>
              <EmptyState icon={FileText}
                title="Todavía no hay publicaciones"
                description="Cambia los filtros para ver más, o abre la conversación publicando algo tú."
                action={<Button onClick={() => setPublishOpen(true)}>Crear publicación</Button>} />
            </Panel>
          ) : (
            <div className="space-y-0">
              {posts.map((post, idx, arr) => (
                <div key={post.id}>
                  <PostCard post={post} onContact={handleContact} contactingId={contactingPost} blockedUsers={blockedUsers} onDeleted={handlePostDeleted} />
                  {idx < arr.length - 1 && <div style={{ height: '10px' }} />}
                </div>
              ))}
              <div ref={sentinel} />
              {loadingMore && <div className="flex justify-center py-4"><Spinner size={20} className="text-brand-600" /></div>}
            </div>
          )}
        </div>

        {/* ── Columna derecha — widgets configurables por admin ── */}
        <div className="w-full flex-shrink-0" style={{ position: 'sticky', top: 88 }}>
          <FeedWidgets />
        </div>
      </div>

      {/* ── MÓVIL: columna única ── */}
      <div className="md:hidden max-w-2xl mx-auto px-4 pt-3">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--text-tertiary)' }}>Tu comunidad</p>
            <p className="text-[22px] font-semibold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>Inicio</p>
          </div>
          <button onClick={() => setPublishOpen(true)} className="h-9 px-3 rounded-btn text-[12px] font-semibold text-white" style={{ background: 'var(--accent)' }}>Publicar</button>
        </div>
        <ErrorBoundary><FilterBar filters={filters} setFilters={setFilters} autoFocusSearch={focusSearch} /></ErrorBoundary>
        {activeTab === 'todo' && <BannerCarousel />}
        <div className="flex items-center justify-between mb-3 mt-3">
          <span className="t-eyebrow" style={{ color: 'var(--text-tertiary)' }}>
            {loading ? 'Publicaciones' : <>Publicaciones<span className="tnum"> · {posts.length}</span></>}
          </span>
          <div className="flex rounded-input overflow-hidden p-0.5" style={{ background: 'var(--bg-subtle)' }} role="tablist">
            {SORT_OPTIONS.map(opt => { const Icon = opt.icon; const on = sort === opt.value; return (
              <button key={opt.value} onClick={() => setSort(opt.value)} role="tab" aria-selected={on}
                className="flex items-center gap-1.5 px-3 h-[32px] rounded-input text-[13px] font-medium transition-all duration-[160ms] ease-premium"
                style={on
                  ? { background: 'var(--surface)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-card)' }
                  : { background: 'transparent', color: 'var(--text-tertiary)' }}>
                <Icon size={14} strokeWidth={2} />{opt.label}
              </button>
            )})}
          </div>
        </div>
        {newPostsAvailable && (
          <button onClick={loadNewPosts}
            className="w-full flex items-center justify-center gap-2 h-[40px] rounded-btn t-body-sm font-medium mb-4 transition-all duration-[160ms] active:scale-[0.99]"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent-deep)' }}>
            <ArrowUp size={13} /> Hay novedades, mira
          </button>
        )}
        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <SkeletonPostCard key={i} />)}</div>
        ) : posts.length === 0 ? (
          <Panel>
            <EmptyState icon={FileText}
              title="Todavía no hay publicaciones"
              description="Cambia los filtros para ver más, o abre la conversación publicando algo tú."
              action={<Button onClick={() => setPublishOpen(true)}>Crear publicación</Button>} />
          </Panel>
        ) : (
          <div className="space-y-0">
            {posts.map((post, idx, arr) => (
              <div key={post.id}>
                <PostCard post={post} onContact={handleContact} contactingId={contactingPost} blockedUsers={blockedUsers} onDeleted={handlePostDeleted} />
                {idx < arr.length - 1 && <div style={{ height: '10px' }} />}
              </div>
            ))}
            <div ref={sentinel} />
            {loadingMore && <div className="flex justify-center py-4"><Spinner size={20} className="text-brand-600" /></div>}
          </div>
        )}
      </div>

      {publishOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 overflow-y-auto"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 56px)', paddingBottom: 24,
            background: 'rgba(15,23,42,0.32)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            // Con el teclado abierto el viewport se encoge: overscroll-contain
            // evita que el scroll se propague al feed de atrás.
            overscrollBehavior: 'contain' }}
          onClick={() => setPublishOpen(false)}>
          <div className="w-full max-w-xl" onClick={e => e.stopPropagation()}>
            <PublishBox onClose={() => setPublishOpen(false)} onPublished={handlePublished} />
          </div>
        </div>
      )}

      <PublishSuccessModal open={successOpen} onClose={() => setSuccessOpen(false)}
        onViewMyRequest={() => {
          setSuccessOpen(false)
          if (lastPublishedId) {
            const el = document.getElementById(`post-${lastPublishedId}`)
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }} />
    </div>
  )
}
