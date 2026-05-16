import { useState } from 'react'
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../../admin/storage'

export default function AdminSocialMediaPage() {
  const initial = loadSettings()
  const [socialDraft, setSocialDraft] = useState({
    socialFacebook: initial.socialFacebook || DEFAULT_SETTINGS.socialFacebook,
    socialX: initial.socialX || DEFAULT_SETTINGS.socialX,
    socialInstagram: initial.socialInstagram || DEFAULT_SETTINGS.socialInstagram,
    socialWhatsapp: initial.socialWhatsapp || DEFAULT_SETTINGS.socialWhatsapp,
    socialYoutube: initial.socialYoutube || DEFAULT_SETTINGS.socialYoutube,
    socialTiktok: initial.socialTiktok || DEFAULT_SETTINGS.socialTiktok,
  })
  const [message, setMessage] = useState('')

  const handleChange = (field, value) => {
    setSocialDraft((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    const settings = loadSettings()
    const next = {
      ...settings,
      ...Object.fromEntries(
        Object.entries(socialDraft).map(([key, value]) => [key, value.trim() || DEFAULT_SETTINGS[key]])
      ),
    }
    saveSettings(next)
    setMessage('Social media links saved successfully.')
  }

  const handleReset = () => {
    setSocialDraft({
      socialFacebook: DEFAULT_SETTINGS.socialFacebook,
      socialX: DEFAULT_SETTINGS.socialX,
      socialInstagram: DEFAULT_SETTINGS.socialInstagram,
      socialWhatsapp: DEFAULT_SETTINGS.socialWhatsapp,
      socialYoutube: DEFAULT_SETTINGS.socialYoutube,
      socialTiktok: DEFAULT_SETTINGS.socialTiktok,
    })
    setMessage('Social media links reset to defaults.')
  }

  return (
    <section className="admin-panel-card admin-settings" aria-label="Social media management">
      <h2>Social Media Management</h2>
      <form className="admin-settings-form" onSubmit={handleSave}>
        <label htmlFor="socialFacebookInput">Facebook URL</label>
        <input
          id="socialFacebookInput"
          type="url"
          value={socialDraft.socialFacebook}
          onChange={(e) => handleChange('socialFacebook', e.target.value)}
          placeholder="https://facebook.com/your-page"
        />

        <label htmlFor="socialXInput">X (Twitter) URL</label>
        <input
          id="socialXInput"
          type="url"
          value={socialDraft.socialX}
          onChange={(e) => handleChange('socialX', e.target.value)}
          placeholder="https://x.com/your-handle"
        />

        <label htmlFor="socialInstagramInput">Instagram URL</label>
        <input
          id="socialInstagramInput"
          type="url"
          value={socialDraft.socialInstagram}
          onChange={(e) => handleChange('socialInstagram', e.target.value)}
          placeholder="https://instagram.com/your-handle"
        />

        <label htmlFor="socialWhatsappInput">WhatsApp URL</label>
        <input
          id="socialWhatsappInput"
          type="url"
          value={socialDraft.socialWhatsapp}
          onChange={(e) => handleChange('socialWhatsapp', e.target.value)}
          placeholder="https://wa.me/234..."
        />

        <label htmlFor="socialYoutubeInput">YouTube URL</label>
        <input
          id="socialYoutubeInput"
          type="url"
          value={socialDraft.socialYoutube}
          onChange={(e) => handleChange('socialYoutube', e.target.value)}
          placeholder="https://youtube.com/@your-channel"
        />

        <label htmlFor="socialTiktokInput">TikTok URL</label>
        <input
          id="socialTiktokInput"
          type="url"
          value={socialDraft.socialTiktok}
          onChange={(e) => handleChange('socialTiktok', e.target.value)}
          placeholder="https://tiktok.com/@your-handle"
        />

        <div className="admin-settings-actions">
          <button type="submit">Save Social Links</button>
          <button type="button" className="btn-secondary" onClick={handleReset}>
            Reset Defaults
          </button>
        </div>
      </form>
      {message && <p className="admin-auth-hint">{message}</p>}
    </section>
  )
}
