import { supabase } from './supabase'
import { compressImage } from '../lib/imageCompress'

const PROFILE_FIELDS = 'id, full_name, identity_mode, identity_number, city, email_domain'
const MAX_FILE_MB = 15

// Get all conversations for a user
export const getConversations = async (userId) => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      user1:profiles!conversations_user1_id_fkey(${PROFILE_FIELDS}),
      user2:profiles!conversations_user2_id_fkey(${PROFILE_FIELDS}),
      posts!conversations_post_id_fkey(id, title, content, category)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data || []
}

// Get or create conversation between two users, optionally tied to a post
export const getOrCreateConversation = async (user1Id, user2Id, postId = null) => {
  // Check if exists
  let query = supabase
    .from('conversations')
    .select('*')
    .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
  query = postId ? query.eq('post_id', postId) : query.is('post_id', null)
  const { data: existing } = await query.maybeSingle()

  if (existing) return { ...existing, isNew: false }

  const { data, error } = await supabase
    .from('conversations')
    .insert({ user1_id: user1Id, user2_id: user2Id, post_id: postId })
    .select()
    .single()
  if (error) throw error
  return { ...data, isNew: true }
}

// Get messages in a conversation
export const getMessages = async (conversationId) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`*, profiles!messages_sender_id_fkey(${PROFILE_FIELDS})`)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

// Sube un archivo adjunto al chat (imagen comprimida, PDF u otro documento tal
// cual). Va al bucket PRIVADO `chat-media`: a diferencia de las fotos de
// publicaciones, un documento enviado por chat no debe quedar accesible para
// cualquiera que tenga la URL. Se guarda la ruta, no una URL pública, y al
// mostrarlo se genera una URL firmada de corta duración.
export const uploadMessageAttachment = async (rawFile, senderId) => {
  const file = await compressImage(rawFile)
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    throw new Error(`El archivo "${file.name}" supera el límite de ${MAX_FILE_MB} MB.`)
  }
  const ext = file.name.split('.').pop().toLowerCase()
  const path = `${senderId}/msg-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('chat-media')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error

  return { url: path, type: file.type, name: file.name }
}

// Genera una URL temporal (1 hora) para ver o descargar un adjunto. Solo
// funciona si el usuario tiene permiso de lectura sobre ese objeto.
export const getAttachmentUrl = async (path) => {
  if (!path) return null
  // Compatibilidad: los adjuntos subidos antes de este cambio guardaron una
  // URL pública completa; esos se devuelven tal cual.
  if (path.startsWith('http')) return path
  const { data, error } = await supabase.storage
    .from('chat-media')
    .createSignedUrl(path, 3600)
  if (error) throw error
  return data.signedUrl
}

// Send message
export const sendMessage = async ({ conversation_id, sender_id, content, media_url, media_type, media_name }) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id, sender_id, content: content || null, media_url, media_type, media_name })
    .select()
    .single()
  if (error) throw error

  // Update conversation timestamp
  const preview = content || (media_url ? '📎 Adjunto' : '')
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString(), last_message: preview })
    .eq('id', conversation_id)

  return data
}
