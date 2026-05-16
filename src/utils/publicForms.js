export const PUBLIC_FORM_LOG_STORAGE_KEY = 'worldnews-public-form-log'
const MAX_ENTRIES = 150
export const PUBLIC_FORM_LOG_UPDATED_EVENT = 'worldnews-form-log-updated'

function notifyFormLogUpdated() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(PUBLIC_FORM_LOG_UPDATED_EVENT))
}

/**
 * Demo persistence for public-facing forms (localStorage).
 * Read entries in Admin → Form Inbox.
 */
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

export function clearPublicFormLog() {
  try {
    localStorage.removeItem(PUBLIC_FORM_LOG_STORAGE_KEY)
    notifyFormLogUpdated()
  } catch {
    // ignore
  }
}

export function removePublicFormEntry(id) {
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

export function logPublicFormSubmission(type, payload) {
  try {
    const raw = localStorage.getItem(PUBLIC_FORM_LOG_STORAGE_KEY)
    const prev = raw ? JSON.parse(raw) : []
    const entry = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      type,
      payload,
      at: new Date().toISOString(),
    }
    const next = [entry, ...(Array.isArray(prev) ? prev : [])].slice(0, MAX_ENTRIES)
    localStorage.setItem(PUBLIC_FORM_LOG_STORAGE_KEY, JSON.stringify(next))
    notifyFormLogUpdated()
    return entry
  } catch {
    return null
  }
}
