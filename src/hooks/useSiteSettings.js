import { useCallback, useEffect, useState } from 'react'
import { loadCategories, loadSettings } from '../admin/storage'

export function useSiteSettings() {
  const [settings, setSettings] = useState(() => loadSettings())
  const [categories, setCategories] = useState(() => loadCategories())

  const sync = useCallback(() => {
    setSettings(loadSettings())
    setCategories(loadCategories())
  }, [])

  useEffect(() => {
    sync()
    window.addEventListener('storage', sync)
    window.addEventListener('worldnews-admin-storage', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('worldnews-admin-storage', sync)
    }
  }, [sync])

  return { settings, categories }
}
