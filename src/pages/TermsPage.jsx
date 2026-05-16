import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadSettings } from '../admin/storage'

export default function TermsPage() {
  const [settings, setSettings] = useState(loadSettings())

  useEffect(() => {
    const sync = () => setSettings(loadSettings())
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const termsParagraphs = useMemo(
    () =>
      (settings.termsContent || '')
        .split(/\n\s*\n/)
        .map((text) => text.trim())
        .filter(Boolean),
    [settings.termsContent],
  )

  return (
    <main className="container static-page">
      <p className="kicker">Terms and Conditions</p>
      <h1>Terms and Conditions</h1>
      {termsParagraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}

      <Link className="read-more" to="/">
        Back to homepage
      </Link>
    </main>
  )
}
