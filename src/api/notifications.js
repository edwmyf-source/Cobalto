import { supabase } from './supabase'

export const getNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*, from_profile:profiles!notifications_from_user_id_fkey(id, full_name, identity_mode, identity_number, avatar_url), post:posts(content)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data || []).map(n => ({
    ...n,
    type: n.title || 'reaction',
    content: n.body || n.content || '',
    post_content: n.post?.content || null,
  }))
}

export const getUnreadCount = async (userId) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)
  if (error) return 0
  return count || 0
}

export const markAsRead = async (notificationId) => {
  await supabase.from('notifications').update({ read: true }).eq('id', notificationId)
}

export const markAllRead = async (userId) => {
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
}

export const createNotification = async ({ user_id, from_user_id, type, content, post_id }) => {
  if (user_id === from_user_id) return
  const { error } = await supabase.from('notifications').insert({
    user_id, from_user_id, post_id,
    title: type || 'reaction',
    body: content || '',
    content: content || '',
  })
  if (error) console.warn('Notification error:', error)
}
