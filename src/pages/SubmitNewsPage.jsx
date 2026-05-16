import { Link } from 'react-router-dom'

export default function SubmitNewsPage() {
  return (
    <main className="container static-page">
      <p className="kicker">Submit News</p>
      <h1>Submit a News Tip</h1>
      <p>
        Have a verified story, tip, press release, or community update?
        Send it to our newsroom for editorial review.
      </p>
      <p>
        Include key facts, locations, dates, and supporting evidence where
        possible. Anonymous submissions are reviewed with extra verification.
      </p>
      <div className="contact-meta">
        <p>Email: tips@worldgistnews.com</p>
        <p>Desk Hours: Mon - Fri, 8:00AM - 6:00PM</p>
      </div>
      <Link className="read-more" to="/contact-us">
        Submit via Contact Form
      </Link>
    </main>
  )
}
