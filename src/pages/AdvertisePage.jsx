import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { logPublicFormSubmission } from '../utils/publicForms'

const BUDGET_BANDS = [
  { value: 'under-1k', label: 'Under $1,000 / month equivalent' },
  { value: '1k-5k', label: '$1,000 – $5,000 / month' },
  { value: '5k-15k', label: '$5,000 – $15,000 / month' },
  { value: '15k-plus', label: '$15,000+ / month or custom' },
  { value: 'unsure', label: 'Not sure yet' },
]

const FORMATS = [
  { id: 'display', label: 'Display and native placements' },
  { id: 'newsletter', label: 'Newsletter feature or takeover' },
  { id: 'sponsored', label: 'Sponsored series / partner content' },
  { id: 'events', label: 'Event or launch amplification' },
]

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

export default function AdvertisePage() {
  const { settings } = useSiteSettings()

  const [org, setOrg] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [market, setMarket] = useState('')
  const [budget, setBudget] = useState('unsure')
  const [formats, setFormats] = useState(() => new Set(['display']))
  const [goals, setGoals] = useState('')
  const [touched, setTouched] = useState(false)
  const [status, setStatus] = useState('idle')

  const commercial = settings.commercialEmail || settings.contactEmail

  const errors = useMemo(() => {
    const e = {}
    if (!org.trim()) e.org = 'Organization name is required.'
    if (!name.trim()) e.name = 'Contact name is required.'
    if (!validateEmail(email)) e.email = 'Enter a valid email address.'
    if (!market.trim()) e.market = 'Tell us your primary market or audience.'
    if (!goals.trim() || goals.trim().length < 20) e.goals = 'Campaign goals should be at least 20 characters.'
    return e
  }, [org, name, email, market, goals])

  const isValid = Object.keys(errors).length === 0

  function toggleFormat(id) {
    setFormats((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      if (next.size === 0) next.add(id)
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setTouched(true)
    if (!isValid) {
      setStatus('error')
      return
    }
    setStatus('sending')
    const payload = {
      org: org.trim(),
      name: name.trim(),
      email: email.trim(),
      market: market.trim(),
      budget,
      formats: Array.from(formats),
      goals: goals.trim(),
      to: commercial,
    }
    await logPublicFormSubmission('advertise', payload)
    setStatus('success')
    setOrg('')
    setName('')
    setEmail('')
    setMarket('')
    setBudget('unsure')
    setFormats(new Set(['display']))
    setGoals('')
    setTouched(false)
  }

  return (
    <main className="container page-shell page-advertise">
      <header className="page-hero page-hero--brand">
        <p className="page-kicker">Partner with our audience</p>
        <h1 className="page-title">Advertise on {settings.siteName}</h1>
        <p className="page-lead">
          Reach readers who care about world affairs, politics, technology, and community stories. Campaigns can combine
          homepage visibility, category sponsorships, and newsletter placements in line with your goals.
        </p>
        <div className="page-hero-actions">
          <a className="page-btn page-btn--primary" href={`mailto:${commercial}?subject=Advertising%20inquiry`}>
            Email {commercial}
          </a>
          <Link to="/contact-us" className="page-btn page-btn--ghost">
            General contact
          </Link>
        </div>
      </header>

      <section className="page-split page-split--advertise" aria-labelledby="advertise-form-heading">
        <div className="page-split-main">
          <h2 id="advertise-form-heading" className="page-section-title">
            Request media kit &amp; availability
          </h2>
          <p className="page-prose-intro">
            Share a short brief and we will follow up with placement options, creative specs, and lead times. Submissions are
            stored in Supabase when configured, with a browser fallback if the database is unavailable.
          </p>

          <ul className="page-bullet-columns" role="list">
            <li>
              <strong>Brand-safe environments</strong>
              <span>Editorial adjacency controls and disclosure for sponsored modules.</span>
            </li>
            <li>
              <strong>Flexible formats</strong>
              <span>Responsive display, sponsored hubs, and curated partner stories.</span>
            </li>
            <li>
              <strong>Measurement</strong>
              <span>Delivery reporting; deeper analytics can be scoped per campaign.</span>
            </li>
          </ul>

          <div className="page-compare" aria-label="What we disclose">
            <div>
              <h3 className="page-compare-title">Sponsored content</h3>
              <p>Labeled clearly; not written by the news desk unless co-bylined and disclosed.</p>
            </div>
            <div>
              <h3 className="page-compare-title">Editorial independence</h3>
              <p>Ads do not influence news judgments; buyers may not request favorable coverage.</p>
            </div>
          </div>
        </div>

        <div className="page-panel page-panel--accent">
          {status === 'success' ? (
            <div className="form-success" role="status">
              <strong>Brief received.</strong>
              <p>
                Thank you. Our partnerships desk schedules calls within two business days. For expedited launches, email{' '}
                <a href={`mailto:${commercial}`}>{commercial}</a> with “Launch date” in the subject line.
              </p>
              <button type="button" className="page-btn page-btn--ghost" onClick={() => setStatus('idle')}>
                Submit another brief
              </button>
            </div>
          ) : (
            <form className="page-form" onSubmit={handleSubmit} noValidate>
              <label className="page-field">
                <span className="page-label">Organization</span>
                <input
                  type="text"
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  className={touched && errors.org ? 'input-invalid' : ''}
                  aria-invalid={touched && !!errors.org}
                />
                {touched && errors.org ? <span className="field-error">{errors.org}</span> : null}
              </label>

              <div className="page-field-row">
                <label className="page-field">
                  <span className="page-label">Contact name</span>
                  <input
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={touched && errors.name ? 'input-invalid' : ''}
                    aria-invalid={touched && !!errors.name}
                  />
                  {touched && errors.name ? <span className="field-error">{errors.name}</span> : null}
                </label>
                <label className="page-field">
                  <span className="page-label">Work email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={touched && errors.email ? 'input-invalid' : ''}
                    aria-invalid={touched && !!errors.email}
                  />
                  {touched && errors.email ? <span className="field-error">{errors.email}</span> : null}
                </label>
              </div>

              <label className="page-field">
                <span className="page-label">Primary market / audience</span>
                <input
                  type="text"
                  placeholder="e.g. West Africa fintech, EU policy readers, global sports fans"
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  className={touched && errors.market ? 'input-invalid' : ''}
                  aria-invalid={touched && errors.market}
                />
                {touched && errors.market ? <span className="field-error">{errors.market}</span> : null}
              </label>

              <label className="page-field">
                <span className="page-label">Monthly budget band</span>
                <select value={budget} onChange={(e) => setBudget(e.target.value)}>
                  {BUDGET_BANDS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </label>

              <fieldset className="page-fieldset">
                <legend className="page-label">Interested formats</legend>
                <div className="page-chip-grid">
                  {FORMATS.map((f) => (
                    <label key={f.id} className="page-chip">
                      <input type="checkbox" checked={formats.has(f.id)} onChange={() => toggleFormat(f.id)} />
                      <span>{f.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="page-field">
                <span className="page-label">Campaign goals &amp; timing</span>
                <textarea
                  rows={5}
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className={touched && errors.goals ? 'input-invalid' : ''}
                  aria-invalid={touched && !!errors.goals}
                  placeholder="Creative readiness, flight dates, KPIs, geo targeting, frequency caps, and any brand guidelines."
                />
                {touched && errors.goals ? <span className="field-error">{errors.goals}</span> : null}
              </label>

              <div className="page-form-actions">
                <button type="submit" className="page-btn page-btn--primary" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Request follow-up'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
