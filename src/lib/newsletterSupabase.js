import { supabase } from './supabaseClient'

export const NEWSLETTER_UPDATED_EVENT = 'worldnews-newsletter-updated'

function notifyUpdated() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(NEWSLETTER_UPDATED_EVENT))
}

function mapRow(row) {
  return {
    id: row.id,
    email: row.email,
    source: row.source || 'homepage',
    at: row.created_at,
  }
}

/**
 * Save a homepage newsletter signup. Returns { ok, duplicate, error }.
 */
export async function subscribeNewsletter(email, source = 'homepage') {
  if (!supabase) return { ok: false, error: 'Supabase is not configured' }

  const normalized = email.trim().toLowerCase()
  if (!normalized) return { ok: false, error: 'Email is required' }

  const { error } = await supabase.from('newsletter_subscribers').insert({
    email: normalized,
    source,
  })

  if (!error) {
    notifyUpdated()
    return { ok: true }
  }

  if (error.code === '23505') {
    return { ok: true, duplicate: true }
  }

  return { ok: false, error: error.message }
}

export async function loadNewsletterSubscribers() {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, source, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    console.warn('newsletter_subscribers list:', error.message)
    return []
  }

  return (data || []).map(mapRow)
}

export async function removeNewsletterSubscriber(id) {
  if (!supabase || !id) return false
  const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id)
  if (error) {
    console.warn('newsletter_subscribers delete:', error.message)
    return false
  }
  notifyUpdated()
  return true
}

export async function clearNewsletterSubscribers() {
  if (!supabase) return false
  const { error } = await supabase
    .from('newsletter_subscribers')
    .delete()
    .gte('created_at', '1970-01-01T00:00:00.000Z')
  if (error) {
    console.warn('newsletter_subscribers clear:', error.message)
    return false
  }
  notifyUpdated()
  return true
}
