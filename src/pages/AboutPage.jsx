import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <main className="container static-page">
      <p className="kicker">About Us</p>
      <h1>About World Gist News</h1>
      <p>
        World Gist News is a digital publication focused on reliable reporting,
        global context, and accessible storytelling for everyday readers.
      </p>
      <p>
        Our editorial team covers politics, world affairs, technology, school
        development, and community impact stories with a strong emphasis on
        clarity and public value.
      </p>
      <p>
        We believe quality journalism should be easy to navigate, easy to
        understand, and available on any device.
      </p>

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
