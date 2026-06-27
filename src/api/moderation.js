import { supabase } from './supabase'

// ─── REPORTES ────────────────────────────────────────────────────────────────
export const reportPost = async ({ post_id, reporter_id, reason }) => {
  const { error } = await supabase
    .from('reports')
    .insert({ post_id, reporter_id, reason, status: 'pending' })
  if (error) throw error
}

// ─── BLOQUEOS ────────────────────────────────────────────────────────────────
export const blockUser = async (blocker_id, blocked_id) => {
  const { error } = await supabase
    .from('user_blocks')
    .insert({ blocker_id, blocked_id })
    .select().maybeSingle()
  if (error && !error.message?.includes('duplicate')) throw error
}

export const unblockUser = async (blocker_id, blocked_id) => {
  await supabase.from('user_blocks')
    .delete()
    .eq('blocker_id', blocker_id)
    .eq('blocked_id', blocked_id)
}

export const getBlockedUsers = async (user_id) => {
  const { data } = await supabase
    .from('user_blocks')
    .select('blocked_id')
    .eq('blocker_id', user_id)
  return (data || []).map(r => r.blocked_id)
}

// ─── ADMIN: Gestión de reportes ───────────────────────────────────────────────
export const adminGetReports = async () => {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      posts!reports_post_id_fkey(id, title, author_id),
      reporter:profiles!reports_reporter_id_fkey(full_name, identity_number, identity_mode)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export const adminResolveReport = async (reportId, action) => {
  // action: 'dismissed' | 'post_removed' | 'user_banned'
  await supabase.from('reports').update({ status: action, resolved_at: new Date().toISOString() }).eq('id', reportId)
}

export const adminRemovePost = async (postId) => {
  await supabase.from('posts').delete().eq('id', postId)
}

export const adminBanUser = async (userId) => {
  await supabase.from('profiles').update({ banned: true }).eq('id', userId)
}
