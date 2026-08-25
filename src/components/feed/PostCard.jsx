import { useState, useRef, useEffect, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Loader2, FileText, MoreHorizontal, Flag, UserX, Send, ThumbsUp, MessageSquareText, Trash2 } from 'lucide-react'
import { timeAgo, publicName } from '../../lib/helpers'
import { CATEGORY_MAP } from '../../lib/constants'
import { useAuth } from '../../contexts/AuthContext'
import { blockUser } from '../../api/moderation'
import { toggleReaction, getReactionsForPost } from '../../api/reactions'
import { deletePost } from '../../api/posts'
import { createNotification } from '../../api/notifications'
import { useToast } from '../shared/Toast'
import { Button, Card, Badge } from '../ui'
import UserAvatar from '../shared/UserAvatar'
import CommentSection from './CommentSection'
import ReportModal from './ReportModal'
import { hoverProps } from '../../lib/hover'

function MediaGallery({ media }) {
  if (!media || media.length === 0) return null
  const images = media.filter(m => m.type?.startsWith('image/'))
  const videos = media.filter(m => m.type?.startsWith('video/'))
  const pdfs   = media.filter(m => m.type === 'application/pdf')

  return (
    <div className="mb-1.5 space-y-1.5">
      {images.length > 0 && (
        <div className={`grid gap-1 rounded-2xl overflow-hidden ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {images.slice(0, 4).map((img, idx) => {
            // Aspect ratio real cuando lo tenemos guardado (media nueva);
            // fallback a 16/9 (única) o 1/1 (grid) para media histórica.
            const ratio = img.w && img.h
              ? (images.length === 1 ? Math.max(img.w / img.h, 1) : 1)
              : (images.length === 1 ? 16 / 9 : 1)
            return (
              <div key={idx} className="relative bg-[var(--border-soft)]"
                style={{ aspectRatio: String(ratio), ...(images.length === 1 ? { maxHeight: 320 } : {}) }}>
                <img src={img.url} alt="" loading="lazy" decoding="async"
                  width={img.w || undefined} height={img.h || undefined}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => window.open(img.url, '_blank')} />
                {idx === 3 && images.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-medium text-lg">+{images.length - 4}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      {videos.map((vid, idx) => (
        <div key={idx} className="relative rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: '16/9', maxHeight: 320 }}>
          <video src={vid.url} controls className="w-full h-full object-contain" preload="none" />
        </div>
      ))}
      {pdfs.map((pdf, idx) => (
        <a key={idx} href={pdf.url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 p-2 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-subtle)] hover:bg-slate-50 transition-colors group">
          <div className="w-7 h-7 rounded-lg bg-[var(--error)]/10 flex items-center justify-center flex-shrink-0">
            <FileText size={14} className="text-[var(--error)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent)]">
              {pdf.name || 'Documento PDF'}
            </p>
            <p className="text-[10px] text-[var(--text-tertiary)]">PDF · Click para abrir</p>
          </div>
        </a>
      ))}
    </div>
  )
}

function PostMenu({ post, onReport, isMine = false, onDelete }) {
  const { session } = useAuth()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleBlock = async () => {
    setOpen(false)
    try {
      await blockUser(session.user.id, post.author_id)
      toast('Usuario bloqueado.', 'success')
    } catch { toast('Error al bloquear', 'error') }
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} aria-label="Más opciones" aria-expanded={open}
        className="w-8 h-8 flex items-center justify-center rounded-input transition-colors duration-[160ms]"
        style={{ color: 'var(--text-tertiary)' }}
        {...hoverProps(
          e => e.currentTarget.style.background = 'var(--bg-subtle)',
          e => e.currentTarget.style.background = 'transparent',
        )}>
        <MoreHorizontal size={18} strokeWidth={2} />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-20 rounded-input py-2 w-52 modal-enter"
          style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-dropdown)', border: '1px solid var(--border-soft)' }}
          role="menu">
          {isMine ? (
            <button onClick={() => { setOpen(false); onDelete?.() }} role="menuitem"
              className="w-full flex items-center gap-3 px-4 py-2.5 t-body-sm font-medium transition-colors duration-[160ms]"
              style={{ color: 'var(--error)' }}
              {...hoverProps(
                e => e.currentTarget.style.background = 'var(--error-bg)',
                e => e.currentTarget.style.background = 'transparent',
              )}>
              <Trash2 size={16} strokeWidth={2} />
              Eliminar publicación
            </button>
          ) : (
            <>
              <button onClick={() => { setOpen(false); onReport() }} role="menuitem"
                className="w-full flex items-center gap-3 px-4 py-2.5 t-body-sm font-medium transition-colors duration-[160ms]"
                style={{ color: 'var(--text-secondary)' }}
                {...hoverProps(
                  e => e.currentTarget.style.background = 'var(--bg-subtle)',
                  e => e.currentTarget.style.background = 'transparent',
                )}>
                <Flag size={16} strokeWidth={2} style={{ color: 'var(--text-tertiary)' }} />
                Reportar publicación
              </button>
              <button onClick={handleBlock} role="menuitem"
                className="w-full flex items-center gap-3 px-4 py-2.5 t-body-sm font-medium transition-colors duration-[160ms]"
                style={{ color: 'var(--text-secondary)' }}
                {...hoverProps(
                  e => e.currentTarget.style.background = 'var(--bg-subtle)',
                  e => e.currentTarget.style.background = 'transparent',
                )}>
                <UserX size={16} strokeWidth={2} style={{ color: 'var(--text-tertiary)' }} />
                Bloquear usuario
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default memo(function PostCard({ post, onContact, contactingId, blockedUsers = [], onDeleted }) {
  const { session } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const userId = session?.user?.id
  const [showComments, setShowComments] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const likeInitialized = useRef(false)

  useEffect(() => {
    if (likeInitialized.current) return
    likeInitialized.current = true
    const source = post.reactions ?? null
    if (source !== null) {
      const likes = source.filter(r => r.type === 'like')
      setLikeCount(likes.length)
      setLiked(likes.some(r => r.user_id === userId))
    } else {
      getReactionsForPost(post.id).then(data => {
        const likes = data.filter(r => r.type === 'like')
        setLikeCount(likes.length)
        setLiked(likes.some(r => r.user_id === userId))
      }).catch(() => {})
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    if (deleting) return
    setDeleting(true)
    try {
      await deletePost(post)
      toast('Publicación eliminada.', 'success')
      setConfirmDelete(false)
      onDeleted?.(post.id)
    } catch (err) {
      toast(err?.message || 'No se pudo eliminar la publicación.', 'error')
      setDeleting(false)
    }
  }

  const handleLike = async () => {
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount(c => Math.max(0, c + (wasLiked ? -1 : 1)))
    try {
      const result = await toggleReaction(post.id, userId, 'like')
      if (result.action === 'added' && post.author_id !== userId) {
        createNotification({
          user_id: post.author_id, from_user_id: userId,
          type: 'reaction',
          content: 'le dio me gusta a tu publicación',
          post_id: post.id,
        })
      }
    } catch (e) {
      console.error('Like error:', e)
      setLiked(wasLiked)
      setLikeCount(c => Math.max(0, c + (wasLiked ? 1 : -1)))
    }
  }

  if (blockedUsers.includes(post.author_id)) return null

  const prof      = post.profiles || {}
  const name      = publicName(prof)
  const isMine    = post.author_id === session?.user?.id
  const catObj    = CATEGORY_MAP[post.category]
  const catLabel  = catObj?.label || post.category
  const isContacting = contactingId === post.id

  let media = []
  if (post.media) {
    try { media = typeof post.media === 'string' ? JSON.parse(post.media) : post.media }
    catch { media = [] }
  }

  // Texto muro: título + contenido como un solo bloque
  const wallText = [post.title, post.content].filter(Boolean).join('\n\n')

  const goToProfile = () => navigate(`/u/${post.author_id}`)

  return (
    <Card id={`post-${post.id}`} className="overflow-hidden group" style={{ borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}>
      <div className="px-4 py-2.5 sm:px-5 sm:py-3">

        {/* Header */}
        <div className="flex items-start gap-2.5 mb-2">
          <button onClick={goToProfile} aria-label={`Ver perfil de ${name}`} className="flex-shrink-0">
            <UserAvatar seed={prof.id || name} name={name} avatarUrl={prof.avatar_url} size={36} className="!rounded-full ring-2 ring-white" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <button onClick={goToProfile}
                className="text-[14px] font-semibold text-left truncate transition-colors hover:text-[var(--accent)]"
                style={{ color: 'var(--text-primary)' }}>
                {name}
              </button>
              {catLabel && <Badge tone="brand" className="flex-shrink-0">{catLabel}</Badge>}
            </div>
            <p className="text-[12px] truncate" style={{ color: 'var(--text-tertiary)' }}>
              {prof.city && <>{prof.city} · </>}
              {timeAgo(post.created_at)}
            </p>
          </div>
          <PostMenu post={post} isMine={isMine}
            onReport={() => setReportOpen(true)}
            onDelete={() => setConfirmDelete(true)} />
        </div>

        {/* Contenido */}
        {wallText && (
          <p className="text-[15px] leading-[1.4] mb-2 whitespace-pre-wrap break-words"
            style={{ color: 'var(--text-primary)' }}>
            {wallText}
          </p>
        )}

        <MediaGallery media={media} />

        {/* Footer / acciones — sin línea, separado por aire */}
        <div className="flex items-center gap-1 pt-0.5">
          <button onClick={handleLike} aria-pressed={liked}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-btn text-[13px] font-semibold transition-all duration-[160ms] active:scale-[0.98]"
            style={liked
              ? { background: 'var(--accent-soft)', color: 'var(--accent)' }
              : { background: 'transparent', color: 'var(--text-secondary)' }}>
            <ThumbsUp size={16} strokeWidth={1.9} fill={liked ? 'currentColor' : 'none'} />
            <span>{likeCount || 0}</span>
          </button>

          <button onClick={() => setShowComments(!showComments)} aria-expanded={showComments}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-btn text-[13px] font-semibold transition-all duration-[160ms] active:scale-[0.98]"
            style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
            <MessageCircle size={16} strokeWidth={1.9} />
            <span>{post.comment_count || 0}</span>
          </button>

          <div className="flex-1" />
          {!isMine && (
            <Button size="sm" onClick={() => onContact?.(post)} loading={isContacting}
              className="!h-9 !px-4">
              Contactar
            </Button>
          )}
        </div>

        <CommentSection post={post} isOpen={showComments} />
        <ReportModal post={post} open={reportOpen} onClose={() => setReportOpen(false)} />

        {/* Confirmación de borrado */}
        {confirmDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6"
            style={{ background: 'rgba(15,23,42,0.32)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
            onClick={() => !deleting && setConfirmDelete(false)}
            role="dialog" aria-modal="true" aria-labelledby="del-title">
            <div className="modal-enter rounded-modal w-full max-w-[380px] p-6"
              style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-modal)' }}
              onClick={e => e.stopPropagation()}>
              <div className="w-11 h-11 rounded-input flex items-center justify-center mb-4"
                style={{ background: 'var(--error-bg)' }}>
                <Trash2 size={20} strokeWidth={1.9} style={{ color: 'var(--error)' }} />
              </div>
              <h3 id="del-title" className="t-h4" style={{ color: 'var(--text-primary)' }}>
                Eliminar publicación
              </h3>
              <p className="t-body-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                Se borran también sus comentarios y reacciones, y no se puede deshacer.
                Los chats que iniciaste desde ella se conservan.
              </p>
              <div className="flex gap-3 mt-6">
                <Button variant="secondary" size="sm" fullWidth
                  onClick={() => setConfirmDelete(false)} disabled={deleting}>
                  Cancelar
                </Button>
                <Button variant="destructive" size="sm" fullWidth
                  onClick={handleDelete} loading={deleting}>
                  {deleting ? 'Eliminando' : 'Eliminar'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
})
