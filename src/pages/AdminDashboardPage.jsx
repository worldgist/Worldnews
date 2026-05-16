import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DEFAULT_PROFILE } from '../admin/storage'
import CmsImageUploadField from '../components/CmsImageUploadField'
import { useAdminAuth } from '../context/AdminAuthContext'
import { articles, categories } from '../data/feed'

const CATEGORY_STORAGE_KEY = 'worldnews-admin-categories'
const POST_STORAGE_KEY = 'worldnews-admin-posts'
const SETTINGS_STORAGE_KEY = 'worldnews-admin-settings'
const PROFILE_STORAGE_KEY = 'worldnews-admin-profile'

const DEFAULT_SETTINGS = {
  siteName: 'World Gist News',
  siteTagline: 'Trusted updates across world, politics, sports, school, and technology.',
  siteAddress: '2654 SE 62nd Ave, Bronx, NY 10458, United States',
  contactEmail: 'newsroom@worldgistnews.com',
  copyrightText: '(c) 2026 World Gist News.',
}

const ADMIN_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'add-category', label: 'Add Category' },
  { id: 'categories', label: 'Categories Management' },
  { id: 'posts', label: 'News Post Editor' },
  { id: 'profile', label: 'Admin Profile' },
  { id: 'settings', label: 'Admin Settings' },
  { id: 'quick-links', label: 'Quick Access' },
]

