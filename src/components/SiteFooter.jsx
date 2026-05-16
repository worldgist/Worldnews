import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DEFAULT_SETTINGS, loadSettings } from '../admin/storage'

export default function SiteFooter() {
  const [settings, setSettings] = useState(loadSettings())

  useEffect(() => {
    const syncSettings = () => {
      setSettings(loadSettings())
    }

    syncSettings()
    window.addEventListener('storage', syncSettings)
    return () => window.removeEventListener('storage', syncSettings)
  }, [])

  return (
    <footer className="site-footer">
      <div className="container footer-minimal">
        <div className="footer-nav-row">
          <Link to="/">Home</Link>
          <Link to="/about-us">About Us</Link>
          <Link to="/contact-us">Contact Us</Link>
          <Link to="/advertise">Advertise</Link>
          <Link to="/submit-news">Submit News</Link>
          <Link to="/terms-and-conditions">Terms and Conditions</Link>
        </div>

        <p className="footer-social-title">Connect With Us</p>
        <div className="footer-social-row" aria-label="Social media handles">
          <a
            href={settings.socialFacebook || DEFAULT_SETTINGS.socialFacebook}
            target="_blank"
            rel="noreferrer"
            aria-label="World Gist News on Facebook"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13.63 21v-8.2h2.76l.41-3.2h-3.17V7.56c0-.93.26-1.56 1.59-1.56h1.7V3.13C16.09 3.04 15.47 3 14.75 3c-2.15 0-3.62 1.31-3.62 3.73V9.6H8.7v3.2h2.43V21h2.5Z" />
            </svg>
            <span className="sr-only">Facebook</span>
          </a>
          <a href={settings.socialX || DEFAULT_SETTINGS.socialX} target="_blank" rel="noreferrer" aria-label="World Gist News on X">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.4 3h2.9l-6.34 7.24L22.4 21h-5.82l-4.56-6.25L6.57 21H3.66l6.78-7.75L1.6 3h5.97l4.12 5.66L18.4 3Zm-1.02 16.25H19L6.69 4.66H5.01l12.37 14.59Z" />
            </svg>
            <span className="sr-only">X</span>
          </a>
          <a
            href={settings.socialInstagram || DEFAULT_SETTINGS.socialInstagram}
            target="_blank"
            rel="noreferrer"
            aria-label="World Gist News on Instagram"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 2.2A1.8 1.8 0 0 0 5.2 7v10A1.8 1.8 0 0 0 7 18.8h10a1.8 1.8 0 0 0 1.8-1.8V7A1.8 1.8 0 0 0 17 5.2H7Zm5 2.05A4.75 4.75 0 1 1 7.25 12 4.76 4.76 0 0 1 12 7.25Zm0 2.2A2.55 2.55 0 1 0 14.55 12 2.55 2.55 0 0 0 12 9.45Zm4.95-2.63a1.18 1.18 0 1 1-1.18 1.18 1.18 1.18 0 0 1 1.18-1.18Z" />
            </svg>
            <span className="sr-only">Instagram</span>
          </a>
          <a
            href={settings.socialWhatsapp || DEFAULT_SETTINGS.socialWhatsapp}
            target="_blank"
            rel="noreferrer"
            aria-label="World Gist News on WhatsApp"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12.02 2.2c-5.4 0-9.77 4.3-9.77 9.61 0 1.7.45 3.36 1.3 4.83L2.2 21.8l5.35-1.4a9.86 9.86 0 0 0 4.47 1.08h.01c5.39 0 9.77-4.31 9.77-9.62 0-5.3-4.38-9.6-9.78-9.6Zm0 17.53h-.01a7.9 7.9 0 0 1-4.03-1.1l-.29-.17-3.17.83.85-3.06-.19-.31a7.8 7.8 0 0 1-1.2-4.1c0-4.3 3.56-7.8 7.95-7.8 4.39 0 7.95 3.5 7.95 7.8s-3.56 7.91-7.86 7.91Zm4.36-5.92c-.24-.12-1.42-.69-1.64-.77-.22-.08-.38-.12-.54.12-.16.24-.62.77-.76.93-.14.16-.28.18-.52.06-.24-.12-1-.37-1.9-1.17-.7-.62-1.18-1.39-1.32-1.63-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.77-.2-.48-.4-.41-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.68 2.62 4.14 3.57.58.22 1.03.36 1.38.46.58.18 1.1.16 1.52.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
            </svg>
            <span className="sr-only">WhatsApp</span>
          </a>
          <a
            href={settings.socialYoutube || DEFAULT_SETTINGS.socialYoutube}
            target="_blank"
            rel="noreferrer"
            aria-label="World Gist News on YouTube"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M23 12s0-3.07-.39-4.55a3.06 3.06 0 0 0-2.16-2.16C18.98 4.9 12 4.9 12 4.9s-6.98 0-8.45.39A3.06 3.06 0 0 0 1.39 7.45C1 8.93 1 12 1 12s0 3.07.39 4.55a3.06 3.06 0 0 0 2.16 2.16c1.47.39 8.45.39 8.45.39s6.98 0 8.45-.39a3.06 3.06 0 0 0 2.16-2.16C23 15.07 23 12 23 12ZM9.25 15.5v-7l6 3.5-6 3.5Z" />
            </svg>
            <span className="sr-only">YouTube</span>
          </a>
          <a
            href={settings.socialTiktok || DEFAULT_SETTINGS.socialTiktok}
            target="_blank"
            rel="noreferrer"
            aria-label="World Gist News on TikTok"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14.5 3h2.64a4.95 4.95 0 0 0 3.1 3.1v2.66a7.58 7.58 0 0 1-3.1-.66v6.4a5.5 5.5 0 1 1-5.5-5.5c.34 0 .67.03 1 .09v2.73a2.84 2.84 0 0 0-1-.18 2.86 2.86 0 1 0 2.86 2.86V3Z" />
            </svg>
            <span className="sr-only">TikTok</span>
          </a>
        </div>

        <div className="footer-brand-small">
          <Link className="brand" to="/">
            <img className="brand-mark" src="/logo.png" alt={`${settings.siteName} logo`} />
            <span className="brand-text">{settings.siteName}</span>
          </Link>
          <p>{settings.copyrightText}</p>
        </div>
      </div>
    </footer>
  )
}
