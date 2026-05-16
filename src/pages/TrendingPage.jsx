import { Link } from 'react-router-dom'
import PopularPostsBand from '../components/PopularPostsBand'
import { usePublicFeed } from '../hooks/usePublicFeed'

export default function TrendingPage() {
  const { articles } = usePublicFeed()
  return (
    <main className="container">
      <header className="trending-page-head">
        <p className="kicker">Rankings</p>
        <h1>Trending</h1>
        <p className="trending-page-head__lede">
          A focused view of what readers are engaging with most right now.
        </p>
        <Link className="read-more trending-page-head__back" to="/">
          Back to homepage
        </Link>
      </header>

      <PopularPostsBand limit={5} articles={articles} />
    </main>
  )
}
