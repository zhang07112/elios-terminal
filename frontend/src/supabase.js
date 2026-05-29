import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ------------------- Conversations -------------------
export async function fetchConversations(limit = 100) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(limit)
  if (error) throw error
  return data
}

export function subscribeToConversations(callback) {
  return supabase
    .channel('public:conversations')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'conversations' }, 
      payload => callback(payload.new)
    )
    .subscribe()
}

// ------------------- Memory Cards -------------------
export async function fetchMemoryCards(category = null) {
  let query = supabase.from('memory_cards').select('*').order('created_at', { ascending: false })
  if (category) {
    query = query.eq('category', category)
  }
  const { data, error } = await query
  if (error) throw error
  return data
}

// ------------------- Events -------------------
export async function fetchEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date')
  if (error) throw error
  return data
}

export function subscribeToEvents(callback) {
  return supabase
    .channel('public:events')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'events' }, 
      payload => callback(payload)
    )
    .subscribe()
}

// ------------------- Profile & Avatar -------------------
export async function fetchProfile() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1)
  if (error) throw error
  return data?.[0] || null
}

export async function uploadAvatar(file) {
  const fileExt = file.name.split('.').pop()
  const fileName = `avatar_${Date.now()}.${fileExt}`
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file)
  if (uploadError) throw uploadError
  
  const { data } = await supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)
  
  return data.publicUrl
}

export async function updateProfile(updates) {
  const profile = await fetchProfile()
  if (profile) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id)
      .select()
    if (error) throw error
    return data[0]
  } else {
    const { data, error } = await supabase
      .from('profiles')
      .insert(updates)
      .select()
    if (error) throw error
    return data[0]
  }
}
