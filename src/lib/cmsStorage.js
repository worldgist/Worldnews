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

/**
 * Upload a post image or video to Supabase Storage. Requires an active Supabase session.
 * @param {File} file
 * @param {'image' | 'video'} kind
 * @returns {Promise<{ publicUrl: string, path: string }>}
 */
export async function uploadCmsMediaFile(file, kind) {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user?.id) {
    throw new Error('Sign in to upload media to Supabase Storage')
  }

  const ext = extensionFromFile(file, kind)
  const path = `posts/${session.user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

  const { error } = await supabase.storage.from(CMS_MEDIA_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  })

  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage.from(CMS_MEDIA_BUCKET).getPublicUrl(path)

  return { publicUrl, path }
}
