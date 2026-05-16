import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from '../admin/storage'

export const SOCIAL_LINKS_STORAGE_KEY = 'worldnews-social-links'
import { supabase } from './supabaseClient'

export const SOCIAL_PLATFORM_DEFS = [
  {
    platform: 'facebook',
    settingsKey: 'socialFacebook',
    label: 'Facebook',
    defaultUrl: DEFAULT_SETTINGS.socialFacebook,
    sortOrder: 1,
    iconClass: 'social-facebook',
  },
  {
    platform: 'x',
    settingsKey: 'socialX',
    label: 'X (Twitter)',
    defaultUrl: DEFAULT_SETTINGS.socialX,
    sortOrder: 2,
    iconClass: 'social-x',
  },
  {
    platform: 'instagram',
    settingsKey: 'socialInstagram',
    label: 'Instagram',
    defaultUrl: DEFAULT_SETTINGS.socialInstagram,
    sortOrder: 3,
    iconClass: 'social-instagram',
  },
  {
    platform: 'whatsapp',
    settingsKey: 'socialWhatsapp',
    label: 'WhatsApp',
    defaultUrl: DEFAULT_SETTINGS.socialWhatsapp,
    sortOrder: 4,
    iconClass: 'social-whatsapp',
  },
  {
    platform: 'youtube',
    settingsKey: 'socialYoutube',
    label: 'YouTube',
    defaultUrl: DEFAULT_SETTINGS.socialYoutube,
    sortOrder: 5,
    iconClass: 'social-youtube',
  },
  {
    platform: 'tiktok',
    settingsKey: 'socialTiktok',
    label: 'TikTok',
    defaultUrl: DEFAULT_SETTINGS.socialTiktok,
    sortOrder: 6,
    iconClass: 'social-tiktok',
  },
]

const defsByPlatform = Object.fromEntries(SOCIAL_PLATFORM_DEFS.map((d) => [d.platform, d]))

export function mapSocialLinkRow(row) {
  const def = defsByPlatform[row.platform]
  if (!def) return null

  const url = row.url?.trim() || def.defaultUrl
  return {
    platform: row.platform,
    label: row.label?.trim() || def.label,
    url,
    isEnabled: row.is_enabled !== false,
    sortOrder: Number.isFinite(row.sort_order) ? row.sort_order : def.sortOrder,
    settingsKey: def.settingsKey,
    defaultUrl: def.defaultUrl,
    iconClass: def.iconClass,
    updatedAt: row.updated_at,
  }
}

export function buildDefaultSocialLinks() {
  return SOCIAL_PLATFORM_DEFS.map((def) => ({
    platform: def.platform,
    label: def.label,
    url: def.defaultUrl,
    isEnabled: true,
    sortOrder: def.sortOrder,
    settingsKey: def.settingsKey,
    defaultUrl: def.defaultUrl,
    iconClass: def.iconClass,
    updatedAt: null,
  }))
}

export function socialLinksToSettingsPatch(links) {
  const patch = {}
  for (const link of links) {
    if (!link.settingsKey) continue
    patch[link.settingsKey] = link.url?.trim() || link.defaultUrl
  }
  return patch
}

function cacheSocialLinksInSettings(links) {
  if (typeof window === 'undefined') return
  const patch = socialLinksToSettingsPatch(links)
  let settings = { ...DEFAULT_SETTINGS }
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (saved) settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
  } catch {
    /* use defaults */
  }
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ ...settings, ...patch }))
  localStorage.setItem(SOCIAL_LINKS_STORAGE_KEY, JSON.stringify(links))
  window.dispatchEvent(new CustomEvent('worldnews-admin-storage'))
}

export function loadCachedSocialLinks() {
  try {
    const saved = localStorage.getItem(SOCIAL_LINKS_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length) {
        return parsed
          .map((item) => {
            const def = defsByPlatform[item.platform]
            if (!def) return null
            return {
              ...def,
              ...item,
              label: item.label?.trim() || def.label,
              url: item.url?.trim() || def.defaultUrl,
              isEnabled: item.isEnabled !== false,
            }
          })
          .filter(Boolean)
          .sort((a, b) => a.sortOrder - b.sortOrder)
      }
    }
  } catch {
    /* fall through */
  }
  return buildDefaultSocialLinks()
}

export const FOOTER_SOCIAL_ICONS = {
  facebook: '/facebook.png',
  x: '/x.png',
  instagram: '/instagram.png',
  whatsapp: '/whatsapp.png',
  youtube: '/youtube.png',
  tiktok: '/tiktok.png',
}

export async function fetchSocialMediaLinksFromDatabase() {
  if (!supabase) {
    return { links: buildDefaultSocialLinks(), fromDatabase: false }
  }

  const { data, error } = await supabase
    .from('social_media_links')
    .select('platform, label, url, is_enabled, sort_order, updated_at')
    .order('sort_order', { ascending: true })
    .order('platform', { ascending: true })

  if (error) {
    console.warn('social_media_links fetch:', error.message)
    return { links: buildDefaultSocialLinks(), fromDatabase: false, error: error.message }
  }

  if (!data?.length) {
    return { links: buildDefaultSocialLinks(), fromDatabase: false }
  }

  const mapped = data.map(mapSocialLinkRow).filter(Boolean)
  const byPlatform = Object.fromEntries(mapped.map((l) => [l.platform, l]))
  const links = SOCIAL_PLATFORM_DEFS.map((def) => byPlatform[def.platform] || {
    platform: def.platform,
    label: def.label,
    url: def.defaultUrl,
    isEnabled: true,
    sortOrder: def.sortOrder,
    settingsKey: def.settingsKey,
    defaultUrl: def.defaultUrl,
    iconClass: def.iconClass,
    updatedAt: null,
  })

  cacheSocialLinksInSettings(links)
  return { links, fromDatabase: true }
}

export async function upsertSocialMediaLinksToDatabase(links) {
  if (!supabase) return { ok: false, error: 'Supabase not configured' }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const rows = links.map((link) => ({
    platform: link.platform,
    label: link.label?.trim() || defsByPlatform[link.platform]?.label || link.platform,
    url: link.url?.trim() || defsByPlatform[link.platform]?.defaultUrl || '',
    is_enabled: link.isEnabled !== false,
    sort_order: Number.isFinite(link.sortOrder)
      ? link.sortOrder
      : defsByPlatform[link.platform]?.sortOrder ?? 0,
    ...(session?.user?.id ? { updated_by: session.user.id } : {}),
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from('social_media_links').upsert(rows, {
    onConflict: 'platform',
  })

  if (error) {
    console.warn('social_media_links upsert:', error.message)
    return { ok: false, error: error.message }
  }

  cacheSocialLinksInSettings(links)
  return { ok: true }
}

/** Sync social_media_links from local settings object (cms_config push). */
export async function syncSocialMediaLinksFromSettings(settings) {
  if (!supabase) return { ok: false }

  const links = SOCIAL_PLATFORM_DEFS.map((def) => ({
    platform: def.platform,
    label: def.label,
    url: settings?.[def.settingsKey]?.trim() || def.defaultUrl,
    isEnabled: true,
    sortOrder: def.sortOrder,
    settingsKey: def.settingsKey,
    defaultUrl: def.defaultUrl,
    iconClass: def.iconClass,
  }))

  return upsertSocialMediaLinksToDatabase(links)
}
