import { supabase } from './supabaseClient'

export const CMS_MEDIA_BUCKET = 'cms-media'

const MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
}

const IMAGE_MAX_BYTES = 8 * 1024 * 1024
const VIDEO_MAX_BYTES = 25 * 1024 * 1024

function extensionFromFile(file, kind) {
  const fromMime = file.type && MIME_TO_EXT[file.type]
  if (fromMime) return fromMime

  const name = file.name || ''
  const dot = name.lastIndexOf('.')
  if (dot > 0) {
    const ext = name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '')
    if (ext.length > 0 && ext.length <= 8) return ext
  }

  return kind === 'video' ? 'mp4' : 'jpg'
}

export function getCmsMediaPublicUrl(path) {
  if (!supabase || !path) return ''
  const {
    data: { publicUrl },
  } = supabase.storage.from(CMS_MEDIA_BUCKET).getPublicUrl(path)
  return publicUrl
}

export async function requireStorageSession() {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user?.id) {
    throw new Error('Sign in to upload media to Supabase Storage')
  }

  return session
}

function validateFile(file, kind) {
  const maxSize = kind === 'video' ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES
  const prefix = `${kind}/`

  if (!file.type.startsWith(prefix)) {
    throw new Error(`File must be a ${kind}`)
  }

  if (file.size > maxSize) {
    throw new Error(`File is too large (max ${Math.floor(maxSize / (1024 * 1024))}MB)`)
  }
}

/**
 * Upload a post image or video to Supabase Storage. Requires an active Supabase session.
 * @param {File} file
 * @param {'image' | 'video'} kind
 * @param {{ folder?: string, upsert?: boolean }} [options]
 * @returns {Promise<{ publicUrl: string, path: string }>}
 */
export async function uploadCmsMediaFile(file, kind, options = {}) {
  validateFile(file, kind)
  const session = await requireStorageSession()

  const ext = extensionFromFile(file, kind)
  const folder = options.folder || 'posts'
  const path =
    options.fixedPath ||
    `${folder}/${session.user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

  const { error } = await supabase.storage.from(CMS_MEDIA_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: options.upsert === true,
    contentType: file.type || undefined,
  })

  if (error) throw error

  return { publicUrl: getCmsMediaPublicUrl(path), path }
}

/** Profile avatar — one file per user (overwrites previous). */
export async function uploadAvatarFile(file) {
  validateFile(file, 'image')
  const session = await requireStorageSession()
  const ext = extensionFromFile(file, 'image')
  const path = `avatars/${session.user.id}/avatar.${ext}`

  return uploadCmsMediaFile(file, 'image', { folder: 'avatars', fixedPath: path, upsert: true })
}

export async function deleteCmsMediaPath(path) {
  if (!supabase || !path) return { ok: true }

  const { error } = await supabase.storage.from(CMS_MEDIA_BUCKET).remove([path])
  if (error) {
    console.warn('cms-media delete:', error.message)
    return { ok: false, error: error.message }
  }
  return { ok: true }
}

/** List objects under posts/{userId}/ for the media library. */
export async function listCmsPostMediaForUser() {
  if (!supabase) return { items: [], fromStorage: false }

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user?.id) return { items: [], fromStorage: false }

  const prefix = `posts/${session.user.id}`
  const { data, error } = await supabase.storage.from(CMS_MEDIA_BUCKET).list(prefix, {
    limit: 100,
    sortBy: { column: 'created_at', order: 'desc' },
  })

  if (error) {
    console.warn('cms-media list:', error.message)
    return { items: [], fromStorage: false, error: error.message }
  }

  const items = (data || [])
    .filter((entry) => entry.name && !entry.name.endsWith('/'))
    .map((entry) => {
      const path = `${prefix}/${entry.name}`
      const lower = entry.name.toLowerCase()
      const type = /\.(mp4|webm|mov)$/.test(lower) ? 'video' : 'image'
      return {
        id: path,
        name: entry.name,
        type,
        size: entry.metadata?.size || 0,
        src: getCmsMediaPublicUrl(path),
        storagePath: path,
        fromStorage: true,
      }
    })

  return { items, fromStorage: true }
}

export function isCmsStorageUrl(url) {
  if (!url || typeof url !== 'string') return false
  return url.includes('/storage/v1/object/public/cms-media/')
}
