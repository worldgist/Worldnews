import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadSettings, saveSettings } from '../../admin/storage'
import { CMS_SYNC_EVENT } from '../../lib/cmsEvents'
import {
  buildDefaultSocialLinks,
  fetchSocialMediaLinksFromDatabase,
  socialLinksToSettingsPatch,
  upsertSocialMediaLinksToDatabase,
} from '../../lib/socialMediaApi'
import { supabase } from '../../lib/supabaseClient'

function linksFromSettings(settings) {
  return buildDefaultSocialLinks().map((link) => ({
    ...link,
    url: settings[link.settingsKey]?.trim() || link.defaultUrl,
    isEnabled: true,
  }))
}

export default function AdminSocialMediaPage() {
  const [links, setLinks] = useState(() => linksFromSettings(loadSettings()))
  const [loading, setLoading] = useState(Boolean(supabase))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [saveError, setSaveError] = useState('')

  const refresh = useCallback(() => {
    if (!supabase) {
      setLinks(linksFromSettings(loadSettings()))
      setLoading(false)
      return
    }

    void fetchSocialMediaLinksFromDatabase().then(({ links: remote, fromDatabase }) => {
      if (fromDatabase && remote.length) {
        setLinks(remote)
      } else {
        setLinks(linksFromSettings(loadSettings()))
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    refresh()
    const onSync = () => refresh()
    window.addEventListener(CMS_SYNC_EVENT, onSync)
    window.addEventListener('worldnews-admin-storage', onSync)
    return () => {
      window.removeEventListener(CMS_SYNC_EVENT, onSync)
      window.removeEventListener('worldnews-admin-storage', onSync)
    }
  }, [refresh])

  const stats = useMemo(() => {
    const enabled = links.filter((l) => l.isEnabled).length
    return { total: links.length, enabled, disabled: links.length - enabled }
  }, [links])

  const handleFieldChange = (platform, field, value) => {
    setLinks((prev) =>
      prev.map((link) => (link.platform === platform ? { ...link, [field]: value } : link)),
    )
    setMessage('')
    setSaveError('')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    setMessage('')

    const normalized = links.map((link) => ({
      ...link,
      label: link.label?.trim() || link.platform,
      url: link.url?.trim() || link.defaultUrl,
    }))

    const settings = loadSettings()
    const nextSettings = {
      ...settings,
      ...socialLinksToSettingsPatch(normalized),
    }
    saveSettings(nextSettings)
    setLinks(normalized)

    if (supabase) {
      const { ok, error } = await upsertSocialMediaLinksToDatabase(normalized)
      if (!ok) {
        setSaveError(error || 'Could not save social links to the database.')
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setMessage('Social media links saved successfully.')
  }

  const handleReset = () => {
    const defaults = buildDefaultSocialLinks()
    setLinks(defaults)
    const settings = loadSettings()
    saveSettings({ ...settings, ...socialLinksToSettingsPatch(defaults) })
    setMessage('Social media links reset to defaults. Save to apply to the live site.')
    setSaveError('')
  }

  return (
    <section className="admin-panel-card admin-social-media" aria-label="Social media management">
      <div className="admin-post-list-head">
        <h2>Social Media Management</h2>
        <div className="admin-post-item-actions">
          <button type="button" onClick={refresh} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      <div className="scheduled-queue-stats">
        <article>
          <strong>{stats.total}</strong>
          <span>Platforms</span>
        </article>
        <article>
          <strong>{stats.enabled}</strong>
          <span>Visible in Footer</span>
        </article>
        <article>
          <strong>{stats.disabled}</strong>
          <span>Hidden</span>
        </article>
      </div>

      {loading ? <p className="page-empty">Loading social profiles…</p> : null}

      <form className="admin-social-form" onSubmit={handleSave}>
        <div className="admin-social-table-wrap">
          <table className="admin-social-table">
            <thead>
              <tr>
                <th scope="col">Platform</th>
                <th scope="col">Display label</th>
                <th scope="col">Profile URL</th>
                <th scope="col">Footer</th>
                <th scope="col">Order</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.platform}>
                  <td data-label="Platform">
                    <span className={`admin-social-platform ${link.iconClass}`}>{link.label}</span>
                  </td>
                  <td data-label="Label">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => handleFieldChange(link.platform, 'label', e.target.value)}
                      aria-label={`${link.label} display label`}
                      maxLength={80}
                    />
                  </td>
                  <td data-label="URL">
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleFieldChange(link.platform, 'url', e.target.value)}
                      placeholder={link.defaultUrl}
                      aria-label={`${link.label} URL`}
                    />
                  </td>
                  <td data-label="Footer">
                    <label className="admin-social-toggle">
                      <input
                        type="checkbox"
                        checked={link.isEnabled}
                        onChange={(e) =>
                          handleFieldChange(link.platform, 'isEnabled', e.target.checked)
                        }
                      />
                      <span>{link.isEnabled ? 'Shown' : 'Hidden'}</span>
                    </label>
                  </td>
                  <td data-label="Order">
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={link.sortOrder}
                      onChange={(e) =>
                        handleFieldChange(link.platform, 'sortOrder', Number(e.target.value))
                      }
                      aria-label={`${link.label} sort order`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-settings-actions">
          <button type="submit" disabled={saving || loading}>
            {saving ? 'Saving…' : 'Save Social Links'}
          </button>
          <button type="button" className="btn-secondary" onClick={handleReset} disabled={saving}>
            Reset Defaults
          </button>
        </div>
      </form>

      {saveError ? <p className="admin-auth-hint admin-auth-hint--error">{saveError}</p> : null}
      {message ? <p className="admin-auth-hint">{message}</p> : null}
    </section>
  )
}
