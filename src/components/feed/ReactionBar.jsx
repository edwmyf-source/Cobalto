import { useState, useEffect, useRef } from 'react'
import { ThumbsUp, PartyPopper, Eye, Heart, Sparkles } from 'lucide-react'
import { toggleReaction, getReactionsForPost } from '../../api/reactions'
import { createNotification } from '../../api/notifications'
import { REACTIONS } from '../../lib/constants'
import { useAuth } from '../../contexts/AuthContext'

const REACTION_ICONS = { thumbsup: ThumbsUp, partypopper: PartyPopper, eye: Eye, heart: Heart, sparkles: Sparkles }

// Procesa array de reacciones en counts + myReactions
function parseReactions(data, userId) {
  const c = {}
  const mine = new Set()
  data.forEach(r => {
    c[r.type] = (c[r.type] || 0) + 1
    if (r.user_id === userId) mine.add(r.type)
  })
  return { counts: c, myReactions: mine }
}

export default function ReactionBar({ post, initialReactions = null }) {
  const { session } = useAuth()
  const userId = session?.user?.id
  const [counts, setCounts] = useState({})
  const [myReactions, setMyReactions] = useState(new Set())
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    if (initialReactions !== null) {
      // Datos vienen del feed — sin query extra
      const { counts: c, myReactions: m } = parseReactions(initialReactions, userId)
      setCounts(c)
      setMyReactions(m)
    } else {
      // Fallback: fetch individual (perfil u otros contextos)
      getReactionsForPost(post.id).then(data => {
        const { counts: c, myReactions: m } = parseReactions(data, userId)
        setCounts(c)
        setMyReactions(m)
      }).catch(() => {})
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleReaction = async (type) => {
    try {
      const wasActive = myReactions.has(type)
      // Optimistic update
      setCounts(prev => ({
        ...prev,
        [type]: Math.max(0, (prev[type] || 0) + (wasActive ? -1 : 1))
      }))
      setMyReactions(prev => {
        const next = new Set(prev)
        wasActive ? next.delete(type) : next.add(type)
        return next
      })

      const result = await toggleReaction(post.id, userId, type)
      if (result.action === 'added' && post.author_id !== userId) {
        const label = REACTIONS.find(r => r.type === type)?.label || type
        createNotification({
          user_id: post.author_id,
          from_user_id: userId,
          type: 'reaction',
          content: `reaccionó con "${label}" a tu publicación`,
          post_id: post.id,
        })
      }
    } catch (e) {
      console.error('Reaction error:', e)
    }
  }

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0)
  const activeReactions = REACTIONS.filter(r => counts[r.type] > 0)

  return (
    <div className="mb-1.5">
      {totalCount > 0 && (
        <div className="flex items-center gap-1 mb-1 text-[10px] text-ink-400">
          <span className="flex -space-x-0.5">
            {activeReactions.slice(0, 3).map(r => {
              const Icon = REACTION_ICONS[r.icon]
              return <Icon key={r.type} size={12} className="text-ink-400" />
            })}
          </span>
          <span>{totalCount}</span>
        </div>
      )}
      <div className="flex gap-1">
        {REACTIONS.map(reaction => {
          const count = counts[reaction.type] || 0
          const isActive = myReactions.has(reaction.type)
          const Icon = REACTION_ICONS[reaction.icon]
          return (
            <button key={reaction.type}
              onClick={() => handleReaction(reaction.type)}
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                isActive
                  ? 'bg-brand-500/15 border border-brand-500/30'
                  : 'bg-ink-100/60 hover:bg-slate-50 border border-transparent'
              }`}
              title={reaction.label}>
              <Icon size={13} className={isActive ? 'text-brand-600' : 'text-ink-400'} />
              {count > 0 && <span className="text-ink-600 text-[10px]">{count}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
