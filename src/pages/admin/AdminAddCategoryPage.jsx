import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadCategories, saveCategories } from '../../admin/storage'
import { CMS_SYNC_EVENT } from '../../lib/cmsEvents'
import {
  defaultRouteForSlug,
  deleteCategoryFromDatabase,
  fetchCategoriesFromDatabase,
  slugifyCategoryName,
  upsertCategoryToDatabase,
} from '../../lib/adminCategoriesApi'
import { supabase } from '../../lib/supabaseClient'

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  routePath: '',
  sortOrder: 0,
  isActive: true,
}

export default function AdminAddCategoryPage() {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [saveError, setSaveError] = useState('')

  const refresh = useCallback(() => {
    if (!supabase) {
      setCategories(
        loadCategories().map((name, index) => ({
          slug: slugifyCategoryName(name),
          name,
          description: '',
          routePath: defaultRouteForSlug(slugifyCategoryName(name)),
          sortOrder: index + 1,
          isActive: true,
        })),
      )
      setLoading(false)
      return
    }

    void fetchCategoriesFromDatabase().then(({ categories: rows, fromDatabase }) => {
      if (fromDatabase && rows.length) {
        setCategories(rows)
      } else {
        setCategories(
          loadCategories().map((name, index) => ({
            slug: slugifyCategoryName(name),
            name,
            description: '',
            routePath: defaultRouteForSlug(slugifyCategoryName(name)),
            sortOrder: index + 1,
            isActive: true,
          })),
        )
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    refresh()
    const onSync = () => refresh()
    window.addEventListener(CMS_SYNC_EVENT, onSync)
    window.addEventListener('worldnews-admin-storage', onSync)
    return () => {
      window.removeEventListener(CMS_SYNC_EVENT, onSync)
      window.removeEventListener('worldnews-admin-storage', onSync)
    }
  }, [refresh])

  const stats = useMemo(() => {
    const active = categories.filter((c) => c.isActive).length
    return { total: categories.length, active, hidden: categories.length - active }
  }, [categories])

  const handleNameChange = (name) => {
    const slug = slugifyCategoryName(name)
    setForm((prev) => ({
      ...prev,
      name,
      slug: prev.slug && prev.slug !== slugifyCategoryName(prev.name) ? prev.slug : slug,
      routePath: prev.routePath || defaultRouteForSlug(slug),
    }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaveError('')
    setMessage('')

    const name = form.name.trim()
    const slug = slugifyCategoryName(form.slug || name)
    if (!name || !slug) {
      setSaveError('Enter a valid category name.')
      return
    }

    if (categories.some((c) => c.slug === slug)) {
      setSaveError('A category with this slug already exists.')
      return
    }

    setSaving(true)
    const record = {
      name,
      slug,
      description: form.description.trim(),
      routePath: form.routePath.trim() || defaultRouteForSlug(slug),
      sortOrder: Number(form.sortOrder) || categories.length + 1,
      isActive: form.isActive,
    }

    if (supabase) {
      const { ok, error, categories: next } = await upsertCategoryToDatabase(record)
      if (!ok) {
        setSaveError(error || 'Could not save category.')
        setSaving(false)
        return
      }
      if (next?.length) setCategories(next)
    } else {
      const names = [...loadCategories(), name]
      saveCategories(names)
      refresh()
    }

    setForm(emptyForm)
    setSaving(false)
    setMessage(`Category “${name}” created.`)
  }

  const handleToggleActive = async (row) => {
    const next = { ...row, isActive: !row.isActive }
    if (supabase) {
      const { ok } = await upsertCategoryToDatabase(next)
      if (ok) refresh()
    }
  }

  const handleDelete = async (slug) => {
    if (!window.confirm('Delete this category? Posts keep their category label.')) return
    if (supabase) {
      const { ok } = await deleteCategoryFromDatabase(slug)
      if (ok) refresh()
    } else {
      const names = loadCategories().filter((n) => slugifyCategoryName(n) !== slug)
      saveCategories(names)
      refresh()
    }
    setMessage('Category removed.')
  }

  return (
    <section className="admin-panel-card admin-categories" aria-label="Add category">
      <div className="admin-post-list-head">
        <h2>Add Category</h2>
        <div className="admin-post-item-actions">
          <button type="button" onClick={refresh} disabled={loading}>
            Refresh
          </button>
          <Link className="btn-secondary" to="/admin/categories">
            Manage all
          </Link>
        </div>
      </div>

      <div className="scheduled-queue-stats">
        <article>
          <strong>{stats.total}</strong>
          <span>Total</span>
        </article>
        <article>
          <strong>{stats.active}</strong>
          <span>Active</span>
        </article>
        <article>
          <strong>{stats.hidden}</strong>
          <span>Hidden</span>
        </article>
      </div>

      {loading ? <p className="page-empty">Loading categories…</p> : null}

      <form className="admin-category-create-form" onSubmit={handleCreate}>
        <h3>New category</h3>
        <div className="admin-category-create-grid">
          <label>
            Display name
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Business"
              required
            />
          </label>
          <label>
            URL slug
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: slugifyCategoryName(e.target.value) }))}
              placeholder="business"
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              required
            />
          </label>
          <label>
            Sort order
            <input
              type="number"
              min={0}
              max={999}
              value={form.sortOrder}
              onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
            />
          </label>
          <label>
            Public path
            <input
              type="text"
              value={form.routePath}
              onChange={(e) => setForm((p) => ({ ...p, routePath: e.target.value }))}
              placeholder={defaultRouteForSlug(form.slug || 'slug')}
            />
          </label>
          <label className="admin-category-span-2">
            Description (optional)
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Short label for admin reference"
            />
          </label>
          <label className="admin-checkbox admin-category-span-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
            />
            Show on site navigation and post editor
          </label>
        </div>
        <div className="admin-settings-actions">
          <button type="submit" disabled={saving || loading}>
            {saving ? 'Saving…' : 'Create Category'}
          </button>
        </div>
      </form>

      <div className="admin-social-table-wrap">
        <table className="admin-social-table admin-categories-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Slug</th>
              <th scope="col">Path</th>
              <th scope="col">Order</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-categories-empty">
                  No categories yet. Create one above.
                </td>
              </tr>
            ) : (
              categories.map((row) => (
                <tr key={row.slug} className={row.isActive ? '' : 'admin-categories-row--hidden'}>
                  <td data-label="Name">
                    <strong>{row.name}</strong>
                    {row.description ? <span className="admin-categories-desc">{row.description}</span> : null}
                  </td>
                  <td data-label="Slug">
                    <code>{row.slug}</code>
                  </td>
                  <td data-label="Path">
                    <a href={row.routePath} target="_blank" rel="noreferrer">
                      {row.routePath}
                    </a>
                  </td>
                  <td data-label="Order">{row.sortOrder}</td>
                  <td data-label="Status">{row.isActive ? 'Active' : 'Hidden'}</td>
                  <td data-label="Actions">
                    <div className="admin-post-item-actions">
                      <button type="button" onClick={() => void handleToggleActive(row)}>
                        {row.isActive ? 'Hide' : 'Show'}
                      </button>
                      <button type="button" className="btn-danger" onClick={() => void handleDelete(row.slug)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {saveError ? <p className="admin-auth-hint admin-auth-hint--error">{saveError}</p> : null}
      {message ? <p className="admin-auth-hint">{message}</p> : null}
    </section>
  )
}
