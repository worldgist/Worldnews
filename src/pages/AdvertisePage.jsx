import { Link } from 'react-router-dom'

export default function AdvertisePage() {
  return (
    <main className="container static-page">
      <p className="kicker">Advertise</p>
      <h1>Advertise With World Gist News</h1>
      <p>
        Reach a fast-growing audience across world, politics, sports, school,
        technology, and entertainment coverage.
      </p>
      <p>
        For media kits, sponsorship placements, branded features, and campaign
        partnerships, contact our commercial team.
      </p>
      <div className="contact-meta">
        <p>Email: ads@worldgistnews.com</p>
        <p>Response Time: Within 1-2 business days</p>
      </div>
      <Link className="read-more" to="/contact-us">
        Contact Us
      </Link>
    </main>
  )
}
