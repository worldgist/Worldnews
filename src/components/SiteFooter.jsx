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
            className="social-link social-facebook"
            href={settings.socialFacebook || DEFAULT_SETTINGS.socialFacebook}
            target="_blank"
            rel="noreferrer"
            aria-label="World Gist News on Facebook"
          >
            <img src="/facebook.png" alt="" aria-hidden="true" />
            <span className="sr-only">Facebook</span>
          </a>
          <a
            className="social-link social-x"
            href={settings.socialX || DEFAULT_SETTINGS.socialX}
            target="_blank"
            rel="noreferrer"
            aria-label="World Gist News on X"
          >
            <img src="/x.png" alt="" aria-hidden="true" />
            <span className="sr-only">X</span>
          </a>
          <a
            className="social-link social-instagram"
            href={settings.socialInstagram || DEFAULT_SETTINGS.socialInstagram}
            target="_blank"
            rel="noreferrer"
            aria-label="World Gist News on Instagram"
          >
            <img src="/instagram.png" alt="" aria-hidden="true" />
            <span className="sr-only">Instagram</span>
          </a>
          <a
            className="social-link social-whatsapp"
            href={settings.socialWhatsapp || DEFAULT_SETTINGS.socialWhatsapp}
            target="_blank"
            rel="noreferrer"
            aria-label="World Gist News on WhatsApp"
          >
            <img src="/whatsapp.png" alt="" aria-hidden="true" />
            <span className="sr-only">WhatsApp</span>
          </a>
          <a
            className="social-link social-youtube"
            href={settings.socialYoutube || DEFAULT_SETTINGS.socialYoutube}
            target="_blank"
            rel="noreferrer"
            aria-label="World Gist News on YouTube"
          >
            <img src="/youtube.png" alt="" aria-hidden="true" />
            <span className="sr-only">YouTube</span>
          </a>
          <a
            className="social-link social-tiktok"
            href={settings.socialTiktok || DEFAULT_SETTINGS.socialTiktok}
            target="_blank"
            rel="noreferrer"
            aria-label="World Gist News on TikTok"
          >
            <img src="/tiktok.png" alt="" aria-hidden="true" />
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
