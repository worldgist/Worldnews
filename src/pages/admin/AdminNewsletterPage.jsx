import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import {
  NEWSLETTER_UPDATED_EVENT,
  clearNewsletterSubscribers,
  loadNewsletterSubscribers,
  removeNewsletterSubscriber,
} from '../../lib/newsletterSupabase'

const SOURCE_FILTERS = [
  { value: 'all', label: 'All sources' },
  { value: 'homepage', label: 'Homepage' },
]

export default function AdminNewsletterPage() {
  const [entries, setEntries] = useState([])
  const [filter, setFilter] = useState('all')
  const [message, setMessage] = useState('')
  const [copyId, setCopyId] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setEntries(await loadNewsletterSubscribers())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    window.addEventListener(NEWSLETTER_UPDATED_EVENT, refresh)
    return () => window.removeEventListener(NEWSLETTER_UPDATED_EVENT, refresh)
  }, [refresh])

  const filtered = useMemo(() => {
    if (filter === 'all') return entries
    return entries.filter((e) => e.source === filter)
  }, [entries, filter])

  const handleCopy = async (entry) => {
    try {
      await navigator.clipboard.writeText(entry.email)
      setCopyId(entry.id)
      setMessage('Email copied to clipboard.')
      window.setTimeout(() => setCopyId(null), 2000)
    } catch {
      setMessage('Could not copy — browser blocked clipboard access.')
    }
  }

  const handleDelete = async (id) => {
    const ok = await removeNewsletterSubscriber(id)
    setMessage(ok ? 'Subscriber removed.' : 'Could not delete — sign in with Supabase Auth.')
    if (ok) await refresh()
  }

  const handleClearAll = async () => {
    if (!window.confirm('Remove all newsletter subscribers?')) return
    const ok = await clearNewsletterSubscribers()
    setMessage(ok ? 'Subscriber list cleared.' : 'Could not clear — sign in with Supabase Auth.')
    if (ok) await refresh()
  }

  const exportCsv = () => {
    if (filtered.length === 0) return
    const lines = [
      'email,source,subscribed_at',
      ...filtered.map((e) => {
        const email = `"${String(e.email).replace(/"/g, '""')}"`
        const source = `"${String(e.source).replace(/"/g, '""')}"`
        const at = e.at || ''
        return `${email},${source},${at}`
      }),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setMessage('CSV download started.')
  }

  return (
    <section className="admin-form-inbox admin-panel-card" aria-label="Newsletter subscribers">
      <header className="admin-form-inbox-header">
        <div>
          <h2>Newsletter subscribers</h2>
          <p className="admin-form-inbox-lead">
            {supabase ? (
              <>
                Signups from the homepage newsletter form are stored in Supabase{' '}
                <code>newsletter_subscribers</code>. Sign in with <strong>Supabase Auth</strong> to view and manage them.
              </>
            ) : (
              <>
                Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to load subscribers from the cloud.
              </>
            )}
          </p>
        </div>
        <div className="admin-form-inbox-toolbar">
          <label className="admin-form-inbox-select-label">
            <span className="sr-only">Filter by source</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="admin-form-inbox-select">
              {SOURCE_FILTERS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="admin-form-inbox-btn" onClick={exportCsv} disabled={filtered.length === 0}>
            Export CSV
          </button>
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

      <p className="admin-form-inbox-message" style={{ marginTop: 0 }}>
        <strong>{entries.length}</strong> total subscriber{entries.length === 1 ? '' : 's'}
        {filter !== 'all' ? ` · ${filtered.length} shown` : ''}
      </p>

      {loading ? (
        <p className="admin-form-inbox-empty">Loading subscribers…</p>
      ) : filtered.length === 0 ? (
        <div className="admin-form-inbox-empty">
          <p>{entries.length === 0 ? 'No subscribers yet.' : 'No entries match this filter.'}</p>
          <p className="admin-form-inbox-empty-hint">
            {supabase ? 'Use the homepage newsletter form while signed out, then refresh here.' : null}
          </p>
        </div>
      ) : (
        <ul className="admin-form-inbox-list">
          {filtered.map((entry) => {
            const atLabel = entry.at
              ? new Date(entry.at).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : '—'

            return (
              <li key={entry.id} className="admin-form-inbox-item">
                <div className="admin-form-inbox-item-top">
                  <span className="admin-form-inbox-badge admin-form-inbox-badge--tips">{entry.source}</span>
                  <time className="admin-form-inbox-time" dateTime={entry.at}>
                    {atLabel}
                  </time>
                </div>
                <p className="admin-form-inbox-summary">
                  <a href={`mailto:${entry.email}`}>{entry.email}</a>
                </p>
                <div className="admin-form-inbox-actions">
                  <button type="button" className="admin-form-inbox-btn" onClick={() => handleCopy(entry)}>
                    {copyId === entry.id ? 'Copied' : 'Copy email'}
                  </button>
                  <button
                    type="button"
                    className="admin-form-inbox-btn admin-form-inbox-btn--danger"
                    onClick={() => handleDelete(entry.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
