import { useState, useEffect, useRef, useCallback } from 'react'
import { ShieldCheck, Zap, Plane } from 'lucide-react'
import { getOffersForRequest, submitOffer } from '../../api/offers'
import { useAuth } from '../../contexts/AuthContext'
import { useRealtime } from '../../hooks/useRealtime'
import { useToast } from '../shared/Toast'
import { safeErrorMessage } from '../../lib/errors'
import { publicName } from '../../lib/helpers'
import Spinner from '../shared/Spinner'
import UserAvatar from '../shared/UserAvatar'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'

export default function ChatThread({ request, isBuyer }) {
  const { session } = useAuth()
  const toast = useToast()
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  const reqProfile = request.profiles || {}
  const reqName = publicName(reqProfile)
  const reqDom = reqProfile.email_domain || null

  const fetchOffers = useCallback(async () => {
    try {
      const data = await getOffersForRequest(request.id)
      setOffers(data)
    } catch (e) { toast(safeErrorMessage(e), 'error') }
  }, [request.id, toast])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setOffers([])
    fetchOffers().finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [fetchOffers])

  useRealtime('offers', 'INSERT', useCallback((payload) => {
    if (payload.new?.request_id === request.id) fetchOffers()
  }, [request.id, fetchOffers]))

  useEffect(() => {
    if (!loading) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [offers, loading])

  const send = async (text, availability = 'immediate') => {
    setSending(true)
    try {
      await submitOffer({
        request_id: request.id,
        seller_id: session.user.id,
        message: text,
        availability,
      })
      await fetchOffers()
      toast('Propuesta enviada', 'success')
    } catch (e) { toast(safeErrorMessage(e), 'error') }
    setSending(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header del chat con info del usuario */}
      <div className="bg-white border-b border-ink-300 px-4 py-3 flex items-center gap-3">
        <UserAvatar seed={reqProfile.id || reqName} size={36} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-ink-900 truncate">{reqName}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-ink-500">
            <span>{reqProfile.city || 'Colombia'}</span>
            {reqDom && (
              <>
                <span>·</span>
                <span className="text-brand-700 font-mono font-medium">{reqDom}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Banner de privacidad */}
      <div className="bg-brand-500/5 border-b border-ink-300 px-4 py-2 flex items-start gap-2">
        <ShieldCheck size={13} className="text-brand-600 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-ink-500 leading-relaxed">
          Conversación anónima · Solo conocen tu dominio. Tu nombre, teléfono y email completo permanecen ocultos.
        </p>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-ink-100">
        <MessageBubble
          profile={reqProfile}
          text={`${request.title}${request.description ? '\n\n' + request.description : ''}`}
          time={request.created_at}
          isOriginal
        />

        <div className="flex items-center gap-2.5 py-1">
          <div className="flex-1 h-px bg-ink-300" />
          <span className="text-[10px] text-ink-500 font-medium tracking-wider">PROPUESTAS</span>
          <div className="flex-1 h-px bg-ink-300" />
        </div>

        {loading ? (
          <div className="flex justify-center py-6"><Spinner size={20} className="text-brand-600" /></div>
        ) : offers.length === 0 ? (
          <p className="text-center text-xs text-ink-500 py-6">
            {isBuyer ? 'Aún no hay propuestas.' : 'Sé el primero en enviar una propuesta.'}
          </p>
        ) : (
          offers.filter(o => o.message).map(offer => (
            <MessageBubble
              key={offer.id}
              profile={offer.profiles || {}}
              text={offer.message}
              time={offer.created_at}
              isMine={offer.seller_id === session.user.id}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {!isBuyer && <ChatInput onSend={send} sending={sending} />}
    </div>
  )
}
