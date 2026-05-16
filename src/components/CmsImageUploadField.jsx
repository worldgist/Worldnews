import { useRef, useState } from 'react'
import { uploadCmsMediaFile, uploadAvatarFile } from '../lib/cmsStorage'
import { supabase } from '../lib/supabaseClient'

/**
 * Image picker backed by Supabase Storage (cms-media bucket).
 * @param {'post' | 'avatar' | 'generic'} variant
 */
export default function CmsImageUploadField({
  label = 'Image',
  value = '',
  onChange,
  hint = '',
  variant = 'post',
  disabled = false,
}) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handlePick = () => {
    if (!disabled) inputRef.current?.click()
  }

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setError('')
    setUploading(true)

    try {
      let publicUrl
      if (variant === 'avatar') {
        const result = await uploadAvatarFile(file)
        publicUrl = result.publicUrl
      } else {
        const folder = variant === 'post' ? 'posts' : 'site'
        const result = await uploadCmsMediaFile(file, 'image', { folder })
        publicUrl = result.publicUrl
      }
      onChange(publicUrl)
    } catch (err) {
      setError(err?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="cms-image-upload">
      {label ? <label className="cms-image-upload__label">{label}</label> : null}
      {hint ? <p className="cms-image-upload__hint">{hint}</p> : null}

      {value ? (
        <div className="cms-image-upload__preview">
          <img src={value} alt="" />
        </div>
      ) : null}

      <div className="cms-image-upload__row">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or upload a file"
          disabled={disabled || uploading}
          aria-label={label}
        />
        <button type="button" onClick={handlePick} disabled={disabled || uploading || !supabase}>
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        {value ? (
          <button type="button" className="btn-secondary" onClick={() => onChange('')} disabled={disabled}>
            Clear
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="post-image-input"
        onChange={handleFile}
        tabIndex={-1}
        aria-hidden
      />

      {!supabase ? (
        <p className="cms-image-upload__hint">Sign in with Supabase to upload files to cloud storage.</p>
      ) : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  )
}
