import { supabase } from './supabase'

const PROFILE_FIELDS = 'id, full_name, identity_mode, identity_number, city, email_domain'

export const getMyChats = async (uid) => {
  const { data: asB, error: e1 } = await supabase
    .from('buyer_requests')
    .select(`*, profiles!buyer_requests_buyer_id_fkey(${PROFILE_FIELDS}), categories(name, main_type), offers(count)`)
    .eq('buyer_id', uid)
    .order('created_at', { ascending: false })
  if (e1) throw e1

  const { data: ofrs, error: e2 } = await supabase
    .from('offers')
    .select(`request_id, buyer_requests(*, profiles!buyer_requests_buyer_id_fkey(${PROFILE_FIELDS}), categories(name, main_type))`)
    .eq('seller_id', uid)
  if (e2) throw e2

  const buyerChats = (asB || []).map(r => ({ ...r, _role: 'buyer' }))
  const sellerChats = (ofrs || [])
    .map(o => o.buyer_requests)
    .filter(Boolean)
    .filter((v, i, a) => a.findIndex(x => x.id === v.id) === i)
    .map(r => ({ ...r, _role: 'seller' }))

  return [...buyerChats, ...sellerChats].sort((a, b) =>
    new Date(b.created_at) - new Date(a.created_at)
  )
}

export const getOffersForRequest = async (requestId) => {
  const { data, error } = await supabase
    .from('offers')
    .select(`*, profiles!offers_seller_id_fkey(${PROFILE_FIELDS})`)
    .eq('request_id', requestId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []).map(o => {
    let msg = o.offer_text || ''
    let avail = o.availability || 'immediate'
    if (!msg && o.notes) {
      try {
        const parsed = JSON.parse(o.notes)
        msg = parsed.message || parsed.text || parsed.content || ''
        avail = parsed.availability || avail
      } catch { msg = o.notes }
    }
    return { ...o, message: msg, availability: avail }
  })
}

export const submitOffer = async ({ request_id, seller_id, message, availability = 'immediate' }) => {
  // Guardamos availability en el campo notes como JSON para no requerir migración
  const notesPayload = JSON.stringify({ message, availability })
  const { data, error } = await supabase
    .from('offers')
    .insert({
      request_id,
      seller_id,
      offer_text: message,
      notes: notesPayload,
    })
    .select()
    .single()
  if (error) throw error
  return data
}
