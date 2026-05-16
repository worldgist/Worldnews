import { useCallback, useEffect, useState } from 'react'
import { loadCategories, loadSettings } from '../admin/storage'
import { loadPublicFeedFromDatabase } from '../lib/cmsPublicApi'
import { CMS_SYNC_EVENT } from '../lib/cmsEvents'
import { supabase } from '../lib/supabaseClient'

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
    window.addEventListener(CMS_SYNC_EVENT, sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('worldnews-admin-storage', sync)
      window.removeEventListener(CMS_SYNC_EVENT, sync)
    }
  }, [sync])

  useEffect(() => {
    if (!supabase) return undefined
    let cancelled = false
    void loadPublicFeedFromDatabase().then(() => {
      if (!cancelled) sync()
    })
    return () => {
      cancelled = true
    }
  }, [sync])

  return { settings, categories }
}
