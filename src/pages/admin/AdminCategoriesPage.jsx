import { useCallback, useEffect, useState } from 'react'
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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [editingSlug, setEditingSlug] = useState(null)
  const [editingDraft, setEditingDraft] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [message, setMessage] = useState('')

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

  const startEditing = (row) => {
    setEditingSlug(row.slug)
    setEditingDraft({ ...row })
  }

  const saveEditing = async () => {
    if (!editingDraft || !editingSlug) return
    const name = editingDraft.name.trim()
    const slug = slugifyCategoryName(editingDraft.slug || name)
    if (!name || !slug) return

    if (categories.some((c) => c.slug !== editingSlug && c.slug === slug)) {
      setMessage('Another category already uses that slug.')
      return
    }

    if (supabase) {
      if (slug !== editingSlug) {
        await deleteCategoryFromDatabase(editingSlug)
      }
      const { ok } = await upsertCategoryToDatabase({ ...editingDraft, name, slug })
      if (!ok) return
    } else {
      const names = loadCategories().map((n) =>
        slugifyCategoryName(n) === editingSlug ? name : n,
      )
      saveCategories(names)
    }

    setEditingSlug(null)
    setEditingDraft(null)
    setMessage('Category updated.')
    refresh()
  }

  const handleDelete = async (slug) => {
    if (!window.confirm('Delete this category?')) return
    if (supabase) {
      await deleteCategoryFromDatabase(slug)
    } else {
      saveCategories(loadCategories().filter((n) => slugifyCategoryName(n) !== slug))
    }
    setMessage('Category deleted.')
    refresh()
  }

  return (
    <section className="admin-panel-card admin-categories" aria-label="Categories management">
      <div className="admin-post-list-head">
        <h2>Categories Management</h2>
        <Link className="btn-secondary" to="/admin/add-category">
          Add category
        </Link>
      </div>

      {loading ? <p className="page-empty">Loading categories…</p> : null}

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
            {categories.map((row) => (
              <tr key={row.slug}>
                <td data-label="Name">
                  {editingSlug === row.slug ? (
                    <input
                      type="text"
                      value={editingDraft?.name || ''}
                      onChange={(e) => setEditingDraft((p) => ({ ...p, name: e.target.value }))}
                    />
                  ) : (
                    <strong>{row.name}</strong>
                  )}
                </td>
                <td data-label="Slug">
                  {editingSlug === row.slug ? (
                    <input
                      type="text"
                      value={editingDraft?.slug || ''}
                      onChange={(e) =>
                        setEditingDraft((p) => ({
                          ...p,
                          slug: slugifyCategoryName(e.target.value),
                        }))
                      }
                    />
                  ) : (
                    <code>{row.slug}</code>
                  )}
                </td>
                <td data-label="Path">{row.routePath}</td>
                <td data-label="Order">{row.sortOrder}</td>
                <td data-label="Status">{row.isActive ? 'Active' : 'Hidden'}</td>
                <td data-label="Actions">
                  {editingSlug === row.slug ? (
                    <div className="admin-post-item-actions">
                      <button type="button" onClick={() => void saveEditing()}>
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setEditingSlug(null)
                          setEditingDraft(null)
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="admin-post-item-actions">
                      <button type="button" onClick={() => startEditing(row)}>
                        Edit
                      </button>
                      <button type="button" className="btn-danger" onClick={() => void handleDelete(row.slug)}>
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {message ? <p className="admin-auth-hint">{message}</p> : null}
    </section>
  )
}
