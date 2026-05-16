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
import { mapNewsPostRow } from './newsPostsApi'
import { fetchCategoriesFromDatabase } from './adminCategoriesApi'
import { fetchAdminSiteSettingsFromDatabase } from './adminSiteSettingsApi'
import { fetchSocialMediaLinksFromDatabase } from './socialMediaApi'
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
    const legacy = { ...DEFAULT_PROFILE, ...row.profile }
    if (!localStorage.getItem(PROFILE_STORAGE_KEY)) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(legacy))
    }
  }
}

function normalizeCmsPayloads(postRows) {
  if (!postRows?.length) return []
  const payloads = postRows.map((r) => r.payload).filter(Boolean)
  return normalizeStoredPosts(payloads).filter(isCmsPostPubliclyVisible)
}

function normalizeNewsPostRows(rows) {
  if (!rows?.length) return []
  return normalizeStoredPosts(rows.map(mapNewsPostRow).filter(Boolean))
}

/**
 * Load published CMS posts + site config from Supabase (anon-safe via RLS).
 * Updates localStorage cache and in-memory feed used by the landing page.
 */
async function fetchPublicFeedFromDatabase() {
  if (!supabase) {
    return { articles: mergePublicArticleLists([]), fromDatabase: false }
  }

  const [configRes, siteSettingsRes, categoriesRes, postsRes, legacyRes, socialRes] = await Promise.all([
    supabase
      .from('cms_config')
      .select('settings, categories, profile, updated_at')
      .eq('id', 'primary')
      .maybeSingle(),
    fetchAdminSiteSettingsFromDatabase(),
    fetchCategoriesFromDatabase(),
    supabase
      .from('news_posts')
      .select(
        'id, title, category, summary, body, body_html, author, image_url, read_time, display_date, status, featured, scheduled_for, published_at, updated_at',
      )
      .order('updated_at', { ascending: false }),
    supabase
      .from('cms_posts')
      .select('id, payload, updated_at')
      .order('updated_at', { ascending: false }),
    fetchSocialMediaLinksFromDatabase(),
  ])

  if (configRes.error) {
    console.warn('cms_config public fetch:', configRes.error.message)
  } else if (!(categoriesRes.fromDatabase && categoriesRes.categories?.length)) {
    if (siteSettingsRes.fromDatabase && siteSettingsRes.settings) {
      const cats = mergeCategoriesFromRemote(configRes.data?.categories)
      if (cats) {
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(cats))
      }
    } else {
      applyConfigRow(configRes.data)
    }
  }

  if (!configRes.error && configRes.data?.profile && typeof configRes.data.profile === 'object') {
    const legacy = { ...DEFAULT_PROFILE, ...configRes.data.profile }
    if (!localStorage.getItem(PROFILE_STORAGE_KEY)) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(legacy))
    }
  }

  let cmsArticles = []
  if (postsRes.error) {
    console.warn('news_posts fetch:', postsRes.error.message)
    if (!legacyRes.error && legacyRes.data?.length) {
      cmsArticles = normalizeCmsPayloads(legacyRes.data)
    }
  } else if (postsRes.data?.length) {
    cmsArticles = normalizeNewsPostRows(postsRes.data)
  } else if (!legacyRes.error && legacyRes.data?.length) {
    cmsArticles = normalizeCmsPayloads(legacyRes.data)
  }

  if (cmsArticles.length) {
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
