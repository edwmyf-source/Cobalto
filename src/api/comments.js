import { supabase } from './supabase'

export const createComment = async ({ post_id, user_id, content }) => {
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id, user_id, content })
    .select('*, profiles!comments_user_id_fkey(id, full_name, identity_mode, identity_number, email_domain)')
    .single()
  if (error) throw error
  return data
}

export const getComments = async (postId) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*, profiles!comments_user_id_fkey(id, full_name, identity_mode, identity_number, email_domain)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}
