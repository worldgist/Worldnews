import { supabase } from '../lib/supabaseClient'

export const PUBLIC_FORM_LOG_STORAGE_KEY = 'worldnews-public-form-log'
const MAX_LOCAL_ENTRIES = 150
export const PUBLIC_FORM_LOG_UPDATED_EVENT = 'worldnews-form-log-updated'

function notifyFormLogUpdated() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(PUBLIC_FORM_LOG_UPDATED_EVENT))
}

function mapServerRow(row) {
  return {
    id: row.id,
    type: row.form_type,
    payload: row.payload,
    at: row.created_at,
  }
}

function logLocal(type, payload) {
  try {
    const raw = localStorage.getItem(PUBLIC_FORM_LOG_STORAGE_KEY)
    const prev = raw ? JSON.parse(raw) : []
    const entry = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      type,
      payload,
      at: new Date().toISOString(),
    }
    const next = [entry, ...(Array.isArray(prev) ? prev : [])].slice(0, MAX_LOCAL_ENTRIES)
    localStorage.setItem(PUBLIC_FORM_LOG_STORAGE_KEY, JSON.stringify(next))
    notifyFormLogUpdated()
    return entry
  } catch {
    return null
  }
}

/**
 * @param {'contact' | 'advertise' | 'submit-news'} type
 * @param {Record<string, unknown>} payload
 * @returns {Promise<{ id: string, type: string, payload: Record<string, unknown>, at: string } | null>}
 */
export async function logPublicFormSubmission(type, payload) {
  if (supabase) {
    const res = await supabase
      .from('public_form_submissions')
      .insert({ form_type: type, payload })
      .select('id, form_type, payload, created_at')
      .single()
    if (!res.error && res.data) {
      const entry = mapServerRow(res.data)
      notifyFormLogUpdated()
      return entry
    }
    console.warn('Supabase form insert failed, using local fallback:', res.error?.message)
  }
  return logLocal(type, payload)
}

export async function loadPublicFormLogMerged() {
  if (supabase) {
    const res = await supabase
      .from('public_form_submissions')
      .select('id, form_type, payload, created_at')
      .order('created_at', { ascending: false })
      .limit(200)
    if (!res.error && res.data) {
      return res.data.map(mapServerRow)
    }
    console.warn('Supabase form list failed, using local cache:', res.error?.message)
  }
  try {
    const raw = localStorage.getItem(PUBLIC_FORM_LOG_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function loadPublicFormLog() {
  try {
    const raw = localStorage.getItem(PUBLIC_FORM_LOG_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function clearPublicFormLog() {
  if (supabase) {
    const res = await supabase.from('public_form_submissions').delete().gte('created_at', '1970-01-01T00:00:00.000Z')
    if (!res.error) {
      notifyFormLogUpdated()
    }
  }
  try {
    localStorage.removeItem(PUBLIC_FORM_LOG_STORAGE_KEY)
    notifyFormLogUpdated()
  } catch {
    // ignore
  }
}

export async function removePublicFormEntry(id) {
  if (supabase) {
    const res = await supabase.from('public_form_submissions').delete().eq('id', id)
    if (!res.error) {
      notifyFormLogUpdated()
      return true
    }
  }
  try {
    const entries = loadPublicFormLog()
    const next = entries.filter((e) => e.id !== id)
    localStorage.setItem(PUBLIC_FORM_LOG_STORAGE_KEY, JSON.stringify(next))
    notifyFormLogUpdated()
    return true
  } catch {
    return false
  }
}
