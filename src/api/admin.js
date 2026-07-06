import { supabase } from './supabase'

export const adminGetUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, city, created_at, banned, profiles_private(phone, email)')
    .order('created_at', { ascending: false })
  if (error) throw error
  // Aplanar el contacto privado para la tabla del admin
  return (data || []).map(u => ({
    ...u,
    email: u.profiles_private?.email || null,
    phone: u.profiles_private?.phone || null,
  }))
}

export const adminGetPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles!posts_author_id_fkey(full_name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export const adminGetMessages = async () => {
  const { data, error } = await supabase
    .from('messages')
    .select('*, profiles!messages_sender_id_fkey(full_name)')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) throw error
  return data || []
}

// ─── BANNERS "DE INTERÉS" ──────────────────────────────────────────────────

export const adminGetBanners = async () => {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('position', { ascending: true })
  if (error) throw error
  return data || []
}

export const adminUpsertBanner = async ({ id, image_url, position, active }) => {
  if (id) {
    const { error } = await supabase
      .from('banners')
      .update({ image_url, position, active, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('banners')
      .insert({ image_url, position, active })
    if (error) throw error
  }
}

export const adminDeleteBanner = async (id) => {
  const { error } = await supabase.from('banners').delete().eq('id', id)
  if (error) throw error
}

export const uploadBannerImage = async (file) => {
  const ext = file.name.split('.').pop().toLowerCase()
  const path = `banners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage
    .from('post-media')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('post-media').getPublicUrl(path)
  return data.publicUrl
}

export const uploadWidgetImage = async (file) => {
  const ext = file.name.split('.').pop().toLowerCase()
  const path = `widgets/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage
    .from('post-media')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('post-media').getPublicUrl(path)
  return data.publicUrl
}

export const getActiveBanners = async () => {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('active', true)
    .order('position', { ascending: true })
    .limit(5)
  if (error) return []
  return data || []
}
