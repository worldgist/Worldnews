import { useEffect, useState } from 'react'
import { loadCategories, saveCategories } from '../../admin/storage'

export default function AdminCategoriesPage() {
  const [managedCategories, setManagedCategories] = useState(loadCategories())
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingValue, setEditingValue] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const sync = () => setManagedCategories(loadCategories())
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const persist = (nextCategories) => {
    setManagedCategories(nextCategories)
    saveCategories(nextCategories)
  }

  const handleAddCategory = (e) => {
    e.preventDefault()
    const nextName = newCategory.trim()
    if (!nextName) {
      setMessage('Please enter a category name.')
      return
    }

    const exists = managedCategories.some(
      (cat) => cat.toLowerCase() === nextName.toLowerCase()
    )

    if (exists) {
      setMessage('Category already exists.')
      return
    }

    const next = [...managedCategories, nextName]
    persist(next)
    setNewCategory('')
    setMessage('Category created successfully.')
  }

  const handleDeleteCategory = (categoryToRemove) => {
    const next = managedCategories.filter((cat) => cat !== categoryToRemove)
    persist(next)
    setMessage('Category deleted successfully.')
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

    const next = managedCategories.map((cat) => (cat === editingCategory ? nextName : cat))
    persist(next)
    setMessage('Category updated successfully.')
    setEditingCategory(null)
    setEditingValue('')
  }

  return (
    <section className="admin-panel-card admin-categories" aria-label="Categories management">
      <h2>Categories Management</h2>
      <form className="admin-categories-form" onSubmit={handleAddCategory}>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Enter category name"
          aria-label="New category name"
        />
        <button type="submit">Create Category</button>
      </form>
      {message && <p className="admin-auth-hint">{message}</p>}
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
  )
}