function getCategoryPath(category) {
  const slug = category.toLowerCase().replace(/\s+/g, '-')
  const dedicatedRoutes = {
    world: '/world-news',
    politics: '/politics-news',
    sports: '/sports-news',
    school: '/school-news',
    technology: '/technology-news',
  }

  return dedicatedRoutes[slug] || `/category/${slug}`
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { signOut } = useAdminAuth()
  const [managedCategories, setManagedCategories] = useState(categories)
  const [newCategory, setNewCategory] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingValue, setEditingValue] = useState('')
  const [adminPosts, setAdminPosts] = useState([])
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [profileDraft, setProfileDraft] = useState(DEFAULT_PROFILE)
  const [editingProfile, setEditingProfile] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')
  const [postForm, setPostForm] = useState({
    title: '',
    category: categories[0] || 'World',
    summary: '',
    body: '',
    author: 'worldgistnews',
    image: '',
    readTime: '4 min',
    featured: false,
  })

  useEffect(() => {
    const saved = localStorage.getItem(CATEGORY_STORAGE_KEY)
    if (!saved) return

    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        setManagedCategories(parsed)
      }
    } catch {
      // Ignore malformed local category settings and keep defaults.
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(managedCategories))
  }, [managedCategories])

  useEffect(() => {
    const saved = localStorage.getItem(POST_STORAGE_KEY)
    if (!saved) return

    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        setAdminPosts(parsed)
      }
    } catch {
      // Ignore malformed local posts settings.
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(POST_STORAGE_KEY, JSON.stringify(adminPosts))
  }, [adminPosts])

  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!saved) return

    try {
      const parsed = JSON.parse(saved)
      if (parsed && typeof parsed === 'object') {
        setSettings((prev) => ({ ...prev, ...parsed }))
      }
    } catch {
      // Ignore malformed local settings.
    }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!saved) return

    try {
      const parsed = JSON.parse(saved)
      if (parsed && typeof parsed === 'object') {
        const merged = { ...DEFAULT_PROFILE, ...parsed }
        setProfile(merged)
        setProfileDraft(merged)
      }
    } catch {
      // Ignore malformed profile settings.
    }
  }, [])

  const handleLogout = async () => {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  const handleAddCategory = (e) => {
    e.preventDefault()
    const nextName = newCategory.trim()
    if (!nextName) return

    const exists = managedCategories.some(
      (cat) => cat.toLowerCase() === nextName.toLowerCase()
    )
    if (exists) return

    setManagedCategories((prev) => [...prev, nextName])
    setNewCategory('')
  }

  const handleDeleteCategory = (categoryToRemove) => {
    setManagedCategories((prev) => prev.filter((cat) => cat !== categoryToRemove))
    if (editingCategory === categoryToRemove) {
      setEditingCategory(null)
      setEditingValue('')
    }
  }

  const startEditing = (categoryToEdit) => {
    setEditingCategory(categoryToEdit)
    setEditingValue(categoryToEdit)
  }

  const saveEditing = () => {
    const nextName = editingValue.trim()
    if (!editingCategory || !nextName) return

    const exists = managedCategories.some(
      (cat) => cat !== editingCategory && cat.toLowerCase() === nextName.toLowerCase()
    )
    if (exists) return

    setManagedCategories((prev) =>
      prev.map((cat) => (cat === editingCategory ? nextName : cat))
    )
    setEditingCategory(null)
    setEditingValue('')
  }

  const handlePostFormChange = (field, value) => {
    setPostForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCreatePost = (e) => {
    e.preventDefault()

    const title = postForm.title.trim()
    const summary = postForm.summary.trim()
    const body = postForm.body.trim()
    if (!title || !summary || !body) return

    const newPost = {
      id: `${title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')}-${Date.now()}`,
      title,
      category: postForm.category,
      summary,
      body: body
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      author: postForm.author.trim() || 'worldgistnews',
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      readTime: postForm.readTime.trim() || '4 min',
      image:
        postForm.image.trim() ||
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80',
      featured: postForm.featured,
    }

    setAdminPosts((prev) => [newPost, ...prev])
    setPostForm((prev) => ({
      ...prev,
      title: '',
      summary: '',
      body: '',
      image: '',
      featured: false,
    }))
  }

  const handleDeletePost = (postId) => {
    setAdminPosts((prev) => prev.filter((post) => post.id !== postId))
  }

  const handleSettingChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveSettings = (e) => {
    e.preventDefault()
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    alert('Admin settings saved successfully.')
  }

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS))
  }

  const handleProfileChange = (field, value) => {
    setProfileDraft((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    const nextProfile = {
      fullName: profileDraft.fullName.trim() || DEFAULT_PROFILE.fullName,
      email: profileDraft.email.trim() || DEFAULT_PROFILE.email,
      role: profileDraft.role.trim() || DEFAULT_PROFILE.role,
      bio: profileDraft.bio.trim() || DEFAULT_PROFILE.bio,
    }

    setProfile(nextProfile)
    setProfileDraft(nextProfile)
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile))
    setEditingProfile(false)
  }

  const handleCancelProfileEdit = () => {
    setProfileDraft(profile)
    setEditingProfile(false)
  }

  return (
    <main className="container static-page admin-dashboard-page">
      <div className="admin-dashboard-head">
        <div>
          <p className="kicker">Admin Panel</p>
          <h1>Admin Dashboard</h1>
          <p>Manage content sections and monitor publication activity.</p>
        </div>
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="admin-layout">
        <aside className="admin-sidebar" aria-label="Admin dashboard menu">
          {ADMIN_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className={activeSection === section.id ? 'active' : ''}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </aside>

        <section className="admin-main-panel" aria-label="Admin dashboard content">
          {activeSection === 'overview' && (
            <section className="admin-metrics" aria-label="Dashboard metrics">
              <article>
                <h2>{articles.length}</h2>
                <p>Total Articles</p>
              </article>
              <article>
                <h2>{managedCategories.length}</h2>
                <p>Active Categories</p>
              </article>
              <article>
                <h2>{articles.filter((story) => story.featured).length}</h2>
                <p>Featured Stories</p>
              </article>
            </section>
          )}

          {activeSection === 'add-category' && (
            <section className="admin-categories" aria-label="Add category">
              <h3>Add Category</h3>
              <form className="admin-categories-form" onSubmit={handleAddCategory}>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter category name"
                />
                <button type="submit">Create Category</button>
              </form>
              <p className="admin-auth-hint">New categories are saved to your admin local settings.</p>
            </section>
          )}

          {activeSection === 'profile' && (
            <section className="admin-profile" aria-label="Admin profile">
              <div className="admin-profile-head">
                <h3>Admin Profile</h3>
                {!editingProfile && (
                  <button type="button" onClick={() => setEditingProfile(true)}>
                    Edit Profile
                  </button>
                )}
              </div>

              {editingProfile ? (
                <form className="admin-profile-form" onSubmit={handleSaveProfile}>
                  <label htmlFor="adminProfileName">Full Name</label>
                  <input
                    id="adminProfileName"
                    type="text"
                    value={profileDraft.fullName}
                    onChange={(e) => handleProfileChange('fullName', e.target.value)}
                    required
                  />

                  <label htmlFor="adminProfileEmail">Email</label>
                  <input
                    id="adminProfileEmail"
                    type="email"
                    value={profileDraft.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    required
                  />

                  <label htmlFor="adminProfileRole">Role</label>
                  <input
                    id="adminProfileRole"
                    type="text"
                    value={profileDraft.role}
                    onChange={(e) => handleProfileChange('role', e.target.value)}
                    required
                  />

                  <label htmlFor="adminProfileBio">Bio</label>
                  <textarea
                    id="adminProfileBio"
                    rows={3}
                    value={profileDraft.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                  />

                  <div className="admin-profile-actions">
                    <button type="submit">Save Profile</button>
                    <button type="button" className="btn-secondary" onClick={handleCancelProfileEdit}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="admin-profile-view">
                  <p>
                    <strong>Name:</strong> {profile.fullName}
                  </p>
                  <p>
                    <strong>Email:</strong> {profile.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {profile.role}
                  </p>
                  <p>
                    <strong>Bio:</strong> {profile.bio}
                  </p>
                </div>
              )}
            </section>
          )}

          {activeSection === 'categories' && (
            <section className="admin-categories" aria-label="Categories management">
              <h3>Categories Management</h3>
              <form className="admin-categories-form" onSubmit={handleAddCategory}>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add new category"
                />
                <button type="submit">Add Category</button>
              </form>

              <ul className="admin-categories-list">
                {managedCategories.map((cat) => (
                  <li key={cat}>
                    {editingCategory === cat ? (
                      <>
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          aria-label={`Edit category ${cat}`}
                        />
                        <button type="button" onClick={saveEditing}>Save</button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => {
                            setEditingCategory(null)
                            setEditingValue('')
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span>{cat}</span>
                        <button type="button" onClick={() => startEditing(cat)}>Edit</button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => handleDeleteCategory(cat)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {activeSection === 'posts' && (
            <section className="admin-post-editor" aria-label="News post editor">
              <h3>News Post Editor</h3>
              <form className="admin-post-form" onSubmit={handleCreatePost}>
                <input
                  type="text"
                  value={postForm.title}
                  onChange={(e) => handlePostFormChange('title', e.target.value)}
                  placeholder="Post title"
                  required
                />

                <select
                  value={postForm.category}
                  onChange={(e) => handlePostFormChange('category', e.target.value)}
                >
                  {managedCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={postForm.author}
                  onChange={(e) => handlePostFormChange('author', e.target.value)}
                  placeholder="Author"
                />

                <input
                  type="text"
                  value={postForm.readTime}
                  onChange={(e) => handlePostFormChange('readTime', e.target.value)}
                  placeholder="Read time (e.g. 4 min)"
                />

                <CmsImageUploadField
                  label="Featured image"
                  value={postForm.image}
                  onChange={(url) => handlePostFormChange('image', url)}
                  variant="post"
                  hint="Upload to Supabase Storage or paste an external URL."
                />

                <textarea
                  value={postForm.summary}
                  onChange={(e) => handlePostFormChange('summary', e.target.value)}
                  placeholder="Short summary"
                  rows={3}
                  required
                />

                <textarea
                  value={postForm.body}
                  onChange={(e) => handlePostFormChange('body', e.target.value)}
                  placeholder="Full story body (one paragraph per line)"
                  rows={6}
                  required
                />

                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={postForm.featured}
                    onChange={(e) => handlePostFormChange('featured', e.target.checked)}
                  />
                  Mark as featured
                </label>

                <button type="submit">Save Post</button>
              </form>

              <div className="admin-post-list">
                <h4>Saved Admin Posts ({adminPosts.length})</h4>
                {adminPosts.length === 0 ? (
                  <p>No admin posts yet.</p>
                ) : (
                  <ul>
                    {adminPosts.map((post) => (
                      <li key={post.id}>
                        <div>
                          <strong>{post.title}</strong>
                          <p>
                            {post.category} | {post.author} | {post.date}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}

          {activeSection === 'quick-links' && (
            <section className="admin-quick-links" aria-label="Admin quick links">
              <h3>Quick Access</h3>
              <div>
                <Link to="/">View Landing Page</Link>
                {managedCategories.map((cat) => (
                  <Link key={cat} to={getCategoryPath(cat)}>
                    {cat} Section
                  </Link>
                ))}
              </div>
            </section>
          )}

          {activeSection === 'settings' && (
            <section className="admin-settings" aria-label="Admin settings">
              <h3>Admin Settings</h3>
              <form className="admin-settings-form" onSubmit={handleSaveSettings}>
                <label htmlFor="siteNameInput">Website Name</label>
                <input
                  id="siteNameInput"
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  required
                />

                <label htmlFor="siteTaglineInput">Website Tagline</label>
                <textarea
                  id="siteTaglineInput"
                  rows={2}
                  value={settings.siteTagline}
                  onChange={(e) => handleSettingChange('siteTagline', e.target.value)}
                />

                <label htmlFor="contactEmailInput">Contact Email</label>
                <input
                  id="contactEmailInput"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                />

                <label htmlFor="copyrightInput">Footer Copyright Text</label>
                <input
                  id="copyrightInput"
                  type="text"
                  value={settings.copyrightText}
                  onChange={(e) => handleSettingChange('copyrightText', e.target.value)}
                />

                <div className="admin-settings-actions">
                  <button type="submit">Save Settings</button>
                  <button type="button" className="btn-secondary" onClick={handleResetSettings}>
                    Reset Defaults
                  </button>
                </div>
              </form>
            </section>
          )}
        </section>
      </div>
    </main>
  )
}
