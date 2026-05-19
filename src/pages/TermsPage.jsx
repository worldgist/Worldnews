import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DEFAULT_SETTINGS } from '../admin/storage'
import { useSiteSettings } from '../hooks/useSiteSettings'

const EFFECTIVE_DATE = 'May 16, 2026'
const ADSENSE_PUBLISHER_ID = 'ca-pub-7542401782946817'
const SITE_URL = 'https://worldgistnews.com'

export default function TermsPage() {
  const { settings } = useSiteSettings()
  const [search, setSearch] = useState('')
  const [printMode, setPrintMode] = useState(false)

  const siteName = settings.siteName?.trim() || DEFAULT_SETTINGS.siteName
  const contactEmail = settings.contactEmail?.trim() || DEFAULT_SETTINGS.contactEmail
  const commercialEmail = settings.commercialEmail?.trim() || DEFAULT_SETTINGS.commercialEmail
  const siteAddress = settings.siteAddress?.trim() || DEFAULT_SETTINGS.siteAddress

  const sections = useMemo(
    () => [
      {
        id: 'terms-intro',
        title: 'Agreement to these terms',
        paragraphs: [
          `These Terms and Conditions ("Terms") govern your access to and use of ${SITE_URL} and related pages operated by ${siteName} ("we," "us," or "our") (collectively, the "Site").`,
          'By accessing or using the Site, you agree to these Terms and to our Privacy Policy. If you do not agree, you must not use the Site.',
          `Effective date: ${EFFECTIVE_DATE}. Please read these Terms together with our Privacy Policy, which explains how we collect and use information, including through cookies and advertising technologies.`,
        ],
      },
      {
        id: 'terms-publisher',
        title: 'Publisher information',
        paragraphs: [
          `${siteName} publishes news and informational content for general audiences.`,
          siteAddress
            ? `Business address: ${siteAddress}.`
            : 'Our business address is listed on the Site footer when available.',
          `Editorial and general inquiries: ${contactEmail}. Commercial and advertising inquiries: ${commercialEmail}.`,
        ],
      },
      {
        id: 'terms-eligibility',
        title: 'Eligibility',
        paragraphs: [
          'You must be able to form a binding contract in your jurisdiction to use interactive features of the Site. The Site is not directed to children under 13, and we do not knowingly collect personal information from children as described in our Privacy Policy.',
          'If you use the Site on behalf of an organization, you represent that you have authority to bind that organization to these Terms.',
        ],
      },
      {
        id: 'terms-use',
        title: 'Permitted use',
        paragraphs: [
          'We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Site for personal, non-commercial reading and sharing of links, unless we agree otherwise in writing.',
          'You may not use the Site in any way that violates applicable law, infringes intellectual property or privacy rights, or interferes with the Site’s operation or security.',
        ],
      },
      {
        id: 'terms-prohibited',
        title: 'Prohibited conduct',
        paragraphs: [
          'You agree not to:',
          'Copy, scrape, harvest, or redistribute substantial portions of the Site or its content by automated means without our prior written permission, except as allowed by law or standard search-engine indexing.',
          'Attempt to gain unauthorized access to accounts, servers, or data connected to the Site.',
          'Upload or transmit malware, spam, or content that is unlawful, defamatory, harassing, hateful, or otherwise objectionable through forms, comments, or other interactive features.',
          'Impersonate any person or entity or misrepresent your affiliation.',
          'Use the Site to send unsolicited commercial messages or to collect personal information about other users without consent.',
          'Circumvent advertising, paywall, or access controls where implemented.',
        ],
      },
      {
        id: 'terms-content',
        title: 'Editorial content and disclaimers',
        paragraphs: [
          'Articles, summaries, headlines, images, videos, and other materials on the Site are provided for general information and news purposes only.',
          'We strive for accuracy and timely reporting, but we do not warrant that content is complete, current, or error-free. Facts and circumstances change; you should verify important information independently.',
          'Nothing on the Site constitutes legal, financial, medical, investment, or other professional advice tailored to your situation. Seek qualified professionals before making decisions based on news coverage.',
          'Opinion pieces, columns, and third-party commentary reflect the views expressed by their authors and do not necessarily represent the views of our entire newsroom unless clearly labeled as an official editorial position.',
        ],
      },
      {
        id: 'terms-ip',
        title: 'Intellectual property',
        paragraphs: [
          `Unless otherwise noted, the Site design, branding, selection, arrangement, and original editorial content are owned by ${siteName} or our licensors and are protected by copyright, trademark, and other laws.`,
          'You may share links to our pages and quote brief excerpts with clear attribution and a link to the original article where appropriate. Republication, syndication, or commercial reuse requires our prior written permission unless clearly permitted by law.',
          'Trademarks, logos, and service marks displayed on the Site are the property of their respective owners.',
        ],
      },
      {
        id: 'terms-submissions',
        title: 'User submissions and tips',
        paragraphs: [
          'If you submit news tips, story ideas, corrections, contact form messages, advertising inquiries, or other materials ("Submissions"), you represent that you have the right to provide them and that they are accurate to the best of your knowledge.',
          'You grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, adapt, publish, and display Submissions for editorial, operational, and promotional purposes related to the Site, subject to our Privacy Policy.',
          'We are under no obligation to publish, respond to, or compensate for unsolicited Submissions unless we have a separate written agreement with you.',
        ],
      },
      {
        id: 'terms-comments',
        title: 'Comments and community features',
        paragraphs: [
          'When comment or community features are enabled, you are solely responsible for content you post. We may moderate, remove, or disable comments at our discretion, including content that violates these Terms, our editorial standards, or applicable law.',
          'Do not post personal data about others without permission. We may retain copies of removed content where required for legal or security purposes.',
        ],
      },
      {
        id: 'terms-third-party',
        title: 'Third-party links and services',
        paragraphs: [
          'The Site may contain links to third-party websites, embeds, or services. We do not control and are not responsible for their content, policies, or availability.',
          'Your use of third-party services is governed by their terms and privacy policies. This includes advertising and analytics partners described in our Privacy Policy.',
        ],
      },
      {
        id: 'terms-ads',
        title: 'Advertising and Google AdSense',
        paragraphs: [
          'The Site is supported in part by advertising. Ads may be served by us or by third-party networks, including Google AdSense (Google LLC).',
          `Our Google AdSense publisher identifier is ${ADSENSE_PUBLISHER_ID}. Third-party vendors, including Google, may use cookies to serve ads based on your prior visits to this Site or other websites.`,
          'Advertising on the Site does not constitute an endorsement of advertised products or services unless we clearly state otherwise. Sponsored or paid content will be labeled when required by law or our editorial policy.',
          'Direct advertising, sponsorship packages, and insertion orders may be governed by separate agreements in addition to these Terms. For rates and availability, contact us through the Advertise page.',
          'For cookie practices, personalized advertising choices, and opt-out links, see our Privacy Policy.',
        ],
      },
      {
        id: 'terms-privacy',
        title: 'Privacy',
        paragraphs: [
          `Our Privacy Policy at ${SITE_URL}/privacy-policy explains what information we collect, how we use it, and your rights. By using the Site, you acknowledge that you have read the Privacy Policy.`,
        ],
      },
      {
        id: 'terms-dmca',
        title: 'Copyright complaints',
        paragraphs: [
          'If you believe content on the Site infringes your copyright, send a notice with sufficient detail to identify the work, the material at issue, your contact information, and a statement of good-faith belief to our contact email.',
          'We may remove or disable access to allegedly infringing material and terminate repeat infringers where appropriate.',
        ],
      },
      {
        id: 'terms-warranty',
        title: 'Disclaimer of warranties',
        paragraphs: [
          'THE SITE AND ALL CONTENT ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT, TO THE FULLEST EXTENT PERMITTED BY LAW.',
          'We do not warrant uninterrupted or secure operation of the Site or that defects will be corrected.',
        ],
      },
      {
        id: 'terms-liability',
        title: 'Limitation of liability',
        paragraphs: [
          'TO THE FULLEST EXTENT PERMITTED BY LAW, WE AND OUR OFFICERS, DIRECTORS, EMPLOYEES, CONTRACTORS, AND LICENSORS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SITE.',
          'OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF THESE TERMS OR THE SITE WILL NOT EXCEED ONE HUNDRED U.S. DOLLARS (US$100) OR THE AMOUNT YOU PAID US IN THE TWELVE MONTHS BEFORE THE CLAIM, WHICHEVER IS GREATER, EXCEPT WHERE LIABILITY CANNOT BE LIMITED BY LAW.',
        ],
      },
      {
        id: 'terms-indemnity',
        title: 'Indemnification',
        paragraphs: [
          'You agree to defend, indemnify, and hold harmless us and our affiliates from claims, damages, losses, and expenses (including reasonable attorneys’ fees) arising from your misuse of the Site, your Submissions, or your violation of these Terms or applicable law.',
        ],
      },
      {
        id: 'terms-law',
        title: 'Governing law and disputes',
        paragraphs: [
          'These Terms are governed by the laws of the State of New York, United States, without regard to conflict-of-law principles, except where mandatory consumer protection laws in your country of residence apply.',
          'You agree that courts located in New York County, New York will have exclusive jurisdiction over disputes arising from these Terms or the Site, unless applicable law requires otherwise.',
          'Before filing a formal claim, you agree to contact us and attempt to resolve the dispute informally in good faith.',
        ],
      },
      {
        id: 'terms-changes',
        title: 'Changes to these Terms',
        paragraphs: [
          'We may update these Terms from time to time. The effective date at the top indicates the latest version. Material changes may be noted on the Site. Continued use after updates constitutes acceptance of the revised Terms.',
        ],
      },
      {
        id: 'terms-contact',
        title: 'Contact',
        paragraphs: [
          `Questions about these Terms? Email ${contactEmail}.`,
          `Privacy and data requests: see our Privacy Policy or email ${contactEmail}.`,
        ],
      },
    ],
    [siteName, contactEmail, commercialEmail, siteAddress],
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
        <h1 className="page-title">Terms and conditions</h1>
        <p className="page-lead">
          Rules for using {siteName}, including editorial disclaimers, user conduct, advertising, and Google AdSense on
          this Site. Effective date: {EFFECTIVE_DATE}.
        </p>
        <div className="page-hero-actions">
          <button type="button" className="page-btn page-btn--primary" onClick={handlePrint}>
            Print / save PDF
          </button>
          <Link to="/contact-us" className="page-btn page-btn--ghost">
            Questions? Contact us
          </Link>
        </div>
      </header>

      <div className="page-terms-toolbar" role="region" aria-label="Terms tools">
        <label className="page-search">
          <span className="sr-only">Search within terms</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search terms…"
            autoComplete="off"
          />
        </label>
        {search.trim() ? (
          <p className="page-terms-meta">
            Showing {filtered.length} of {sections.length} sections
          </p>
        ) : (
          <p className="page-terms-meta">
            Effective {EFFECTIVE_DATE}. Read with our <Link to="/privacy-policy">Privacy Policy</Link>.
          </p>
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
            Related: <Link to="/privacy-policy">Privacy Policy</Link>
          </p>
        </nav>

        <article className="page-terms-body" aria-label="Terms text">
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
          See our <Link to="/privacy-policy">Privacy Policy</Link> for cookies, Google AdSense, and data practices. For
          questions, <Link to="/contact-us">contact us</Link>. Direct advertising may also be governed by separate
          insertion orders.
        </p>
      </footer>
    </main>
  )
}
