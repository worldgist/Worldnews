import { supabase } from './supabaseClient'
import { categories as feedCategories } from '../data/feed'
import { CMS_SYNC_EVENT } from './cmsEvents'
import { fetchAdminProfileFromDatabase, upsertAdminProfileToDatabase } from './adminProfileApi'
import { deleteNewsPostsFromDatabase, upsertNewsPostsToDatabase } from './newsPostsApi'
import { syncScheduledQueueFromPosts } from './scheduledPostsApi'
import { fetchCategoriesFromDatabase, syncCategoriesFromNames } from './adminCategoriesApi'
import {
  fetchAdminSiteSettingsFromDatabase,
  pickSiteSettings,
  upsertAdminSiteSettingsToDatabase,
} from './adminSiteSettingsApi'
import {
  fetchSocialMediaLinksFromDatabase,
  syncSocialMediaLinksFromSettings,
} from './socialMediaApi'
import { loadPublicFeedFromDatabase } from './cmsPublicApi'
import {
  CATEGORY_STORAGE_KEY,
  DEFAULT_PROFILE,
  DEFAULT_SETTINGS,
  POST_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  normalizeStoredPosts,
} from '../admin/storage'

export { CMS_SYNC_EVENT }

let suppressNextRemotePush = false
let configPushTimer = null
let postsPushTimer = null

function notifyCmsSynced() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(CMS_SYNC_EVENT))
}

function mergeCategoriesFromRemote(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return null
  const merged = [...raw]
  feedCategories.forEach((category) => {
    const exists = merged.some((item) => item.toLowerCase() === category.toLowerCase())
    if (!exists) merged.push(category)
  })
  return merged
}

/**
 * Pull remote CMS into localStorage + in-memory public feed (shared with landing page).
 */
export async function pullCmsSnapshot() {
  if (!supabase) return

  suppressNextRemotePush = true
  try {
    await Promise.all([
      loadPublicFeedFromDatabase(),
      fetchAdminProfileFromDatabase(),
      fetchAdminSiteSettingsFromDatabase(),
      fetchSocialMediaLinksFromDatabase(),
      fetchCategoriesFromDatabase(),
    ])
    notifyCmsSynced()
  } finally {
    suppressNextRemotePush = false
  }
}

/** Push localStorage CMS to Supabase, then refresh the public cache. */
export async function syncLocalCmsToCloud() {
  if (!supabase) return
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return

  await pushCmsConfigFromStorage()
  await pushCmsPostsFromStorage()
  await pushAdminProfileFromStorage()
  await pullCmsSnapshot()
}

export async function pushAdminProfileFromStorage() {
  if (!supabase || suppressNextRemotePush) return
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return

  const profile = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || 'null') || DEFAULT_PROFILE
  await upsertAdminProfileToDatabase({ ...DEFAULT_PROFILE, ...profile })
}

export async function pushCmsConfigFromStorage() {
  if (!supabase || suppressNextRemotePush) return
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return

  const settings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || 'null') || DEFAULT_SETTINGS
  const categoriesRaw = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY) || 'null')
  const categorySeed =
    Array.isArray(categoriesRaw) && categoriesRaw.length > 0 ? categoriesRaw : [...feedCategories]
  const categories = mergeCategoriesFromRemote(categorySeed) || [...feedCategories]
  const { error } = await supabase.from('cms_config').upsert(
    {
      id: 'primary',
      settings: { ...DEFAULT_SETTINGS, ...pickSiteSettings(settings), ...settings },
      categories: categories || [],
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )

  if (error) console.warn('cms_config push:', error.message)

  const siteResult = await upsertAdminSiteSettingsToDatabase(settings)
  if (!siteResult.ok) console.warn('admin_site_settings sync:', siteResult.error)

  const socialResult = await syncSocialMediaLinksFromSettings({ ...DEFAULT_SETTINGS, ...settings })
  if (!socialResult.ok) console.warn('social_media_links sync:', socialResult.error)

  const catResult = await syncCategoriesFromNames(categories)
  if (!catResult.ok) console.warn('cms_categories sync:', catResult.error)
}

export function schedulePushCmsConfig() {
  if (!supabase || suppressNextRemotePush) return
  clearTimeout(configPushTimer)
  configPushTimer = setTimeout(() => {
    configPushTimer = null
    void pushCmsConfigFromStorage()
  }, 450)
}

export async function pushCmsPostsFromStorage() {
  if (!supabase || suppressNextRemotePush) return
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return

  const raw = localStorage.getItem(POST_STORAGE_KEY)
  let posts = []
  try {
    posts = raw ? JSON.parse(raw) : []
    if (!Array.isArray(posts)) posts = []
  } catch {
    posts = []
  }

  const normalized = normalizeStoredPosts(posts)
  const nextIds = new Set(normalized.map((p) => p.id))

  const { data: existing, error: exErr } = await supabase.from('news_posts').select('id')
  if (exErr) {
    console.warn('news_posts list for sync:', exErr.message)
    return
  }

  const toDelete = (existing || []).map((r) => r.id).filter((id) => !nextIds.has(id))
  if (toDelete.length) {
    await deleteNewsPostsFromDatabase(toDelete)
  }

  if (normalized.length === 0) return

  const upResult = await upsertNewsPostsToDatabase(normalized)
  if (!upResult.ok) console.warn('news_posts upsert:', upResult.error)

  const queueResult = await syncScheduledQueueFromPosts(normalized)
  if (!queueResult.ok) console.warn('scheduled_posts sync:', queueResult.error)

  const legacyRows = normalized.map((p) => ({
    id: p.id,
    payload: p,
    updated_at: new Date().toISOString(),
  }))
  await supabase.from('cms_posts').upsert(legacyRows, { onConflict: 'id' })
}

export function schedulePushCmsPosts() {
  if (!supabase || suppressNextRemotePush) return
  clearTimeout(postsPushTimer)
  postsPushTimer = setTimeout(() => {
    postsPushTimer = null
    void pushCmsPostsFromStorage()
  }, 450)
}
