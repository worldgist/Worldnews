import { useState } from 'react'
import { loadCategories, saveCategories } from '../../admin/storage'

export default function AdminAddCategoryPage() {
  const [newCategory, setNewCategory] = useState('')
  const [message, setMessage] = useState('')

  const handleAddCategory = (e) => {
    e.preventDefault()
    const nextName = newCategory.trim()
    if (!nextName) return

    const managedCategories = loadCategories()
    const exists = managedCategories.some(
      (cat) => cat.toLowerCase() === nextName.toLowerCase()
    )

    if (exists) {
      setMessage('Category already exists.')
      return
    }

    saveCategories([...managedCategories, nextName])
    setNewCategory('')
    setMessage('Category created successfully.')
  }

  return (
    <section className="admin-panel-card" aria-label="Add category">
      <h2>Add Category</h2>
      <form className="admin-categories-form" onSubmit={handleAddCategory}>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Enter category name"
        />
        <button type="submit">Create Category</button>
      </form>
      {message && <p className="admin-auth-hint">{message}</p>}
    </section>
  )
}
