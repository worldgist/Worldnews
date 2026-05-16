import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

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
      <p>
        For editorial tips, partnership requests, corrections, or general
        inquiries, please use the form below.
      </p>

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
        <p>Email: newsroom@worldgistnews.com</p>
        <p>Editorial Desk: Mon - Fri, 8:00AM - 6:00PM</p>
      </div>

      <Link className="read-more" to="/">
        Back to homepage
      </Link>
    </main>
  )
}
