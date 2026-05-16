import { supabase } from './supabaseClient'
import { CMS_SYNC_EVENT } from './cmsEvents'
import { categories as feedCategories } from '../data/feed'
import {
  CATEGORY_STORAGE_KEY,
  DEFAULT_PROFILE,
  DEFAULT_SETTINGS,
  POST_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  normalizeStoredPosts,
} from '../admin/storage'
import {
  isCmsPostPubliclyVisible,
  mergePublicArticleLists,
  setLivePublicArticles,
} from '../data/publicFeed'

let fetchInFlight = null

function mergeCategoriesFromRemote(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return null
  const merged = [...raw]
  feedCategories.forEach((category) => {
    const exists = merged.some((item) => item.toLowerCase() === category.toLowerCase())
    if (!exists) merged.push(category)
  })
  return merged
}

function applyConfigRow(row) {
  if (!row) return
  if (row.settings && typeof row.settings === 'object') {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_SETTINGS, ...row.settings }),
    )
  }
  const cats = mergeCategoriesFromRemote(row.categories)
  if (cats) {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(cats))
  }
  if (row.profile && typeof row.profile === 'object') {
    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_PROFILE, ...row.profile }),
    )
  }
}

function normalizeCmsPayloads(postRows) {
  if (!postRows?.length) return []
  const payloads = postRows.map((r) => r.payload).filter(Boolean)
  return normalizeStoredPosts(payloads).filter(isCmsPostPubliclyVisible)
}

/**
 * Load published CMS posts + site config from Supabase (anon-safe via RLS).
 * Updates localStorage cache and in-memory feed used by the landing page.
 */
async function fetchPublicFeedFromDatabase() {
  if (!supabase) {
    return { articles: mergePublicArticleLists([]), fromDatabase: false }
  }

  const [configRes, postsRes] = await Promise.all([
    supabase
      .from('cms_config')
      .select('settings, categories, profile, updated_at')
      .eq('id', 'primary')
      .maybeSingle(),
    supabase
      .from('cms_posts')
      .select('id, payload, updated_at')
      .order('updated_at', { ascending: false }),
  ])

  if (configRes.error) {
    console.warn('cms_config public fetch:', configRes.error.message)
  } else {
    applyConfigRow(configRes.data)
  }

  let cmsArticles = []
  if (postsRes.error) {
    console.warn('cms_posts public fetch:', postsRes.error.message)
  } else if (postsRes.data?.length) {
    cmsArticles = normalizeCmsPayloads(postsRes.data)
    localStorage.setItem(POST_STORAGE_KEY, JSON.stringify(cmsArticles))
  }

  const merged = mergePublicArticleLists(cmsArticles)
  setLivePublicArticles(merged)

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CMS_SYNC_EVENT))
    window.dispatchEvent(new CustomEvent('worldnews-admin-storage'))
  }

  return {
    articles: merged,
    cmsCount: cmsArticles.length,
    fromDatabase: cmsArticles.length > 0 || Boolean(configRes.data),
  }
}

/** Deduped fetch for landing page + app bootstrap. */
export function loadPublicFeedFromDatabase() {
  if (!fetchInFlight) {
    fetchInFlight = fetchPublicFeedFromDatabase().finally(() => {
      fetchInFlight = null
    })
  }
  return fetchInFlight
}
