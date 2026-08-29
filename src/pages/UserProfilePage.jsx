import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, UserPlus, UserCheck, MessageCircle, Send, Loader2, Settings, Camera, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getPublicProfile, uploadAvatar, uploadCover, updateProfile } from '../api/profiles'
import { getPostsByUser, deletePost } from '../api/posts'
import { followUser, unfollowUser, checkIsFollowing, getFollowCounts } from '../api/follows'
import { getOrCreateConversation } from '../api/messages'
import { createNotification } from '../api/notifications'
import { publicName, timeAgo } from '../lib/helpers'
import { CATEGORY_MAP } from '../lib/constants'
import UserAvatar from '../components/shared/UserAvatar'
import Spinner from '../components/shared/Spinner'
import { useToast } from '../components/shared/Toast'
import { safeErrorMessage } from '../lib/errors'

function MiniPostCard({ post, onContact, contactingId, onDeleted }) {
  const { session } = useAuth()
  const toast = useToast()
  const isMine = post.author_id === session?.user?.id
  const catLabel = CATEGORY_MAP[post.category]?.label || post.category
  const wallText = [post.title, post.content].filter(Boolean).join('\n\n')
  const isContacting = contactingId === post.id
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const remove = async () => {
    if (deleting) return
    setDeleting(true)
    try {
      await deletePost(post)
      toast('Publicación eliminada.', 'success')
      onDeleted?.(post.id)
    } catch (err) {
      toast(err?.message || 'No se pudo eliminar.', 'error')
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <article className="group overflow-hidden rounded-card bg-white border border-line-soft transition-all duration-200 hover:-translate-y-0.5" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="px-4 py-3">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-softer)] flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-extrabold text-[var(--accent)]">RC</span>
          </div>
          <div className="min-w-0">
            {catLabel ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-pill text-[11px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                {catLabel}
              </span>
            ) : (
              <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Publicación</span>
            )}
          </div>
          <span className="text-[12px] ml-auto flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>{timeAgo(post.created_at)}</span>
        </div>

        {post.title && (
          <h4 className="t-h4 mb-1.5" style={{ color: 'var(--text-primary)' }}>{post.title}</h4>
        )}
        {post.content && (
          <p className="t-body-sm whitespace-pre-wrap break-words line-clamp-3 mb-2.5" style={{ color: 'var(--text-secondary)' }}>
            {post.content}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-line-soft">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1.5 rounded-pill" style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
            <MessageCircle size={13} />
            {post.comment_count || 0} comentarios
          </span>

          {isMine && (
            confirming ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>¿Eliminar?</span>
                <button onClick={() => setConfirming(false)} disabled={deleting}
                  className="px-2.5 py-1.5 rounded-pill text-[12px] font-bold disabled:opacity-50"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'var(--surface)' }}>
                  No
                </button>
                <button onClick={remove} disabled={deleting}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-pill text-[12px] font-bold text-white disabled:opacity-60"
                  style={{ background: 'var(--error)' }}>
                  {deleting ? <Loader2 size={12} className="animate-spin" /> : null}
                  Sí
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirming(true)} aria-label="Eliminar publicación"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--error-bg)]"
                style={{ color: 'var(--text-tertiary)' }}>
                <Trash2 size={14} />
              </button>
            )
          )}
        </div>
      </div>
    </article>
  )
}

