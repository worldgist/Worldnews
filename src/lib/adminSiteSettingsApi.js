import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from '../admin/storage'
import { supabase } from './supabaseClient'

/** Site settings stored in admin_site_settings (social URLs live in social_media_links). */
export const SITE_SETTINGS_KEYS = [
  'siteName',
  'siteTagline',
  'siteAddress',
  'contactEmail',
  'commercialEmail',
  'tipsEmail',
  'copyrightText',
  'commentsEnabled',
  'repliesEnabled',
  'commentMaxLength',
  'aboutUsContent',
  'contactUsContent',
  'termsContent',
]

const SOCIAL_SETTINGS_KEYS = [
  'socialFacebook',
  'socialX',
  'socialInstagram',
  'socialWhatsapp',
  'socialYoutube',
  'socialTiktok',
]

export function pickSiteSettings(settings) {
  const source = { ...DEFAULT_SETTINGS, ...settings }
  const picked = {}
  for (const key of SITE_SETTINGS_KEYS) {
    picked[key] = source[key]
  }
  return picked
}

export function mapSiteSettingsRow(row) {
  if (!row) return null
  return {
    siteName: row.site_name?.trim() || DEFAULT_SETTINGS.siteName,
    siteTagline: row.site_tagline?.trim() ?? DEFAULT_SETTINGS.siteTagline,
    siteAddress: row.site_address?.trim() ?? DEFAULT_SETTINGS.siteAddress,
    contactEmail: row.contact_email?.trim() || DEFAULT_SETTINGS.contactEmail,
    commercialEmail: row.commercial_email?.trim() ?? DEFAULT_SETTINGS.commercialEmail,
    tipsEmail: row.tips_email?.trim() ?? DEFAULT_SETTINGS.tipsEmail,
    copyrightText: row.copyright_text?.trim() ?? DEFAULT_SETTINGS.copyrightText,
    commentsEnabled: row.comments_enabled !== false,
    repliesEnabled: row.replies_enabled !== false,
    commentMaxLength: Number.isFinite(row.comment_max_length)
      ? row.comment_max_length
      : DEFAULT_SETTINGS.commentMaxLength,
    aboutUsContent: row.about_us_content ?? DEFAULT_SETTINGS.aboutUsContent,
    contactUsContent: row.contact_us_content ?? DEFAULT_SETTINGS.contactUsContent,
    termsContent: row.terms_content ?? DEFAULT_SETTINGS.termsContent,
  }
}

export function siteSettingsToRow(settings, userId) {
  const s = pickSiteSettings(settings)
  return {
    id: 'primary',
    site_name: s.siteName?.trim() || DEFAULT_SETTINGS.siteName,
    site_tagline: s.siteTagline?.trim() ?? '',
    site_address: s.siteAddress?.trim() ?? '',
    contact_email: s.contactEmail?.trim() || DEFAULT_SETTINGS.contactEmail,
    commercial_email: s.commercialEmail?.trim() ?? '',
    tips_email: s.tipsEmail?.trim() ?? '',
    copyright_text: s.copyrightText?.trim() ?? DEFAULT_SETTINGS.copyrightText,
    comments_enabled: s.commentsEnabled !== false,
    replies_enabled: s.repliesEnabled !== false,
    comment_max_length: Math.min(
      2000,
      Math.max(80, Number(s.commentMaxLength) || DEFAULT_SETTINGS.commentMaxLength),
    ),
    about_us_content: s.aboutUsContent?.trim() ?? '',
    contact_us_content: s.contactUsContent?.trim() ?? '',
    terms_content: s.termsContent?.trim() ?? '',
    ...(userId ? { updated_by: userId } : {}),
    updated_at: new Date().toISOString(),
  }
}

function readCachedSettings() {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS }
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
  } catch {
    /* use defaults */
  }
  return { ...DEFAULT_SETTINGS }
}

export function applySiteSettingsToCache(siteSettings) {
  if (typeof window === 'undefined') return
  const current = readCachedSettings()
  const social = {}
  for (const key of SOCIAL_SETTINGS_KEYS) {
    if (current[key] !== undefined) social[key] = current[key]
  }
  const merged = { ...DEFAULT_SETTINGS, ...social, ...pickSiteSettings(siteSettings) }
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged))
  window.dispatchEvent(new CustomEvent('worldnews-admin-storage'))
}

export async function fetchAdminSiteSettingsFromDatabase() {
  if (!supabase) return { settings: null, fromDatabase: false }

  const { data, error } = await supabase
    .from('admin_site_settings')
    .select(
      `id, site_name, site_tagline, site_address, contact_email, commercial_email, tips_email,
       copyright_text, comments_enabled, replies_enabled, comment_max_length,
       about_us_content, contact_us_content, terms_content, updated_at`,
    )
    .eq('id', 'primary')
    .maybeSingle()

  if (error) {
    console.warn('admin_site_settings fetch:', error.message)
    return { settings: null, fromDatabase: false, error: error.message }
  }

  if (!data) return { settings: null, fromDatabase: false }

  const settings = mapSiteSettingsRow(data)
  applySiteSettingsToCache(settings)
  return { settings, fromDatabase: true }
}

export async function upsertAdminSiteSettingsToDatabase(settings) {
  if (!supabase) return { ok: false, error: 'Supabase not configured' }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const row = siteSettingsToRow(settings, session?.user?.id)
  const { error } = await supabase.from('admin_site_settings').upsert(row, {
    onConflict: 'id',
  })

  if (error) {
    console.warn('admin_site_settings upsert:', error.message)
    return { ok: false, error: error.message }
  }

  applySiteSettingsToCache(settings)
  return { ok: true }
}
