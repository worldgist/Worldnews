import { supabase } from './supabaseClient'
import {
  DEFAULT_PROFILE,
  PROFILE_STORAGE_KEY,
} from '../admin/storage'

export function mapProfileRow(row) {
  if (!row) return null
  return {
    fullName: row.full_name?.trim() || DEFAULT_PROFILE.fullName,
    email: row.email?.trim() || DEFAULT_PROFILE.email,
    role: row.role?.trim() || DEFAULT_PROFILE.role,
    bio: row.bio?.trim() || DEFAULT_PROFILE.bio,
    avatarUrl: row.avatar_url?.trim() || '',
  }
}

export function profileToRow(profile, userId) {
  return {
    user_id: userId,
    full_name: profile.fullName?.trim() || DEFAULT_PROFILE.fullName,
    email: profile.email?.trim() || DEFAULT_PROFILE.email,
    role: profile.role?.trim() || DEFAULT_PROFILE.role,
    bio: profile.bio?.trim() || '',
    avatar_url: profile.avatarUrl?.trim() || null,
    updated_at: new Date().toISOString(),
  }
}

function isPlaceholderProfile(profile) {
  if (!profile) return true
  const name = profile.fullName?.trim()
  const email = profile.email?.trim()
  return (
    !name
    || name === 'Admin User'
    || email === 'admin@worldgistnews.com'
    || profile.bio === 'Managing editorial quality and publication workflow for World Gist News.'
  )
}

function cacheProfile(profile) {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
  window.dispatchEvent(new CustomEvent('worldnews-admin-storage'))
}

/** Fetch the signed-in admin's profile from admin_user_profiles. */
export async function fetchAdminProfileFromDatabase() {
  if (!supabase) return { profile: null, fromDatabase: false }

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user?.id) return { profile: null, fromDatabase: false }

  const { data, error } = await supabase
    .from('admin_user_profiles')
    .select('user_id, full_name, email, role, bio, avatar_url, updated_at')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (error) {
    console.warn('admin_user_profiles fetch:', error.message)
    return { profile: null, fromDatabase: false }
  }

  if (!data) {
    return { profile: null, fromDatabase: false, userId: session.user.id }
  }

  let profile = mapProfileRow(data)

  if (isPlaceholderProfile(profile)) {
    profile = {
      ...DEFAULT_PROFILE,
      avatarUrl: profile.avatarUrl || '',
    }
    await upsertAdminProfileToDatabase(profile)
  } else {
    cacheProfile(profile)
  }

  return { profile, fromDatabase: true, userId: session.user.id }
}

/** Upsert profile for the signed-in admin. */
export async function upsertAdminProfileToDatabase(profile) {
  if (!supabase) return { ok: false, error: 'Supabase not configured' }

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user?.id) return { ok: false, error: 'Not signed in' }

  const row = profileToRow(profile, session.user.id)
  const { error } = await supabase.from('admin_user_profiles').upsert(row, {
    onConflict: 'user_id',
  })

  if (error) {
    console.warn('admin_user_profiles upsert:', error.message)
    return { ok: false, error: error.message }
  }

  cacheProfile(profile)
  return { ok: true }
}
