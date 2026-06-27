import { supabase } from './supabase'

export const createBuyerRequest = async (payload) => {
  const { buyer_id, title, description, category_id, category_name, main_type, segment, department } = payload
  const safe = { buyer_id, title, description, category_id, category_name, main_type, segment, department }

  const { data, error } = await supabase
    .from('buyer_requests')
    .insert(safe)
    .select()
    .single()
  if (error) throw error
  return data
}

export const distributeRequest = async (requestId) => {
  const { data, error } = await supabase.rpc('distribute_request', { req_id: requestId })
  if (error) return null
  return data
}

export const listPublicRequests = async ({ cursor, limit = 20, filters = {} } = {}) => {
  let q = supabase
    .from('buyer_requests')
    .select('*, profiles!buyer_requests_buyer_id_fkey(id, full_name, identity_mode, identity_number, city, email_domain), categories(name, main_type), offers(count)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (cursor) q = q.lt('created_at', cursor)
  if (filters.type) q = q.eq('categories.main_type', filters.type)
  if (filters.category_id) q = q.eq('categories.name', filters.category_id)
  if (filters.segment) q = q.eq('segment', filters.segment)
  if (filters.search) {
    const safe = filters.search.replace(/[%_\\]/g, '\\$&')
    q = q.ilike('title', `%${safe}%`)
  }

  const { data, error } = await q
  if (error) throw error
  return data || []
}
