import { useEffect, useMemo, useState } from 'react'
import {
  getAllArticles,
  getPublicFeatured,
  getPublicHeadlineSidebar,
  getPublicLatest,
  getPublicTickerLines,
} from '../data/publicFeed'
import { loadPublicFeedFromDatabase } from '../lib/cmsPublicApi'
import { supabase } from '../lib/supabaseClient'
import { useFeedSync } from './useFeedSync'

/**
 * Landing + header feed: fetches published posts from Supabase, then merges for display.
 */
export function usePublicFeed() {
  const feedSync = useFeedSync()
  const [articles, setArticles] = useState(() => getAllArticles())
  const [loading, setLoading] = useState(Boolean(supabase))
  const [fromDatabase, setFromDatabase] = useState(false)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (!supabase) {
        setArticles(getAllArticles())
        setFromDatabase(false)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const result = await loadPublicFeedFromDatabase()
        if (cancelled) return

        setArticles(result.articles?.length ? result.articles : getAllArticles())
        setFromDatabase(result.fromDatabase)
      } catch (err) {
        console.warn('Public feed fetch failed:', err)
        if (!cancelled) setArticles(getAllArticles())
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [feedSync])

  const featured = useMemo(() => getPublicFeatured(articles), [articles])
  const sidebarHeadlines = useMemo(
    () => getPublicHeadlineSidebar(5, featured?.id, articles),
    [articles, featured?.id],
  )
  const latestPosts = useMemo(() => getPublicLatest(9, articles).slice(0, 5), [articles])
  const miniFeatures = useMemo(() => getPublicLatest(6, articles).slice(0, 3), [articles])
  const tickerLines = useMemo(() => getPublicTickerLines(8, articles), [articles])

  return {
    articles,
    loading,
    fromDatabase,
    featured,
    sidebarHeadlines,
    latestPosts,
    miniFeatures,
    tickerLines,
  }
}