export default function UserProfilePage() {
  const { userId } = useParams()
  const navigate   = useNavigate()
  const { session, profile: myProfile, setProfile: setMyProfile } = useAuth()
  const toast      = useToast()
  const myId       = session?.user?.id

  const [profile, setProfile]             = useState(null)
  const [posts, setPosts]                 = useState([])
  const [counts, setCounts]               = useState({ followers: 0, following: 0 })
  const [isFollowing, setIsFollowing]     = useState(false)
  const [loadingPage, setLoadingPage]     = useState(true)
  const [loadingFollow, setLoadingFollow] = useState(false)
  const [contactingPost, setContactingPost] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCover, setUploadingCover]   = useState(false)

  const avatarInputRef = useRef(null)
  const coverInputRef  = useRef(null)

  const isOwnProfile = myId === userId

  const load = useCallback(async () => {
    if (!userId) return
    try {
      const [prof, userPosts, followCounts] = await Promise.all([
        getPublicProfile(userId),
        getPostsByUser(userId, { limit: 30 }),
        getFollowCounts(userId),
      ])
      setProfile(prof)
      setPosts(userPosts)
      setCounts(followCounts)
      if (myId && !isOwnProfile) {
        const following = await checkIsFollowing(myId, userId)
        setIsFollowing(following)
      }
    } catch (e) {
      toast(safeErrorMessage(e), 'error')
    } finally {
      setLoadingPage(false)
    }
  }, [userId, myId, isOwnProfile, toast])

  useEffect(() => { load() }, [load])

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast('La foto no puede superar 5 MB', 'error'); return }
    setUploadingAvatar(true)
    try {
      const url = await uploadAvatar(myId, file)
      setProfile(p => ({ ...p, avatar_url: url }))
      // Sincronizar con el perfil global del contexto
      const updated = await updateProfile(myId, {
        full_name: myProfile?.full_name, company_name: myProfile?.company_name,
        phone: myProfile?.phone, city: myProfile?.city,
        identity_mode: myProfile?.identity_mode, identity_number: myProfile?.identity_number,
        email: session?.user?.email, avatar_url: url,
      })
      setMyProfile(updated)
    } catch (err) { toast(safeErrorMessage(err), 'error') }
    setUploadingAvatar(false)
    e.target.value = ''
  }

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast('La portada no puede superar 10 MB', 'error'); return }
    setUploadingCover(true)
    try {
      const url = await uploadCover(myId, file)
      setProfile(p => ({ ...p, cover_url: url }))
      await updateProfile(myId, {
        full_name: myProfile?.full_name, company_name: myProfile?.company_name,
        phone: myProfile?.phone, city: myProfile?.city,
        identity_mode: myProfile?.identity_mode, identity_number: myProfile?.identity_number,
        email: session?.user?.email, cover_url: url,
      })
    } catch (err) { toast(safeErrorMessage(err), 'error') }
    setUploadingCover(false)
    e.target.value = ''
  }

  const handleFollow = async () => {
    if (!myId || loadingFollow) return
    setLoadingFollow(true)
    try {
      if (isFollowing) {
        await unfollowUser(myId, userId)
        setIsFollowing(false)
        setCounts(c => ({ ...c, followers: Math.max(0, c.followers - 1) }))
      } else {
        await followUser(myId, userId)
        setIsFollowing(true)
        setCounts(c => ({ ...c, followers: c.followers + 1 }))
        createNotification({ user_id: userId, from_user_id: myId, type: 'follow', content: 'comenzó a seguirte' })
      }
    } catch (e) { toast(safeErrorMessage(e), 'error') }
    setLoadingFollow(false)
  }

  const [messagingUser, setMessagingUser] = useState(false)

  const handleMessage = async () => {
    if (messagingUser) return
    setMessagingUser(true)
    try {
      const conv = await getOrCreateConversation(myId, userId)
      navigate('/chats', { state: { convId: conv.id } })
    } catch (e) { toast(safeErrorMessage(e), 'error') }
    setMessagingUser(false)
  }

  const handleContact = useCallback(async (post) => {
    if (contactingPost) return
    setContactingPost(post.id)
    try {
      const conv = await getOrCreateConversation(myId, post.author_id, post.id)
      if (post.author_id !== myId) {
        createNotification({
          user_id: post.author_id, from_user_id: myId,
          type: 'message',
          content: `quiere contactarte sobre "${post.title?.slice(0, 50)}"`,
          post_id: post.id,
        })
      }
      navigate('/chats', { state: { convId: conv.id } })
    } catch (e) { toast(safeErrorMessage(e), 'error') }
    setContactingPost(null)
  }, [myId, navigate, toast, contactingPost])

  if (loadingPage) {
    return <div className="flex items-center justify-center py-20"><Spinner size={28} className="text-[var(--accent)]" /></div>
  }
  if (!profile) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <p className="text-[var(--text-tertiary)] text-sm">Perfil no encontrado.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[var(--accent)] text-sm hover:underline">Volver</button>
      </div>
    )
  }

  const displayName = publicName(profile)
  const coverUrl    = profile.cover_url || null

  return (
    <div className="page-enter max-w-2xl mx-auto px-1 pb-10">
      <section className="overflow-hidden rounded-panel bg-white mb-7"
        style={{ border: '1px solid rgba(36,87,197,0.20)',
                 boxShadow: '0 0 11px 2px rgba(36,87,197,0.22), 0 0 28px 7px rgba(36,87,197,0.13), 0 0 50px 13px rgba(36,87,197,0.06), var(--shadow-raised)' }}>
        <div className="relative h-44 sm:h-52">
          {coverUrl ? (
            <img src={coverUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
          ) : (
            <div className="relative w-full h-full overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--accent-deep) 0%, #193764 48%, var(--accent) 100%)' }}>
              <div className="absolute inset-0 opacity-60" style={{ background: 'radial-gradient(circle at 78% 18%, rgba(255,255,255,0.22), transparent 28%), radial-gradient(circle at 24% 84%, rgba(230,57,70,0.26), transparent 28%)' }} />
              <div className="absolute -right-10 -top-8 w-48 h-48 rounded-full border border-white/10" />
              <div className="absolute right-8 top-8 w-24 h-24 rounded-full border border-white/10" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />

          {isOwnProfile && (
            <>
              <button
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3.5 h-10 rounded-pill text-[12px] font-bold text-white border border-white/15 bg-black/25 backdrop-blur-md hover:bg-black/35 transition-all disabled:opacity-50"
                aria-label="Cambiar portada">
                <Camera size={14} /> Cambiar portada
              </button>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
            </>
          )}

          {uploadingCover && (
            <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px] flex items-center justify-center">
              <Loader2 size={26} className="text-white animate-spin" />
            </div>
          )}
        </div>

        <div className="px-5 sm:px-7 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between -mt-12 relative">
            <div className="relative w-fit">
              <div
                className="w-[104px] h-[104px] rounded-[24px] overflow-hidden border-4 border-white bg-white"
                onClick={isOwnProfile ? () => avatarInputRef.current?.click() : undefined}
                style={{ boxShadow: 'var(--shadow-raised)', cursor: isOwnProfile ? 'pointer' : 'default' }}>
                {uploadingAvatar ? (
                  <div className="w-full h-full bg-[var(--bg-subtle)] flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
                  </div>
                ) : (
                  <UserAvatar seed={profile.id} name={displayName} avatarUrl={profile.avatar_url} size={104} className="!rounded-[20px]" />
                )}
              </div>

              <div className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                {isOwnProfile ? (
                  <button onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar} className="w-full h-full rounded-full flex items-center justify-center disabled:opacity-50" aria-label="Cambiar foto de perfil">
                    <Camera size={14} className="text-white" />
                  </button>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-white" aria-hidden="true" />
                )}
              </div>

              {isOwnProfile && (
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              )}
            </div>

            <div className="flex items-center gap-2 pb-1">
              {isOwnProfile ? (
                <button onClick={() => navigate('/profile')}
                  className="inline-flex items-center gap-2 px-4 h-9 rounded-btn text-[13px] font-bold transition-all active:scale-[0.98]"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', background: 'var(--surface)' }}>
                  <Settings size={15} /> Editar perfil
                </button>
              ) : (
                <>
                  <button onClick={handleMessage} disabled={messagingUser}
                    className="inline-flex items-center justify-center w-11 h-11 rounded-full border transition-all active:scale-[0.98] disabled:opacity-60"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', background: 'var(--surface)' }}
                    aria-label="Enviar mensaje">
                    {messagingUser ? <Spinner size={15} /> : <Send size={17} />}
                  </button>
                  <button onClick={handleFollow} disabled={loadingFollow}
                    className="inline-flex items-center gap-2 px-5 h-11 rounded-btn text-[13px] font-bold transition-all disabled:opacity-60 active:scale-[0.98]"
                    style={isFollowing
                      ? { border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--surface)' }
                      : { background: 'var(--accent)', color: '#fff', boxShadow: '0 8px 20px rgba(36,87,197,0.20)' }}>
                    {loadingFollow ? <Spinner size={15} /> : isFollowing ? <><UserCheck size={16} /> Siguiendo</> : <><UserPlus size={16} /> Seguir</>}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-3">
            <h1 className="font-semibold" style={{ color: 'var(--text-primary)', fontSize: 'clamp(17px, 4.6vw, 20px)', letterSpacing: '-0.015em', lineHeight: 1.25 }}>{displayName}</h1>
            {profile.headline && (
              <p className="text-[13px] mt-1" style={{ color: 'var(--text-primary)' }}>{profile.headline}</p>
            )}
            {profile.city && (
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
                <MapPin size={12} /> {profile.city}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { value: posts.length, label: 'Publicaciones' },
              { value: counts.followers, label: 'Seguidores' },
              { value: counts.following, label: 'Siguiendo' },
            ].map(stat => (
              <div key={stat.label} className="rounded-input border border-line-soft px-2 py-2 text-center" style={{ background: 'var(--bg-app)' }}>
                <div className="text-[16px] sm:text-[18px] font-extrabold leading-none tnum" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
                <div className="text-[10px] sm:text-[11px] font-semibold mt-1" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex items-end justify-between mb-4 px-1">
        <div>
          <h2 className="t-h3" style={{ color: 'var(--text-primary)' }}>Publicaciones</h2>
        </div>
        <span className="text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>{posts.length} en total</span>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-card bg-white border border-line-soft px-6 py-14 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
            <MessageCircle size={20} />
          </div>
          <p className="t-body-sm font-bold" style={{ color: 'var(--text-primary)' }}>Aún no hay publicaciones</p>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-tertiary)' }}>Cuando comparta algo con la comunidad aparecerá aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <MiniPostCard key={post.id} post={post} onContact={handleContact} contactingId={contactingPost}
              onDeleted={(id) => setPosts(prev => prev.filter(p => p.id !== id))} />
          ))}
        </div>
      )}
    </div>
  )
}
