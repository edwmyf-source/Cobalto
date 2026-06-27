import { supabase } from './supabase'

export const followUser = async (followerId, followingId) => {
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, following_id: followingId })
  if (error) throw error
}

export const unfollowUser = async (followerId, followingId) => {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
  if (error) throw error
}

export const checkIsFollowing = async (followerId, followingId) => {
  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle()
  if (error) throw error
  return !!data
}

export const getFollowCounts = async (userId) => {
  const [frs, fng] = await Promise.all([
    supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', userId),
  ])
  return {
    followers: frs.count ?? 0,
    following: fng.count ?? 0,
  }
}

// Candidatos para mencionar (@): unión de seguidores + seguidos, con su perfil público.
// Se cachea por usuario durante la sesión para no consultar en cada "@".
const _mentionCache = new Map()

export const getMentionCandidates = async (userId) => {
  if (!userId) return []
  if (_mentionCache.has(userId)) return _mentionCache.get(userId)

  const [followingRes, followersRes] = await Promise.all([
    // a quién sigo yo → traigo el perfil del seguido
    supabase.from('follows')
      .select('following_id, following:profiles!follows_following_id_fkey(id, full_name, identity_mode, identity_number, avatar_url)')
      .eq('follower_id', userId),
    // quién me sigue → traigo el perfil del seguidor
    supabase.from('follows')
      .select('follower_id, follower:profiles!follows_follower_id_fkey(id, full_name, identity_mode, identity_number, avatar_url)')
      .eq('following_id', userId),
  ])

  const map = new Map()
  for (const row of (followingRes.data || [])) {
    const p = row.following
    if (p?.id) map.set(p.id, p)
  }
  for (const row of (followersRes.data || [])) {
    const p = row.follower
    if (p?.id) map.set(p.id, p)
  }
  const list = Array.from(map.values())
  _mentionCache.set(userId, list)
  return list
}
