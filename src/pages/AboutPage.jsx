import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadSettings } from '../admin/storage'

export default function AboutPage() {
  const [settings, setSettings] = useState(loadSettings())

  useEffect(() => {
    const sync = () => setSettings(loadSettings())
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const aboutParagraphs = useMemo(
    () =>
      (settings.aboutUsContent || '')
        .split(/\n\s*\n/)
        .map((text) => text.trim())
        .filter(Boolean),
    [settings.aboutUsContent],
  )

  return (
    <main className="container static-page">
      <p className="kicker">About Us</p>
      <h1>About World Gist News</h1>
      {aboutParagraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}

      <section className="static-section">
        <h2>Our Mission</h2>
        <p>
          To deliver timely headlines with useful context, while maintaining
          editorial independence and factual accuracy.
        </p>
      </section>

      <section className="static-section">
        <h2>What We Cover</h2>
        <ul>
          <li>Politics and governance</li>
          <li>World news and diplomacy</li>
          <li>Technology and digital transformation</li>
          <li>School and education updates</li>
          <li>Community and civic development</li>
        </ul>
      </section>

      <Link className="read-more" to="/">
        Back to homepage
      </Link>
    </main>
  )
}
