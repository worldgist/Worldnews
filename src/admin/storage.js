import { categories } from '../data/feed'

export const ADMIN_AUTH_KEY = 'worldnews-admin-auth'
export const CATEGORY_STORAGE_KEY = 'worldnews-admin-categories'
export const POST_STORAGE_KEY = 'worldnews-admin-posts'
export const SETTINGS_STORAGE_KEY = 'worldnews-admin-settings'
export const PROFILE_STORAGE_KEY = 'worldnews-admin-profile'

export const DEFAULT_SETTINGS = {
  siteName: 'World Gist News',
  siteTagline: 'Trusted updates across world, politics, sports, school, and technology.',
  siteAddress: '2654 SE 62nd Ave, Bronx, NY 10458, United States',
  contactEmail: 'newsroom@worldgistnews.com',
  commercialEmail: 'ads@worldgistnews.com',
  tipsEmail: 'tips@worldgistnews.com',
  copyrightText: '(c) 2026 World Gist News.',
  socialFacebook: 'https://facebook.com/worldgistnews',
  socialX: 'https://x.com/worldgistnews',
  socialInstagram: 'https://instagram.com/worldgistnews',
  socialWhatsapp: 'https://wa.me/2340000000000',
  socialYoutube: 'https://youtube.com/@worldgistnews',
  socialTiktok: 'https://tiktok.com/@worldgistnews',
  commentsEnabled: true,
  repliesEnabled: true,
  commentMaxLength: 500,
  aboutUsContent:
    'World Gist News is a digital publication focused on reliable reporting, global context, and accessible storytelling for everyday readers.\n\nOur editorial team covers politics, world affairs, technology, school development, and community impact stories with a strong emphasis on clarity and public value.\n\nWe believe quality journalism should be easy to navigate, easy to understand, and available on any device.',
  contactUsContent:
    'For editorial tips, partnership requests, corrections, or general inquiries, please use the form below.\n\nOur team reviews every message and replies as soon as possible during working hours.',
  termsContent:
    'By using World Gist News, you agree to these terms. If you do not agree, please discontinue use of this website.\n\nAll content is provided for information purposes only. Nothing on the site constitutes legal, financial, medical, or professional advice for your specific situation.\n\nRepublishing, copying, or redistribution of materials without permission is prohibited unless otherwise stated or clearly allowed by law.\n\nYou agree not to misuse this site, disrupt services, scrape content in a way that degrades performance, or post harmful or unlawful content through forms or interactive features.\n\nComment and community features, when enabled, are moderated at the publisher’s discretion. We may remove content that violates guidelines or applicable law.\n\nOur pages may include links to external websites. We are not responsible for the content, availability, or policies of third-party services.\n\nAdvertising and sponsored placements are labeled when required. Placement does not imply editorial endorsement unless explicitly stated.\n\nWe may revise these terms periodically. Continued use of the site after updates means you accept the revised version. For questions, use the contact details published on the site.',
}

export const DEFAULT_PROFILE = {
  fullName: 'Admin User',
  email: 'admin@worldgistnews.com',
  role: 'Editor in Chief',
  bio: 'Managing editorial quality and publication workflow for World Gist News.',
}

export function getCategoryPath(category) {
  const slug = category.toLowerCase().replace(/\s+/g, '-')
  const dedicatedRoutes = {
    world: '/world-news',
    politics: '/politics-news',
    sports: '/sports-news',
    school: '/school-news',
    technology: '/technology-news',
    entertainment: '/entertainment-news',
  }

  return dedicatedRoutes[slug] || `/category/${slug}`
}

export function loadCategories() {
  try {
    const saved = localStorage.getItem(CATEGORY_STORAGE_KEY)
    if (!saved) return categories
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed) || parsed.length === 0) return categories

    const merged = [...parsed]
    categories.forEach((category) => {
      const exists = merged.some((item) => item.toLowerCase() === category.toLowerCase())
      if (!exists) merged.push(category)
    })

    return merged
  } catch {
    return categories
  }
}

/** Normalize admin post list (scheduled → published when due). Exported for Supabase sync. */
export function normalizeStoredPosts(parsed) {
  if (!Array.isArray(parsed)) return []

  let hasChange = false
  const now = Date.now()
  const nextPosts = parsed.map((post) => {
    const normalizedStatus = post.status || 'published'
    const normalized = {
      ...post,
      status: normalizedStatus,
    }

    if (!post.status) {
      hasChange = true
    }

    if (normalizedStatus === 'scheduled') {
      const scheduledMs = Date.parse(post.scheduledFor || '')
      if (Number.isFinite(scheduledMs) && scheduledMs <= now) {
        const publishedDate = new Date(scheduledMs)
        normalized.status = 'published'
        normalized.scheduledFor = null
        normalized.publishedAt = publishedDate.toISOString()
        normalized.date = publishedDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
        hasChange = true
      }
    }

    return normalized
  })

  if (hasChange) {
    localStorage.setItem(POST_STORAGE_KEY, JSON.stringify(nextPosts))
  }

  return nextPosts
}

function scheduleCmsConfigPush() {
  if (typeof window === 'undefined') return
  import('../lib/cmsSync.js')
    .then((m) => m.schedulePushCmsConfig())
    .catch(() => {})
}

function scheduleCmsPostsPush() {
  if (typeof window === 'undefined') return
  import('../lib/cmsSync.js')
    .then((m) => m.schedulePushCmsPosts())
    .catch(() => {})
}

function notifyAdminStorage() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('worldnews-admin-storage'))
}

export function saveCategories(nextCategories) {
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(nextCategories))
  notifyAdminStorage()
  scheduleCmsConfigPush()
}

export function loadPosts() {
  try {
    const saved = localStorage.getItem(POST_STORAGE_KEY)
    if (!saved) return []
    const parsed = JSON.parse(saved)
    return normalizeStoredPosts(parsed)
  } catch {
    return []
  }
}

export function savePosts(nextPosts) {
  localStorage.setItem(POST_STORAGE_KEY, JSON.stringify(nextPosts))
  notifyAdminStorage()
  scheduleCmsPostsPush()
}

export function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!saved) return DEFAULT_SETTINGS
    const parsed = JSON.parse(saved)
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(nextSettings) {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings))
  notifyAdminStorage()
  scheduleCmsConfigPush()
}

export function loadProfile() {
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!saved) return DEFAULT_PROFILE
    const parsed = JSON.parse(saved)
    return { ...DEFAULT_PROFILE, ...parsed }
  } catch {
    return DEFAULT_PROFILE
  }
}

export function saveProfile(nextProfile) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile))
  notifyAdminStorage()
  scheduleCmsConfigPush()
}
