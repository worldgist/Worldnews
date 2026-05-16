import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import {
  PUBLIC_FORM_LOG_UPDATED_EVENT,
  clearPublicFormLog,
  loadPublicFormLogMerged,
  removePublicFormEntry,
} from '../../utils/publicForms'

const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'contact', label: 'Contact' },
  { value: 'advertise', label: 'Advertise' },
  { value: 'submit-news', label: 'Submit news' },
]

function entrySummary(entry) {
  const p = entry.payload || {}
  switch (entry.type) {
    case 'contact':
      return [p.name, p.topic].filter(Boolean).join(' · ') || 'Contact'
    case 'advertise':
      return p.org || 'Advertising brief'
    case 'submit-news':
      return p.headline || 'News tip'
    default:
      return entry.type || 'Submission'
  }
}

function typeBadgeClass(type) {
  if (type === 'contact') return 'admin-form-inbox-badge admin-form-inbox-badge--contact'
  if (type === 'advertise') return 'admin-form-inbox-badge admin-form-inbox-badge--ads'
  if (type === 'submit-news') return 'admin-form-inbox-badge admin-form-inbox-badge--tips'
  return 'admin-form-inbox-badge'
}

export default function AdminFormInboxPage() {
  const [entries, setEntries] = useState([])
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(() => new Set())
  const [message, setMessage] = useState('')
  const [copyId, setCopyId] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const list = await loadPublicFormLogMerged()
      setEntries(list)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const onStorage = (e) => {
      if (e.key === 'worldnews-public-form-log' || e.key === null) refresh()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener(PUBLIC_FORM_LOG_UPDATED_EVENT, refresh)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(PUBLIC_FORM_LOG_UPDATED_EVENT, refresh)
    }
  }, [refresh])

  const filtered = useMemo(() => {
    if (filter === 'all') return entries
    return entries.filter((e) => e.type === filter)
  }, [entries, filter])

  const toggleExpanded = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCopy = async (entry) => {
    const text = JSON.stringify(entry, null, 2)
    try {
      await navigator.clipboard.writeText(text)
      setCopyId(entry.id)
      setMessage('Copied entry JSON to clipboard.')
      window.setTimeout(() => setCopyId(null), 2000)
    } catch {
      setMessage('Could not copy — browser blocked clipboard access.')
    }
  }

  const handleDelete = async (id) => {
    await removePublicFormEntry(id)
    setMessage('Entry removed.')
    await refresh()
  }

  const handleClearAll = async () => {
    if (!window.confirm('Remove all form submissions? (Supabase + local cache)')) return
    await clearPublicFormLog()
    setExpanded(new Set())
    setMessage('Inbox cleared.')
    await refresh()
  }

  return (
    <section className="admin-form-inbox admin-panel-card" aria-label="Public form submissions">
      <header className="admin-form-inbox-header">
        <div>
          <h2>Form inbox</h2>
          <p className="admin-form-inbox-lead">
            {supabase ? (
              <>
                Submissions from Contact, Advertise, and Submit news are stored in Supabase. You must sign in with{' '}
                <strong>Supabase Auth</strong> (same admin email/password as the dashboard login) to load and delete server
                rows. Without a session, only a local browser cache is shown.
              </>
            ) : (
              <>
                Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to use cloud storage. Until then,
                entries are kept only in this browser.
              </>
            )}
          </p>
        </div>
        <div className="admin-form-inbox-toolbar">
          <label className="admin-form-inbox-select-label">
            <span className="sr-only">Filter by form type</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="admin-form-inbox-select">
              {TYPE_FILTERS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="admin-form-inbox-danger" onClick={handleClearAll} disabled={entries.length === 0}>
            Clear all
          </button>
        </div>
      </header>

      {message ? (
        <p className="admin-form-inbox-message" role="status">
          {message}
        </p>
      ) : null}

      {loading ? (
        <p className="admin-form-inbox-empty">Loading inbox…</p>
      ) : filtered.length === 0 ? (
        <div className="admin-form-inbox-empty">
          <p>{entries.length === 0 ? 'No submissions yet.' : 'No entries match this filter.'}</p>
          <p className="admin-form-inbox-empty-hint">
            {supabase ? 'Submit a public form, then refresh — ensure you are logged in with Supabase to see cloud data.' : null}
          </p>
        </div>
      ) : (
        <ul className="admin-form-inbox-list">
          {filtered.map((entry) => {
            const isOpen = expanded.has(entry.id)
            const rows = Object.entries(entry.payload || {})
            const atLabel = entry.at
              ? new Date(entry.at).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : '—'

            return (
              <li key={entry.id} className="admin-form-inbox-item">
                <div className="admin-form-inbox-item-top">
                  <span className={typeBadgeClass(entry.type)}>{entry.type}</span>
                  <time className="admin-form-inbox-time" dateTime={entry.at}>
                    {atLabel}
                  </time>
                </div>
                <p className="admin-form-inbox-summary">{entrySummary(entry)}</p>
                <div className="admin-form-inbox-actions">
                  <button type="button" className="admin-form-inbox-btn" onClick={() => toggleExpanded(entry.id)}>
                    {isOpen ? 'Hide details' : 'Show details'}
                  </button>
                  <button type="button" className="admin-form-inbox-btn" onClick={() => handleCopy(entry)}>
                    {copyId === entry.id ? 'Copied' : 'Copy JSON'}
                  </button>
                  <button type="button" className="admin-form-inbox-btn admin-form-inbox-btn--danger" onClick={() => handleDelete(entry.id)}>
                    Delete
                  </button>
                </div>
                {isOpen ? (
                  <div className="admin-form-inbox-details">
                    <dl>
                      {rows.map(([key, value]) => (
                        <div key={key} className="admin-form-inbox-row">
                          <dt>{key}</dt>
                          <dd>
                            {Array.isArray(value) ? value.join(', ') : typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <pre className="admin-form-inbox-raw">{JSON.stringify(entry, null, 2)}</pre>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
