import { Link } from 'react-router-dom'
import { getCategoryPath, loadCategories } from '../../admin/storage'

export default function AdminQuickLinksPage() {
  const managedCategories = loadCategories()

  return (
    <section className="admin-panel-card admin-quick-links" aria-label="Admin quick links">
      <h2>Quick Access</h2>
      <div>
        <Link to="/">View Landing Page</Link>
        {managedCategories.map((cat) => (
          <Link key={cat} to={getCategoryPath(cat)}>
            {cat} Section
          </Link>
        ))}
      </div>
    </section>
  )
}
