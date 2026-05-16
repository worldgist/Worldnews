import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadSettings } from '../admin/storage'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [settings, setSettings] = useState(loadSettings())

  useEffect(() => {
    const sync = () => setSettings(loadSettings())
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const contactParagraphs = useMemo(
    () =>
      (settings.contactUsContent || '')
        .split(/\n\s*\n/)
        .map((text) => text.trim())
        .filter(Boolean),
    [settings.contactUsContent],
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Thanks for contacting World Gist News. We will get back to you shortly.')
    setName('')
    setEmail('')
    setMessage('')
  }

  return (
    <main className="container static-page">
      <p className="kicker">Contact Us</p>
      <h1>Get in Touch</h1>
      {contactParagraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}

      <form className="contact-page-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <textarea
          placeholder="Your message"
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button type="submit">Send Message</button>
      </form>

      <div className="contact-meta">
        <p>Email: {settings.contactEmail}</p>
        <p>Editorial Desk: Mon - Fri, 8:00AM - 6:00PM</p>
      </div>

      <Link className="read-more" to="/">
        Back to homepage
      </Link>
    </main>
  )
}
