import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { logPublicFormSubmission } from '../utils/publicForms'

const CONTACT_TOPICS = [
  { value: 'general', label: 'General inquiry' },
  { value: 'tip', label: 'News tip / story idea' },
  { value: 'correction', label: 'Correction request' },
  { value: 'technical', label: 'Site or app issue' },
  { value: 'partnership', label: 'Partnership / collaboration' },
  { value: 'other', label: 'Other' },
]

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

export default function ContactPage() {
  const { settings } = useSiteSettings()
  const paragraphs = useMemo(() => {
    return String(settings.contactUsContent || '')
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
  }, [settings.contactUsContent])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState('general')
  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const [touched, setTouched] = useState(false)
  const [status, setStatus] = useState('idle')

  const errors = useMemo(() => {
    const e = {}
    if (!name.trim()) e.name = 'Please enter your name.'
    if (!validateEmail(email)) e.email = 'Enter a valid email address.'
    if (message.trim().length < 12) e.message = 'Message should be at least 12 characters.'
    if (!consent) e.consent = 'Please confirm you agree to be contacted about this message.'
    return e
  }, [name, email, message, consent])

  const isValid = Object.keys(errors).length === 0

  async function handleSubmit(e) {
    e.preventDefault()
    setTouched(true)
    if (!isValid) {
      setStatus('error')
      return
    }
    setStatus('sending')
    const payload = {
      name: name.trim(),
      email: email.trim(),
      topic,
      message: message.trim(),
      consent,
      to: settings.contactEmail,
    }
    await logPublicFormSubmission('contact', payload)
    setStatus('success')
    setName('')
    setEmail('')
    setTopic('general')
    setMessage('')
    setConsent(false)
    setTouched(false)
  }

  return (
    <main className="container page-shell page-contact">
      <header className="page-hero">
        <p className="page-kicker">We're here to help</p>
        <h1 className="page-title">Contact {settings.siteName}</h1>
        <p className="page-lead">
          Editorial questions, corrections, partnerships, or technical issues — use the form and we will route your message
          to the right team.
        </p>
      </header>

      <section className="page-split page-split--reverse-contact" aria-label="Contact options">
        <div className="page-split-main">
          <div className="page-prose page-prose--tight">
            {paragraphs.length ? paragraphs.map((p, i) => <p key={`contact-p-${i}`}>{p}</p>) : null}
          </div>
          <div className="page-contact-cards" role="list">
            <div className="contact-mini-card" role="listitem">
              <h2 className="contact-mini-title">Editorial</h2>
              <p className="contact-mini-text">Tips, corrections, and general newsroom mail.</p>
              <a className="contact-mini-link" href={`mailto:${settings.contactEmail}`}>
                {settings.contactEmail}
              </a>
            </div>
            <div className="contact-mini-card" role="listitem">
              <h2 className="contact-mini-title">Advertising</h2>
              <p className="contact-mini-text">Campaigns, sponsorships, and rate cards.</p>
              <Link className="contact-mini-link" to="/advertise">
                Open advertise page
              </Link>
            </div>
            <div className="contact-mini-card" role="listitem">
              <h2 className="contact-mini-title">Mailing address</h2>
              <p className="contact-mini-text">Editorial and business correspondence.</p>
              {settings.siteAddress?.trim() ? (
                <a
                  className="contact-mini-link"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.siteAddress.trim())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {settings.siteAddress.trim()}
                </a>
              ) : (
                <span className="contact-mini-text">Address on file — configure in Admin Settings.</span>
              )}
            </div>
            <div className="contact-mini-card" role="listitem">
              <h2 className="contact-mini-title">Secure tips</h2>
              <p className="contact-mini-text">If you have documents, send guidance on how to reach you safely.</p>
              <a className="contact-mini-link" href={`mailto:${settings.tipsEmail || settings.contactEmail}`}>
                {settings.tipsEmail || settings.contactEmail}
              </a>
            </div>
          </div>
        </div>

        <div className="page-panel">
          <h2 className="page-panel-title">Send a message</h2>
          <p className="page-panel-sub">
            Messages are saved to Supabase when configured (with a local fallback if needed). We typically route replies through
            the email addresses listed on this page.
          </p>
          {status === 'success' ? (
            <div className="form-success" role="status">
              <strong>Thanks — message received.</strong>
              <p>
                We typically reply within one to two business days. For urgent corrections, mention “URGENT” in the subject
                line when you email directly.
              </p>
              <button type="button" className="page-btn page-btn--ghost" onClick={() => setStatus('idle')}>
                Send another message
              </button>
            </div>
          ) : (
            <form className="page-form" onSubmit={handleSubmit} noValidate>
              <label className="page-field">
                <span className="page-label">Full name</span>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={touched && errors.name ? 'input-invalid' : ''}
                  aria-invalid={touched && !!errors.name}
                  aria-describedby={touched && errors.name ? 'contact-name-error' : undefined}
                />
                {touched && errors.name ? (
                  <span id="contact-name-error" className="field-error">
                    {errors.name}
                  </span>
                ) : null}
              </label>

              <label className="page-field">
                <span className="page-label">Email</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={touched && errors.email ? 'input-invalid' : ''}
                  aria-invalid={touched && !!errors.email}
                  aria-describedby={touched && errors.email ? 'contact-email-error' : undefined}
                />
                {touched && errors.email ? (
                  <span id="contact-email-error" className="field-error">
                    {errors.email}
                  </span>
                ) : null}
              </label>

              <label className="page-field">
                <span className="page-label">Topic</span>
                <select name="topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
                  {CONTACT_TOPICS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="page-field">
                <span className="page-label">Message</span>
                <textarea
                  name="message"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={touched && errors.message ? 'input-invalid' : ''}
                  aria-invalid={touched && !!errors.message}
                  aria-describedby={touched && errors.message ? 'contact-message-error' : undefined}
                  placeholder="Include links, dates, and anything that helps us verify the issue or idea."
                />
                {touched && errors.message ? (
                  <span id="contact-message-error" className="field-error">
                    {errors.message}
                  </span>
                ) : null}
              </label>

              <label className="page-checkbox">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>
                  I agree that {settings.siteName} may respond to this message using the email address above. See our{' '}
                  <Link to="/privacy-policy">Privacy Policy</Link> and <Link to="/terms-and-conditions">terms</Link> for
                  details on data use.
                </span>
              </label>
              {touched && errors.consent ? <span className="field-error">{errors.consent}</span> : null}

              <div className="page-form-actions">
                <button type="submit" className="page-btn page-btn--primary" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Send message'}
                </button>
                <Link to="/" className="page-btn page-btn--ghost">
                  Back to home
                </Link>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
