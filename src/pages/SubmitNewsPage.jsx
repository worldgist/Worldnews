import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { logPublicFormSubmission } from '../utils/publicForms'

const URGENCY = [
  { value: 'routine', label: 'Routine — no deadline' },
  { value: 'this-week', label: 'This week' },
  { value: 'asap', label: 'Breaking / time-sensitive' },
]

const MATERIAL_TYPES = [
  { id: 'links', label: 'Links only' },
  { id: 'docs', label: 'Documents (describe separately)' },
  { id: 'images', label: 'Photos or video' },
  { id: 'access', label: 'Source willing to speak' },
]

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

export default function SubmitNewsPage() {
  const { settings } = useSiteSettings()
  const tips = settings.tipsEmail || settings.contactEmail

  const [headline, setHeadline] = useState('')
  const [summary, setSummary] = useState('')
  const [urgency, setUrgency] = useState('routine')
  const [location, setLocation] = useState('')
  const [when, setWhen] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [materials, setMaterials] = useState(() => new Set(['links']))
  const [anon, setAnon] = useState(false)
  const [touched, setTouched] = useState(false)
  const [status, setStatus] = useState('idle')

  const errors = useMemo(() => {
    const e = {}
    if (!headline.trim() || headline.trim().length < 8) e.headline = 'Headline should be at least 8 characters.'
    if (!summary.trim() || summary.trim().length < 40) e.summary = 'Please describe the story in at least 40 characters.'
    if (!location.trim()) e.location = 'Where did this happen or where is the coverage focus?'
    if (!when.trim()) e.when = 'When did this take place (approximate is fine)?'
    if (!anon && !validateEmail(email)) e.email = 'Provide a valid email or check “submit anonymously”.'
    return e
  }, [headline, summary, location, when, email, anon])

  const isValid = Object.keys(errors).length === 0

  function toggleMaterial(id) {
    setMaterials((prev) => {
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
      headline: headline.trim(),
      summary: summary.trim(),
      urgency,
      location: location.trim(),
      when: when.trim(),
      name: anon ? '[anonymous]' : name.trim(),
      email: anon ? '[anonymous]' : email.trim(),
      phone: phone.trim(),
      materials: Array.from(materials),
      anonymous: anon,
      to: tips,
    }
    await logPublicFormSubmission('submit-news', payload)
    setStatus('success')
    setHeadline('')
    setSummary('')
    setUrgency('routine')
    setLocation('')
    setWhen('')
    setName('')
    setEmail('')
    setPhone('')
    setMaterials(new Set(['links']))
    setAnon(false)
    setTouched(false)
  }

  return (
    <main className="container page-shell page-submit-news">
      <header className="page-hero page-hero--tips">
        <p className="page-kicker">Tips desk</p>
        <h1 className="page-title">Submit news to {settings.siteName}</h1>
        <p className="page-lead">
          Share verifiable details, access to primary sources, and timing. We review every submission; sensitive tips can be
          sent by email with the same information if you prefer not to use this form.
        </p>
        <div className="page-hero-actions">
          <a className="page-btn page-btn--primary" href={`mailto:${tips}?subject=News%20tip`}>
            Email tips line
          </a>
          <Link to="/contact-us" className="page-btn page-btn--ghost">
            Contact editors
          </Link>
        </div>
      </header>

      <section className="page-split page-split--submit" aria-labelledby="submit-guidelines-heading">
        <div className="page-split-main">
          <h2 id="submit-guidelines-heading" className="page-section-title">
            What to include
          </h2>
          <ol className="page-numbered">
            <li>
              <strong>Facts first</strong> — who, what, where, when, and how you know.
            </li>
            <li>
              <strong>Evidence</strong> — links, documents, or instructions to obtain them.
            </li>
            <li>
              <strong>Conflict disclosure</strong> — note if you are involved in the story.
            </li>
            <li>
              <strong>Safety</strong> — if publishing could create risk, tell us in the summary.
            </li>
          </ol>
          <div className="page-callout">
            <strong>No guarantee of coverage.</strong> We assign stories based on verification potential, news value, and
            newsroom capacity. Submitting does not establish a confidential relationship unless separately agreed.
          </div>
        </div>

        <div className="page-panel">
          {status === 'success' ? (
            <div className="form-success" role="status">
              <strong>Submission captured.</strong>
              <p>
                Thank you. If we need more detail, we will reach out using the contact information you provided (unless you
                chose to remain anonymous).
              </p>
              <button type="button" className="page-btn page-btn--ghost" onClick={() => setStatus('idle')}>
                Submit another tip
              </button>
            </div>
          ) : (
            <form className="page-form" onSubmit={handleSubmit} noValidate>
              <label className="page-field">
                <span className="page-label">Working headline</span>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className={touched && errors.headline ? 'input-invalid' : ''}
                  aria-invalid={touched && !!errors.headline}
                  placeholder="Short description of the story"
                />
                {touched && errors.headline ? <span className="field-error">{errors.headline}</span> : null}
              </label>

              <label className="page-field">
                <span className="page-label">Story summary</span>
                <textarea
                  rows={6}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className={touched && errors.summary ? 'input-invalid' : ''}
                  aria-invalid={touched && !!errors.summary}
                  placeholder="What happened, why it matters, and what evidence exists."
                />
                {touched && errors.summary ? <span className="field-error">{errors.summary}</span> : null}
              </label>

              <div className="page-field-row">
                <label className="page-field">
                  <span className="page-label">Urgency</span>
                  <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                    {URGENCY.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="page-field">
                  <span className="page-label">Timing</span>
                  <input
                    type="text"
                    value={when}
                    onChange={(e) => setWhen(e.target.value)}
                    className={touched && errors.when ? 'input-invalid' : ''}
                    placeholder="When it happened"
                  />
                  {touched && errors.when ? <span className="field-error">{errors.when}</span> : null}
                </label>
              </div>

              <label className="page-field">
                <span className="page-label">Location / jurisdiction</span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={touched && errors.location ? 'input-invalid' : ''}
                  placeholder="City, region, institution, court, or market"
                />
                {touched && errors.location ? <span className="field-error">{errors.location}</span> : null}
              </label>

              <fieldset className="page-fieldset">
                <legend className="page-label">What you can share</legend>
                <div className="page-chip-grid">
                  {MATERIAL_TYPES.map((m) => (
                    <label key={m.id} className="page-chip">
                      <input type="checkbox" checked={materials.has(m.id)} onChange={() => toggleMaterial(m.id)} />
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="page-checkbox">
                <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
                <span>Submit anonymously (contact fields optional)</span>
              </label>

              {!anon ? (
                <>
                  <div className="page-field-row">
                    <label className="page-field">
                      <span className="page-label">Your name</span>
                      <input type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </label>
                    <label className="page-field">
                      <span className="page-label">Email</span>
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
                    <span className="page-label">Phone (optional)</span>
                    <input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </label>
                </>
              ) : null}

              <div className="page-form-actions">
                <button type="submit" className="page-btn page-btn--primary" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Send tip'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
