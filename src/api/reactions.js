import { supabase } from './supabase'

export const toggleReaction = async (postId, userId, type) => {
  // Check if reaction exists
  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .eq('type', type)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from('reactions').delete().eq('id', existing.id)
    if (error) throw error
    return { action: 'removed' }
  } else {
    const { error } = await supabase.from('reactions').insert({ post_id: postId, user_id: userId, type })
    if (error) throw error
    return { action: 'added' }
  }
}

export const getReactionsForPost = async (postId) => {
  const { data, error } = await supabase
    .from('reactions')
    .select('type, user_id, profiles!reactions_user_id_fkey(full_name, identity_mode, identity_number)')
    .eq('post_id', postId)
  if (error) throw error
  return data || []
}

export const getReactionCounts = async (postId) => {
  const { data, error } = await supabase
    .from('reactions')
    .select('type')
    .eq('post_id', postId)
  if (error) throw error
  const counts = {}
  ;(data || []).forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1 })
  return counts
}
