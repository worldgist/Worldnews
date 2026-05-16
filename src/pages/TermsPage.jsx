import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <main className="container static-page">
      <p className="kicker">Terms and Conditions</p>
      <h1>Terms and Conditions</h1>
      <p>
        By using World Gist News, you agree to these terms. If you do not agree,
        please discontinue use of this website.
      </p>

      <section className="static-section">
        <h2>Content Usage</h2>
        <p>
          All content is provided for information purposes only. Republishing,
          copying, or redistribution of materials without permission is
          prohibited unless otherwise stated.
        </p>
      </section>

      <section className="static-section">
        <h2>User Conduct</h2>
        <p>
          You agree not to misuse this site, disrupt services, or post harmful
          or unlawful content through forms or interactive features.
        </p>
      </section>

      <section className="static-section">
        <h2>External Links</h2>
        <p>
          Our pages may include links to external websites. We are not
          responsible for the content or policies of third-party services.
        </p>
      </section>

      <section className="static-section">
        <h2>Updates to Terms</h2>
        <p>
          We may revise these terms periodically. Continued use of the site
          after updates means you accept the revised version.
        </p>
      </section>

      <Link className="read-more" to="/">
        Back to homepage
      </Link>
    </main>
  )
}
