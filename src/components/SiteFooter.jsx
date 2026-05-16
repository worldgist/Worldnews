import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DEFAULT_SETTINGS, loadSettings } from '../admin/storage'
import { CMS_SYNC_EVENT } from '../lib/cmsEvents'

export default function SiteFooter() {
  const [settings, setSettings] = useState(loadSettings())

  useEffect(() => {
    const syncSettings = () => {
      setSettings(loadSettings())
    }

    syncSettings()
    window.addEventListener('storage', syncSettings)
    window.addEventListener('worldnews-admin-storage', syncSettings)
    window.addEventListener(CMS_SYNC_EVENT, syncSettings)
    return () => {
      window.removeEventListener('storage', syncSettings)
      window.removeEventListener('worldnews-admin-storage', syncSettings)
      window.removeEventListener(CMS_SYNC_EVENT, syncSettings)
    }
  }, [])

  const siteName = settings.siteName?.trim() || DEFAULT_SETTINGS.siteName
  const tagline =
    settings.siteTagline?.trim() || DEFAULT_SETTINGS.siteTagline
  const contactEmail =
    settings.contactEmail?.trim() || DEFAULT_SETTINGS.contactEmail
  const copyright =
    settings.copyrightText?.trim() || DEFAULT_SETTINGS.copyrightText
  const siteAddress = String(settings.siteAddress ?? '').trim()
  const mapsQuery = siteAddress ? encodeURIComponent(siteAddress) : ''

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="footer-grid">
          <div className="footer-col footer-col--brand">
            <Link className="footer-brand-lockup" to="/" aria-label={`${siteName} home`}>
              <img className="footer-brand-lockup__mark" src="/logo.png" alt="" />
              <span className="footer-brand-lockup__name">{siteName}</span>
            </Link>
            <p className="footer-tagline">{tagline}</p>
            <a className="footer-email" href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
            {siteAddress ? (
              <p className="footer-address">
                {mapsQuery ? (
                  <a
                    className="footer-address__link"
                    href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {siteAddress}
                  </a>
                ) : (
                  siteAddress
                )}
              </p>
            ) : null}
          </div>

          <nav className="footer-col" aria-label="Explore">
            <h2 className="footer-heading">Explore</h2>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/trending">Trending</Link>
              </li>
              <li>
                <Link to="/search">Search</Link>
              </li>
              <li>
                <Link to="/world-news">World News</Link>
              </li>
            </ul>
          </nav>

          <nav className="footer-col" aria-label="Company">
            <h2 className="footer-heading">Company</h2>
            <ul className="footer-links">
              <li>
                <Link to="/about-us" target="_blank" rel="noopener noreferrer">
                  About Us
                  <span className="sr-only"> (opens in new tab)</span>
                </Link>
              </li>
              <li>
                <Link to="/contact-us" target="_blank" rel="noopener noreferrer">
                  Contact Us
                  <span className="sr-only"> (opens in new tab)</span>
                </Link>
              </li>
              <li>
                <Link to="/advertise" target="_blank" rel="noopener noreferrer">
                  Advertise
                  <span className="sr-only"> (opens in new tab)</span>
                </Link>
              </li>
              <li>
                <Link to="/submit-news" target="_blank" rel="noopener noreferrer">
                  Submit News
                  <span className="sr-only"> (opens in new tab)</span>
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" target="_blank" rel="noopener noreferrer">
                  Terms &amp; Conditions
                  <span className="sr-only"> (opens in new tab)</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                  <span className="sr-only"> (opens in new tab)</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="footer-social-block">
          <p className="footer-social-block__label">Connect with us</p>
          <div className="footer-social-row" aria-label="Social media handles">
            <a
              className="social-link social-facebook"
              href={settings.socialFacebook || DEFAULT_SETTINGS.socialFacebook}
              target="_blank"
              rel="noreferrer"
              aria-label={`${siteName} on Facebook`}
            >
              <img src="/facebook.png" alt="" aria-hidden="true" />
              <span className="sr-only">Facebook</span>
            </a>
            <a
              className="social-link social-x"
              href={settings.socialX || DEFAULT_SETTINGS.socialX}
              target="_blank"
              rel="noreferrer"
              aria-label={`${siteName} on X`}
            >
              <img src="/x.png" alt="" aria-hidden="true" />
              <span className="sr-only">X</span>
            </a>
            <a
              className="social-link social-instagram"
              href={settings.socialInstagram || DEFAULT_SETTINGS.socialInstagram}
              target="_blank"
              rel="noreferrer"
              aria-label={`${siteName} on Instagram`}
            >
              <img src="/instagram.png" alt="" aria-hidden="true" />
              <span className="sr-only">Instagram</span>
            </a>
            <a
              className="social-link social-whatsapp"
              href={settings.socialWhatsapp || DEFAULT_SETTINGS.socialWhatsapp}
              target="_blank"
              rel="noreferrer"
              aria-label={`${siteName} on WhatsApp`}
            >
              <img src="/whatsapp.png" alt="" aria-hidden="true" />
              <span className="sr-only">WhatsApp</span>
            </a>
            <a
              className="social-link social-youtube"
              href={settings.socialYoutube || DEFAULT_SETTINGS.socialYoutube}
              target="_blank"
              rel="noreferrer"
              aria-label={`${siteName} on YouTube`}
            >
              <img src="/youtube.png" alt="" aria-hidden="true" />
              <span className="sr-only">YouTube</span>
            </a>
            <a
              className="social-link social-tiktok"
              href={settings.socialTiktok || DEFAULT_SETTINGS.socialTiktok}
              target="_blank"
              rel="noreferrer"
              aria-label={`${siteName} on TikTok`}
            >
              <img src="/tiktok.png" alt="" aria-hidden="true" />
              <span className="sr-only">TikTok</span>
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-bottom__legal">{copyright}</p>
        </div>
      </div>
    </footer>
  )
}
