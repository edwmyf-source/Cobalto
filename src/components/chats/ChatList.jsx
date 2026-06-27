import { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown, Zap, Plane } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../shared/Toast'
import { getOffersForRequest } from '../../api/offers'
import { timeAgo, publicName } from '../../lib/helpers'
import UserAvatar from '../shared/UserAvatar'

// Componente individual de una propuesta (vendedor que cotizó)
function OfferRow({ offer, isActive, isMine, onSelect }) {
  const prof = offer.profiles || {}
  const name = publicName(prof)
  const dom = prof.email_domain || null
  const isImmediate = (offer.availability || 'immediate') === 'immediate'

  return (
    <button onClick={() => onSelect(offer)}
      className={`w-full text-left flex items-start gap-2.5 p-2.5 border-b border-ink-300 last:border-b-0 hover:bg-slate-50 ${
        isActive ? 'bg-brand-500/5 border-l-[3px] border-l-brand-600' : ''
      }`}>
      <UserAvatar seed={prof.id || name} size={32} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-medium text-ink-900 truncate">{isMine ? 'Tú' : name}</span>
            {dom && !isMine && <span className="text-[10px] text-brand-700 font-mono">{dom}</span>}
          </div>
          <span className="text-[10px] text-ink-500 flex-shrink-0">{timeAgo(offer.created_at)}</span>
        </div>
        <p className="text-[11px] text-ink-500 mt-0.5 line-clamp-1">{offer.message}</p>
        <div className="flex gap-1 mt-1">
          {isImmediate ? (
            <span className="inline-flex items-center gap-1 bg-success-50 text-success-700 text-[9px] px-1.5 py-0.5 rounded font-medium">
              <Zap size={8} /> Inmediata
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-warn-50 text-warn-700 text-[9px] px-1.5 py-0.5 rounded font-medium">
              <Plane size={8} /> Importación
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// Solicitud agrupada con sus propuestas
function RequestGroup({ chat, isExpanded, onToggle, activeId, onSelectOffer }) {
  const { session } = useAuth()
  const toast = useToast()
  const [offers, setOffers] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (isExpanded && !loaded) {
      getOffersForRequest(chat.id)
        .then(setOffers)
        .catch(e => toast(e.message, 'error'))
        .finally(() => setLoaded(true))
    }
  }, [isExpanded, loaded, chat.id, toast])

  const offerCount = chat.offers?.[0]?.count || 0
  // Calcular avatares para el stack (preview)
  const previewProfiles = offers.length > 0
    ? offers.slice(0, 3).map(o => ({ id: o.profiles?.id || o.id, name: publicName(o.profiles) }))
    : Array(Math.min(offerCount, 3)).fill(null).map((_, i) => ({ id: chat.id + '_p' + i, name: '?' }))

  // Si la solicitud es mía, soy yo el comprador y quiero ver las propuestas
  // Si es de otro, soy yo el vendedor y solo aparece mi propuesta
  const isMine = chat._role === 'buyer'

  // Header info
  const immediateCount = offers.filter(o => (o.availability || 'immediate') === 'immediate').length
  const importCount = offers.length - immediateCount

  return (
    <div className="bg-white border border-ink-300 rounded-2xl overflow-hidden mb-2">
      <button onClick={onToggle}
        className="w-full text-left p-3 flex items-center gap-2.5 hover:bg-slate-50">
        {isExpanded
          ? <ChevronDown size={14} className="text-ink-500 flex-shrink-0" />
          : <ChevronRight size={14} className="text-ink-500 flex-shrink-0" />
        }

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-ink-900 truncate">{chat.title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11px] text-ink-500">
              {offerCount} {offerCount === 1 ? 'propuesta' : 'propuestas'} · {timeAgo(chat.created_at)}
            </span>
            {loaded && immediateCount > 0 && (
              <span className="bg-success-50 text-success-700 text-[10px] px-1.5 py-0.5 rounded font-medium">
                {immediateCount} inmediata
              </span>
            )}
            {loaded && importCount > 0 && (
              <span className="bg-warn-50 text-warn-700 text-[10px] px-1.5 py-0.5 rounded font-medium">
                {importCount} importación
              </span>
            )}
            {!isMine && (
              <span className="bg-brand-500/10 text-brand-700 text-[10px] px-1.5 py-0.5 rounded font-medium">
                Cotizaste
              </span>
            )}
          </div>
        </div>

        {/* Stack de avatares */}
        {previewProfiles.length > 0 && (
          <div className="flex flex-shrink-0">
            {previewProfiles.map((p, i) => (
              <div key={i} style={{ marginLeft: i === 0 ? 0 : -8 }}>
                <UserAvatar seed={p.id} size={26} borderColor="#ffffff" />
              </div>
            ))}
          </div>
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-ink-300 bg-ink-100/40">
          {!loaded ? (
            <p className="text-center text-xs text-ink-500 py-3">Cargando...</p>
          ) : offers.length === 0 ? (
            <p className="text-center text-xs text-ink-500 py-4">Aún no hay propuestas.</p>
          ) : (
            offers.filter(o => o.message).map(offer => (
              <OfferRow key={offer.id}
                offer={offer}
                isActive={activeId === offer.id}
                isMine={offer.seller_id === session?.user?.id}
                onSelect={() => onSelectOffer(chat, offer)} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function ChatList({ chats, activeId, onSelect }) {
  // Todas colapsadas por defecto
  const [expanded, setExpanded] = useState({})

  if (chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-xs text-ink-500">Sin conversaciones aún.</p>
      </div>
    )
  }

  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }))

  return (
    <div className="p-3">
      {chats.map(chat => (
        <RequestGroup key={chat.id}
          chat={chat}
          isExpanded={!!expanded[chat.id]}
          onToggle={() => toggle(chat.id)}
          activeId={activeId}
          onSelectOffer={(c, o) => onSelect({ ...c, _selectedOfferId: o.id })} />
      ))}
    </div>
  )
}
