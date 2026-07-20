import { supabase } from './supabase'

const PROFILE_FIELDS = 'id, full_name, identity_mode, identity_number, email_domain, city, company_name, avatar_url'

// Lista/busca usuarios registrados (excluye al usuario actual)
export const searchUsers = async (currentUserId, query = '', limit = 30) => {
  let q = supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .neq('id', currentUserId)
    .order('full_name', { ascending: true })
    .limit(limit)

  if (query?.trim()) {
    const term = query.trim()
    q = q.or(`full_name.ilike.%${term}%,company_name.ilike.%${term}%,city.ilike.%${term}%`)
  }

  const { data, error } = await q
  if (error) throw error
  return data || []
}
