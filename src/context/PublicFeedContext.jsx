import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  getAllArticles,
  getPublicFeatured,
  getPublicHeadlineSidebar,
  getPublicLatest,
  getPublicTickerLines,
} from '../data/publicFeed'
import { loadPublicFeedFromDatabase } from '../lib/cmsPublicApi'
import { CMS_SYNC_EVENT } from '../lib/cmsEvents'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

const PublicFeedContext = createContext(null)

export function PublicFeedProvider({ children }) {
  const [articles, setArticles] = useState(() => getAllArticles())
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [fromDatabase, setFromDatabase] = useState(false)
  const [syncTick, setSyncTick] = useState(0)

  useEffect(() => {
    if (!supabase) {
      setArticles(getAllArticles())
      setFromDatabase(false)
      setLoading(false)
      return undefined
    }

    let cancelled = false

    const refresh = async () => {
      setLoading(true)
      try {
        const result = await loadPublicFeedFromDatabase()
        if (cancelled) return
        setArticles(result.articles?.length ? result.articles : getAllArticles())
        setFromDatabase(result.fromDatabase)
        setSyncTick((t) => t + 1)
      } catch (err) {
        console.warn('Public feed fetch failed:', err)
        if (!cancelled) setArticles(getAllArticles())
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void refresh()

    const onSynced = () => {
      setArticles(getAllArticles())
      setSyncTick((t) => t + 1)
    }
    window.addEventListener(CMS_SYNC_EVENT, onSynced)
    window.addEventListener('worldnews-admin-storage', onSynced)

    return () => {
      cancelled = true
      window.removeEventListener(CMS_SYNC_EVENT, onSynced)
      window.removeEventListener('worldnews-admin-storage', onSynced)
    }
  }, [])

  const value = useMemo(() => {
    const list = articles
    return {
      articles: list,
      loading,
      fromDatabase,
      syncTick,
      featured: getPublicFeatured(list),
      sidebarHeadlines: getPublicHeadlineSidebar(5, getPublicFeatured(list)?.id, list),
      latestPosts: getPublicLatest(9, list).slice(0, 5),
      miniFeatures: getPublicLatest(6, list).slice(0, 3),
      tickerLines: getPublicTickerLines(8, list),
    }
  }, [articles, loading, fromDatabase, syncTick])

  return <PublicFeedContext.Provider value={value}>{children}</PublicFeedContext.Provider>
}

export function usePublicFeedContext() {
  const ctx = useContext(PublicFeedContext)
  if (!ctx) {
    throw new Error('usePublicFeedContext must be used within PublicFeedProvider')
  }
  return ctx
}
