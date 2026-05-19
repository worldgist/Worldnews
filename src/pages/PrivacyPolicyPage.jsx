import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DEFAULT_SETTINGS } from '../admin/storage'
import { useSiteSettings } from '../hooks/useSiteSettings'

const EFFECTIVE_DATE = 'May 16, 2026'
const ADSENSE_PUBLISHER_ID = 'ca-pub-7542401782946817'
const SITE_URL = 'https://worldgistnews.com'

export default function PrivacyPolicyPage() {
  const { settings } = useSiteSettings()
  const [search, setSearch] = useState('')
  const [printMode, setPrintMode] = useState(false)

  const siteName = settings.siteName?.trim() || DEFAULT_SETTINGS.siteName
  const contactEmail = settings.contactEmail?.trim() || DEFAULT_SETTINGS.contactEmail
  const siteAddress = settings.siteAddress?.trim() || DEFAULT_SETTINGS.siteAddress

  const sections = useMemo(
    () => [
      {
        id: 'privacy-intro',
        title: 'Introduction',
        paragraphs: [
          `This Privacy Policy explains how ${siteName} ("we," "us," or "our") collects, uses, discloses, and protects information when you visit ${SITE_URL} and related pages (the "Site").`,
          'By using the Site, you agree to the practices described here. If you do not agree, please discontinue use of the Site.',
          `This policy is designed to meet common publisher requirements, including those for Google AdSense and other advertising partners. It should be read together with our Terms and Conditions.`,
        ],
      },
      {
        id: 'privacy-controller',
        title: 'Who is responsible for your data',
        paragraphs: [
          `${siteName} is the publisher responsible for operating this Site and handling inquiries about this policy.`,
          siteAddress
            ? `Postal or business address: ${siteAddress}.`
            : 'Our business address is published on the Site footer and contact page when available.',
          `Privacy and data requests: ${contactEmail}.`,
        ],
      },
      {
        id: 'privacy-collect',
        title: 'Information we collect',
        paragraphs: [
          'We may collect the following categories of information, depending on how you interact with the Site:',
          'Information you provide voluntarily, such as your name, email address, phone number, organization, and message content when you use contact forms, tip submission forms, newsletter sign-up, or advertising inquiry forms.',
          'Technical and usage information collected automatically, which may include your IP address, browser type and version, device type, operating system, referring/exit pages, pages viewed, time spent on pages, general location derived from IP address, and similar diagnostic data.',
          'Cookies, pixels, local storage, and similar technologies that store or read information on your device. See the Cookies and advertising section below for details.',
        ],
      },
      {
        id: 'privacy-use',
        title: 'How we use information',
        paragraphs: [
          'We use information for legitimate purposes including:',
          'Operating, maintaining, securing, and improving the Site and our editorial services.',
          'Responding to messages, tips, corrections, partnership requests, and commercial inquiries.',
          'Sending newsletters or updates where you have opted in, and honoring unsubscribe requests.',
          'Measuring audience interest, traffic patterns, and content performance.',
          'Displaying advertisements, including personalized or contextual ads where permitted by law and your choices.',
          'Detecting, preventing, and addressing fraud, abuse, spam, or technical issues.',
          'Complying with legal obligations and enforcing our Terms and Conditions.',
        ],
      },
      {
        id: 'privacy-legal-bases',
        title: 'Legal bases (EEA, UK, and similar regions)',
        paragraphs: [
          'Where applicable privacy laws require a legal basis, we rely on one or more of the following: your consent (for example, optional cookies or marketing emails); performance of a contract or steps at your request before entering a contract; our legitimate interests in operating a news publication, securing the Site, and funding content through advertising, balanced against your rights; and compliance with legal obligations.',
          'You may withdraw consent at any time where processing is based on consent, without affecting the lawfulness of processing before withdrawal.',
        ],
      },
      {
        id: 'privacy-cookies-ads',
        title: 'Cookies, Google AdSense, and advertising partners',
        paragraphs: [
          'We and third-party partners use cookies and similar technologies to remember preferences, analyze traffic, and deliver advertisements.',
          `This Site uses Google AdSense, a service provided by Google LLC, to show ads. Google and its advertising partners may use cookies—including the DoubleClick cookie—and device identifiers to serve ads based on your visit to this Site and/or other sites on the Internet.`,
          `Our AdSense publisher identifier is ${ADSENSE_PUBLISHER_ID}. Google's use of advertising cookies enables Google and its partners to serve ads to users based on their visits to our Site and/or other sites across the Internet.`,
          'Third-party vendors, including Google, use cookies to serve ads based on a user\'s prior visits to this website or other websites.',
          'You can learn how Google uses data from partner sites and apps at https://policies.google.com/technologies/partner-sites and how Google uses information from advertising at https://policies.google.com/technologies/ads.',
          'Opt out of personalized advertising from Google: https://adssettings.google.com.',
          'Opt out of many third-party vendors\' use of cookies for personalized advertising (United States): https://optout.aboutads.info/.',
          'Opt out of interest-based advertising (European Union): https://www.youronlinechoices.eu/.',
          'You can also manage cookies through your browser settings. Blocking cookies may affect Site features and ad relevance.',
          'Where required by law, we will request your consent before placing non-essential cookies or processing data for personalized advertising in your region.',
        ],
      },
      {
        id: 'privacy-analytics',
        title: 'Analytics',
        paragraphs: [
          'We may use analytics services to understand how visitors use the Site (for example, page views and referrers). Analytics providers may set their own cookies or collect pseudonymous usage data subject to their privacy policies.',
          'When enabled, we use Vercel Analytics to measure performance and usage in a privacy-oriented manner. You can review Vercel\'s privacy practices at https://vercel.com/legal/privacy-policy.',
        ],
      },
      {
        id: 'privacy-sharing',
        title: 'How we share information',
        paragraphs: [
          'We do not sell your personal information for money. We may share information with:',
          'Service providers that host the Site, deliver email, process forms, provide analytics, or support advertising (including Google AdSense), under contractual obligations to use data only as directed.',
          'Law enforcement, regulators, courts, or other parties when we believe disclosure is required by law or necessary to protect rights, safety, and security.',
          'A successor entity in connection with a merger, acquisition, or asset sale, subject to this policy or a successor notice.',
          'Third-party websites linked from our articles or pages. Their practices are governed by their own policies, not this one.',
        ],
      },
      {
        id: 'privacy-retention',
        title: 'Data retention',
        paragraphs: [
          'We retain information only as long as needed for the purposes described in this policy, unless a longer period is required by law.',
          'Form submissions and correspondence are kept for a reasonable period to respond, maintain records, and resolve disputes. Server logs and analytics data are typically retained for a shorter period defined by our providers.',
        ],
      },
      {
        id: 'privacy-security',
        title: 'Security',
        paragraphs: [
          'We use reasonable administrative, technical, and organizational measures to protect information. No method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security.',
        ],
      },
      {
        id: 'privacy-rights',
        title: 'Your privacy rights',
        paragraphs: [
          'Depending on where you live, you may have rights to access, correct, delete, restrict, or object to certain processing of your personal information, and to data portability or withdrawal of consent.',
          'California residents may have additional rights under the California Consumer Privacy Act (CCPA/CPRA), including the right to know categories of personal information collected, request deletion, and opt out of "sale" or "sharing" as defined by California law. We do not sell personal information for monetary consideration. To exercise rights, email us at the address below with enough detail to verify your request.',
          'EEA/UK/Swiss users may lodge a complaint with a supervisory authority in addition to contacting us.',
          `To make a privacy request, contact ${contactEmail}. We may need to verify your identity before responding.`,
        ],
      },
      {
        id: 'privacy-children',
        title: "Children's privacy",
        paragraphs: [
          'The Site is not directed to children under 13 (or the minimum age required in your jurisdiction), and we do not knowingly collect personal information from children. If you believe a child has provided us personal information, contact us and we will take appropriate steps to delete it.',
        ],
      },
      {
        id: 'privacy-international',
        title: 'International visitors',
        paragraphs: [
          'If you access the Site from outside the United States, your information may be processed in the United States or other countries where our service providers operate. Those countries may have different data protection laws than your home country.',
        ],
      },
      {
        id: 'privacy-dnt',
        title: 'Do Not Track',
        paragraphs: [
          'Some browsers offer a "Do Not Track" signal. Because there is no uniform industry standard for responding to DNT signals, we do not currently alter our practices solely in response to DNT.',
        ],
      },
      {
        id: 'privacy-changes',
        title: 'Changes to this policy',
        paragraphs: [
          'We may update this Privacy Policy from time to time. The "Effective date" at the top reflects the latest revision. Material changes may be noted on the Site. Continued use after updates means you accept the revised policy.',
        ],
      },
      {
        id: 'privacy-contact',
        title: 'Contact us',
        paragraphs: [
          `Questions about this Privacy Policy or our data practices? Email ${contactEmail}.`,
          `For terms governing use of the Site, see our Terms and Conditions. For editorial or commercial inquiries, use the Contact and Advertise pages.`,
        ],
      },
    ],
    [siteName, contactEmail, siteAddress],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return sections
    return sections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.paragraphs.some((p) => p.toLowerCase().includes(q)),
    )
  }, [sections, search])

  function handlePrint() {
    setPrintMode(true)
    window.requestAnimationFrame(() => {
      window.print()
    })
  }

  useEffect(() => {
    const onAfterPrint = () => setPrintMode(false)
    window.addEventListener('afterprint', onAfterPrint)
    return () => window.removeEventListener('afterprint', onAfterPrint)
  }, [])

  return (
    <main className={`container page-shell page-terms${printMode ? ' page-terms--print' : ''}`}>
      <header className="page-hero page-hero--legal">
        <p className="page-kicker">Legal</p>
        <h1 className="page-title">Privacy Policy</h1>
        <p className="page-lead">
          How {siteName} collects and uses information on this Site, including cookies and advertising through Google
          AdSense. Effective date: {EFFECTIVE_DATE}.
        </p>
        <div className="page-hero-actions">
          <button type="button" className="page-btn page-btn--primary" onClick={handlePrint}>
            Print / save PDF
          </button>
          <Link to="/contact-us" className="page-btn page-btn--ghost">
            Privacy questions
          </Link>
        </div>
      </header>

      <div className="page-terms-toolbar" role="region" aria-label="Privacy policy tools">
        <label className="page-search">
          <span className="sr-only">Search within privacy policy</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search policy…"
            autoComplete="off"
          />
        </label>
        {search.trim() ? (
          <p className="page-terms-meta">
            Showing {filtered.length} of {sections.length} sections
          </p>
        ) : (
          <p className="page-terms-meta">Effective {EFFECTIVE_DATE}. Includes Google AdSense and cookie disclosures.</p>
        )}
      </div>

      <div className="page-terms-layout">
        <nav className="page-toc" aria-label="Table of contents">
          <h2 className="page-toc-title">On this page</h2>
          <ol>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ol>
          <p className="page-toc-note">
            Related: <Link to="/terms-and-conditions">Terms and Conditions</Link>
          </p>
        </nav>

        <article className="page-terms-body" aria-label="Privacy policy text">
          {filtered.length === 0 ? (
            <p className="page-empty">No sections match your search. Clear the filter to see everything.</p>
          ) : (
            filtered.map((s) => (
              <section key={s.id} id={s.id} className="terms-section">
                <h2 className="terms-section-title">{s.title}</h2>
                {s.paragraphs.map((text) => (
                  <p key={text.slice(0, 48)}>{text}</p>
                ))}
              </section>
            ))
          )}
        </article>
      </div>

      <footer className="page-terms-footer">
        <p>
          Advertising on this Site is served in part through Google AdSense. See the Cookies and Google AdSense section
          above for opt-out links. General terms: <Link to="/terms-and-conditions">Terms and Conditions</Link>.
        </p>
      </footer>
    </main>
  )
}
