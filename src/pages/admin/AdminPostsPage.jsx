import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Quill from 'quill'
import DOMPurify from 'dompurify'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Code2,
  Eye,
  Film,
  Image as ImageIcon,
  Italic,
  Palette,
  PencilLine,
  Redo2,
  Send,
  Settings,
  Type,
  Underline,
  Undo2,
} from 'lucide-react'
import { loadCategories, loadPosts, savePosts } from '../../admin/storage'
import CmsImageUploadField from '../../components/CmsImageUploadField'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  deleteCmsMediaPath,
  listCmsPostMediaForUser,
  uploadCmsMediaFile,
} from '../../lib/cmsStorage'
import 'quill/dist/quill.snow.css'

const DRAFT_STORAGE_KEY = 'worldnews-admin-editor-draft'
const THEME_STORAGE_KEY = 'worldnews-admin-editor-theme'

const Font = Quill.import('formats/font')
Font.whitelist = ['sans', 'serif', 'monospace']
Quill.register(Font, true)

function toSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function cleanHTML(html) {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  })
}

function plainTextFromHTML(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim()
}

function paragraphsFromHTML(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const lines = [...doc.body.querySelectorAll('p, h1, h2, h3, blockquote, li')]
    .map((node) => (node.textContent || '').trim())
    .filter(Boolean)
  if (lines.length > 0) return lines

  const fallback = plainTextFromHTML(html)
  return fallback ? [fallback] : []
}

function estimateReadTime(text) {
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0
  const minutes = Math.max(1, Math.ceil(words / 220))
  return `${minutes} min`
}

function formatDateLabel(dateValue) {
  return dateValue.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(isoString) {
  if (!isoString) return 'N/A'
  const value = new Date(isoString)
  if (Number.isNaN(value.getTime())) return 'N/A'
  return value.toLocaleString()
}

function formatDateOnly(isoString) {
  if (!isoString) return 'N/A'
  const value = new Date(isoString)
  if (Number.isNaN(value.getTime())) return 'N/A'
  return value.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTimeOnly(isoString) {
  if (!isoString) return 'N/A'
  const value = new Date(isoString)
  if (Number.isNaN(value.getTime())) return 'N/A'
  return value.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

const DEFAULT_POST_IMAGE =
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80'

function firstImageSrcFromHtml(html) {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const img = doc.querySelector('img[src]')
    const raw = img?.getAttribute('src')?.trim()
    if (!raw) return null
    return raw
  } catch {
    return null
  }
}

export default function AdminPostsPage() {
  const [managedCategories] = useState(loadCategories())
  const [adminPosts, setAdminPosts] = useState(loadPosts())
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(managedCategories[0] || 'World')
  const [author, setAuthor] = useState('worldgistnews')
  const [previewMode, setPreviewMode] = useState(false)
  const [htmlMode, setHtmlMode] = useState(false)
  const [htmlDraft, setHtmlDraft] = useState('')
  const [showQuickMenu, setShowQuickMenu] = useState(false)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [autosaveEnabled, setAutosaveEnabled] = useState(true)
  const [publishMode, setPublishMode] = useState('publish-now')
  const [scheduledAt, setScheduledAt] = useState('')
  const [postsFilter, setPostsFilter] = useState('all')
  const [themeMode, setThemeMode] = useState(
    () => localStorage.getItem(THEME_STORAGE_KEY) || 'light',
  )
  const [editorHTML, setEditorHTML] = useState('<p></p>')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [mediaItems, setMediaItems] = useState([])
  const [storageMediaLoading, setStorageMediaLoading] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState(null)
  const { isAuthenticated } = useAdminAuth()

  const editorNodeRef = useRef(null)
  const quillRef = useRef(null)
  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)

  const sanitizedPreviewHTML = useMemo(() => cleanHTML(editorHTML), [editorHTML])
  const filteredPosts = useMemo(() => {
    if (postsFilter === 'all') return adminPosts
    return adminPosts.filter((post) => (post.status || 'published') === postsFilter)
  }, [adminPosts, postsFilter])

  useEffect(() => {
    let draft = null
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY)
      draft = raw ? JSON.parse(raw) : null
    } catch {
      draft = null
    }

    if (draft) {
      setTitle(draft.title || '')
      setCategory(draft.category || managedCategories[0] || 'World')
      setAuthor(draft.author || 'worldgistnews')
      setEditorHTML(draft.content || '<p></p>')
      setCoverImageUrl(draft.coverImageUrl || '')
      setMediaItems(Array.isArray(draft.mediaItems) ? draft.mediaItems : [])
      setLastSavedAt(draft.savedAt ? new Date(draft.savedAt) : null)
    }
  }, [managedCategories])

  useEffect(() => {
    if (!isAuthenticated) return undefined

    let cancelled = false
    setStorageMediaLoading(true)
    void listCmsPostMediaForUser().then(({ items }) => {
      if (cancelled) return
      if (items.length) {
        setMediaItems((prev) => {
          const seen = new Set(prev.map((item) => item.storagePath || item.src))
          const merged = [...prev]
          for (const item of items) {
            const key = item.storagePath || item.src
            if (!seen.has(key)) {
              seen.add(key)
              merged.push(item)
            }
          }
          return merged
        })
      }
      setStorageMediaLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!editorNodeRef.current || quillRef.current) return

    const quill = new Quill(editorNodeRef.current, {
      theme: 'snow',
      placeholder: 'Start writing here...',
      modules: {
        toolbar: false,
        history: {
          delay: 600,
          maxStack: 250,
          userOnly: true,
        },
      },
    })

    quill.root.innerHTML = editorHTML
    quill.on('text-change', () => {
      setEditorHTML(quill.root.innerHTML)
    })
    quillRef.current = quill
  }, [editorHTML])

  useEffect(() => {
    if (!autosaveEnabled) return undefined

    const timeout = setTimeout(() => {
      const draft = {
        title,
        category,
        author,
        content: editorHTML,
        coverImageUrl,
        mediaItems,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
      setLastSavedAt(new Date())
    }, 700)

    return () => clearTimeout(timeout)
  }, [title, category, author, editorHTML, coverImageUrl, mediaItems, autosaveEnabled])

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeMode)
  }, [themeMode])

  useEffect(() => {
    const handler = (event) => {
      if (!(event.ctrlKey || event.metaKey)) return

      if (event.key.toLowerCase() === 's') {
        event.preventDefault()
        handlePublish()
        return
      }

      if (event.shiftKey && event.key.toLowerCase() === 'p') {
        event.preventDefault()
        setPreviewMode((prev) => !prev)
        return
      }

      if (event.shiftKey && event.key.toLowerCase() === 'h') {
        event.preventDefault()
        toggleHTMLMode()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const runFormat = (format, value = true) => {
    if (!quillRef.current) return
    quillRef.current.focus()
    quillRef.current.format(format, value)
  }

  const runHistory = (type) => {
    if (!quillRef.current) return
    quillRef.current.focus()
    if (type === 'undo') quillRef.current.history.undo()
    if (type === 'redo') quillRef.current.history.redo()
  }

  const changeHeader = (value) => {
    if (!quillRef.current) return
    quillRef.current.focus()
    if (value === 'normal') {
      quillRef.current.format('header', false)
    } else {
      quillRef.current.format('header', Number(value))
    }
  }

  const changeFont = (value) => {
    if (!quillRef.current) return
    quillRef.current.focus()
    quillRef.current.format('font', value === 'sans' ? false : value)
  }

  const handleImagePick = () => {
    imageInputRef.current?.click()
  }

  const handleVideoPick = () => {
    videoInputRef.current?.click()
  }

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Unable to read media file'))
    reader.readAsDataURL(file)
  })

  const ingestMediaFiles = async (files, type) => {
    if (!files || files.length === 0) return

    const maxSize = type === 'video' ? 25 * 1024 * 1024 : 8 * 1024 * 1024
    const acceptedPrefix = `${type}/`
    const accepted = [...files].filter((file) => file.type.startsWith(acceptedPrefix) && file.size <= maxSize)

    if (accepted.length === 0) {
      alert(`No valid ${type} files selected. Max size is ${Math.floor(maxSize / (1024 * 1024))}MB.`)
      return
    }

    let warnedFallback = false
    const nextItems = await Promise.all(
      accepted.map(async (file) => {
        const id = crypto.randomUUID()
        let src
        let storagePath = null
        try {
          const result = await uploadCmsMediaFile(file, type)
          src = result.publicUrl
          storagePath = result.path
        } catch (err) {
          console.warn('Supabase Storage upload failed, using embedded data URL:', err)
          if (!warnedFallback) {
            warnedFallback = true
            alert(
              `Could not upload to Supabase Storage (${err?.message || 'unknown error'}). Using embedded copies instead; sign in with Supabase and ensure the cms-media bucket exists.`,
            )
          }
          src = await fileToDataUrl(file)
        }

        return {
          id,
          name: file.name,
          type,
          size: file.size,
          src,
          storagePath,
        }
      }),
    )

    setMediaItems((prev) => [...nextItems, ...prev])
  }

  const handleImageChange = async (event) => {
    await ingestMediaFiles(event.target.files, 'image')
    event.target.value = ''
  }

  const handleVideoChange = async (event) => {
    await ingestMediaFiles(event.target.files, 'video')
    event.target.value = ''
  }

  const insertMediaIntoEditor = (item) => {
    if (!quillRef.current) return

    const range = quillRef.current.getSelection(true)
    const index = range ? range.index : quillRef.current.getLength()

    if (item.type === 'image') {
      quillRef.current.insertEmbed(index, 'image', item.src)
      quillRef.current.setSelection(index + 1)
      return
    }

    const safeVideoSrc = item.src.replace(/"/g, '&quot;')
    const videoMarkup = `<p><video controls src="${safeVideoSrc}" style="max-width:100%;border-radius:10px;"></video></p>`
    quillRef.current.clipboard.dangerouslyPasteHTML(index, videoMarkup)
    quillRef.current.setSelection(index + 1)
  }

  const removeMediaItem = async (mediaId) => {
    const target = mediaItems.find((item) => item.id === mediaId)
    if (target?.storagePath) {
      await deleteCmsMediaPath(target.storagePath)
    }
    if (coverImageUrl && target?.src === coverImageUrl) {
      setCoverImageUrl('')
    }
    setMediaItems((prev) => prev.filter((item) => item.id !== mediaId))
  }

  const setCoverFromMedia = (item) => {
    if (item.type !== 'image') return
    setCoverImageUrl(item.src)
  }

  const toggleHTMLMode = () => {
    if (!quillRef.current) return
    if (!htmlMode) {
      setHtmlDraft(quillRef.current.root.innerHTML)
      setHtmlMode(true)
      return
    }

    const safeHTML = cleanHTML(htmlDraft)
    quillRef.current.root.innerHTML = safeHTML
    setEditorHTML(safeHTML)
    setHtmlMode(false)
  }

  const handleEditMode = () => {
    if (!quillRef.current) return

    if (htmlMode) {
      const safeHTML = cleanHTML(htmlDraft)
      quillRef.current.root.innerHTML = safeHTML
      setEditorHTML(safeHTML)
      setHtmlMode(false)
    }

    setPreviewMode(false)
    setShowQuickMenu(false)
    setShowSettingsMenu(false)
    quillRef.current.focus()
  }

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY)
    setLastSavedAt(null)
    alert('Local draft cache cleared.')
  }

  const handlePublish = () => {
    const clean = cleanHTML(editorHTML)
    const plain = plainTextFromHTML(clean)
    const headline = title.trim()
    if (!headline || !plain) {
      alert('Title and article content are required before publishing.')
      return
    }

    const summary = `${plain.slice(0, 160)}${plain.length > 160 ? '...' : ''}`
    const body = paragraphsFromHTML(clean)
    const isScheduled = publishMode === 'schedule'
    const scheduleDate = isScheduled ? new Date(scheduledAt) : null

    if (isScheduled) {
      if (!scheduledAt || Number.isNaN(scheduleDate.getTime())) {
        alert('Please choose a valid date and time for scheduling.')
        return
      }
      if (scheduleDate.getTime() <= Date.now()) {
        alert('Scheduled publish time must be in the future.')
        return
      }
    }

    const publishDate = isScheduled ? scheduleDate : new Date()

    const newPost = {
      id: `${toSlug(headline)}-${Date.now()}`,
      title: headline,
      category,
      summary,
      body,
      author: author.trim() || 'worldgistnews',
      date: formatDateLabel(publishDate),
      readTime: estimateReadTime(plain),
      image:
        coverImageUrl.trim()
        || firstImageSrcFromHtml(clean)
        || mediaItems.find((item) => item.type === 'image')?.src
        || DEFAULT_POST_IMAGE,
      featured: false,
      htmlContent: clean,
      status: isScheduled ? 'scheduled' : 'published',
      scheduledFor: isScheduled ? scheduleDate.toISOString() : null,
      publishedAt: isScheduled ? null : publishDate.toISOString(),
    }

    const nextPosts = [newPost, ...adminPosts]
    setAdminPosts(nextPosts)
    savePosts(nextPosts)
    localStorage.removeItem(DRAFT_STORAGE_KEY)
    setScheduledAt('')
    setPublishMode('publish-now')
    alert(isScheduled ? 'Post scheduled successfully.' : 'Post published successfully.')
  }

  const handleDeletePost = (postId) => {
    const nextPosts = adminPosts.filter((post) => post.id !== postId)
    setAdminPosts(nextPosts)
    savePosts(nextPosts)
  }

  const handlePublishNow = (postId) => {
    const publishDate = new Date()
    const nextPosts = adminPosts.map((post) => {
      if (post.id !== postId) return post
      return {
        ...post,
        status: 'published',
        scheduledFor: null,
        publishedAt: publishDate.toISOString(),
        date: formatDateLabel(publishDate),
      }
    })
    setAdminPosts(nextPosts)
    savePosts(nextPosts)
  }

  return (
    <section className={`admin-panel-card admin-post-editor-v2 ${themeMode}`} aria-label="News post editor">
      <div className="post-editor-header">
        <input
          className="post-editor-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          aria-label="Post title"
        />
        <div className="post-editor-header-actions">
          <button
            type="button"
            className="post-preview-btn"
            onClick={() => setPreviewMode((prev) => !prev)}
          >
            <Eye size={17} />
            Preview
          </button>
          <button
            type="button"
            className="post-preview-arrow"
            aria-label="Open preview options"
            onClick={() => setShowQuickMenu((prev) => !prev)}
          >
            <ChevronDown size={16} />
          </button>
          <motion.button
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            className="post-publish-btn"
            onClick={handlePublish}
          >
            <Send size={16} />
            Publish
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showQuickMenu && (
          <motion.div
            className="post-quick-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <button type="button" onClick={() => setPreviewMode((prev) => !prev)}>
              Toggle Preview
            </button>
            <button type="button" onClick={toggleHTMLMode}>
              {htmlMode ? 'Apply and Exit HTML Mode' : 'Switch to HTML Mode'}
            </button>
            <button type="button" onClick={handleEditMode}>
              Back to Edit Mode
            </button>
            <button
              type="button"
              onClick={() => setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'))}
            >
              Theme: {themeMode === 'light' ? 'Light' : 'Dark'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="post-toolbar" role="toolbar" aria-label="Formatting toolbar">
        <button type="button" className="toolbar-icon-btn" title="Edit" onClick={handleEditMode}>
          <PencilLine size={16} />
        </button>
        <button type="button" className="toolbar-icon-btn" title="Undo" onClick={() => runHistory('undo')}>
          <Undo2 size={16} />
        </button>
        <button type="button" className="toolbar-icon-btn" title="Redo" onClick={() => runHistory('redo')}>
          <Redo2 size={16} />
        </button>
        <span className="toolbar-separator" />

        <label className="toolbar-color-picker" title="Text color">
          <Palette size={16} />
          <input type="color" onChange={(e) => runFormat('color', e.target.value)} />
        </label>

        <label className="toolbar-select-wrap" title="Font style">
          <Type size={16} />
          <select onChange={(e) => changeFont(e.target.value)} defaultValue="sans">
            <option value="sans">Sans</option>
            <option value="serif">Serif</option>
            <option value="monospace">Mono</option>
          </select>
        </label>

        <label className="toolbar-select-wrap" title="Paragraph style">
          <select onChange={(e) => changeHeader(e.target.value)} defaultValue="normal">
            <option value="normal">Normal</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
          </select>
        </label>

        <button type="button" className="toolbar-icon-btn" title="Bold" onClick={() => runFormat('bold')}>
          <Bold size={16} />
        </button>
        <button type="button" className="toolbar-icon-btn" title="Italic" onClick={() => runFormat('italic')}>
          <Italic size={16} />
        </button>
        <button type="button" className="toolbar-icon-btn" title="Underline" onClick={() => runFormat('underline')}>
          <Underline size={16} />
        </button>
        <span className="toolbar-separator" />
        <button type="button" className="toolbar-icon-btn" title="Align left" onClick={() => runFormat('align', false)}>
          <AlignLeft size={16} />
        </button>
        <button type="button" className="toolbar-icon-btn" title="Align center" onClick={() => runFormat('align', 'center')}>
          <AlignCenter size={16} />
        </button>
        <button type="button" className="toolbar-icon-btn" title="Align right" onClick={() => runFormat('align', 'right')}>
          <AlignRight size={16} />
        </button>
        <span className="toolbar-separator" />
        <button type="button" className="toolbar-icon-btn" title="Upload image" onClick={handleImagePick}>
          <ImageIcon size={16} />
        </button>
        <button type="button" className="toolbar-icon-btn" title="Upload video" onClick={handleVideoPick}>
          <Film size={16} />
        </button>
        <button type="button" className="toolbar-icon-btn" title="HTML mode" onClick={toggleHTMLMode}>
          <Code2 size={16} />
        </button>
        <button
          type="button"
          className="toolbar-icon-btn"
          title="Settings"
          onClick={() => setShowSettingsMenu((prev) => !prev)}
        >
          <Settings size={16} />
        </button>
      </div>

      <AnimatePresence>
        {showSettingsMenu && (
          <motion.div
            className="post-settings-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <button
              type="button"
              onClick={() => setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'))}
            >
              Switch to {themeMode === 'light' ? 'Dark' : 'Light'} Theme
            </button>
            <button type="button" onClick={() => setAutosaveEnabled((prev) => !prev)}>
              {autosaveEnabled ? 'Disable' : 'Enable'} Auto Save
            </button>
            <button type="button" onClick={handleClearDraft}>
              Clear Draft Cache
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CmsImageUploadField
        label="Cover image (card thumbnail)"
        value={coverImageUrl}
        onChange={setCoverImageUrl}
        variant="post"
        hint="Used on the homepage and category cards. Uploads go to Supabase Storage (cms-media bucket)."
      />

      <div className="post-editor-meta-row">
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {managedCategories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={author}
          placeholder="Author"
          onChange={(event) => setAuthor(event.target.value)}
        />
        <select value={publishMode} onChange={(event) => setPublishMode(event.target.value)}>
          <option value="publish-now">Publish Now</option>
          <option value="schedule">Schedule Post</option>
        </select>
        {publishMode === 'schedule' && (
          <input
            type="datetime-local"
            value={scheduledAt}
            min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
            onChange={(event) => setScheduledAt(event.target.value)}
            aria-label="Scheduled publish time"
          />
        )}
        <span className="post-save-indicator">
          {autosaveEnabled
            ? (lastSavedAt
              ? `Draft auto-saved at ${lastSavedAt.toLocaleTimeString()}`
              : 'Draft not saved yet')
            : 'Auto save is disabled'}
        </span>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="post-image-input"
        onChange={handleImageChange}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        multiple
        className="post-image-input"
        onChange={handleVideoChange}
      />

      <section className="post-media-library" aria-label="Uploaded media">
        <div className="post-media-library-head">
          <h4>Media Uploads ({mediaItems.length})</h4>
          <p>
            Images and videos upload to <strong>Supabase Storage</strong> (<code>cms-media</code>) when you are signed in.
            {storageMediaLoading ? ' Loading your cloud library…' : null}
          </p>
        </div>
        {mediaItems.length === 0 ? (
          <p className="post-media-empty">No media uploaded yet.</p>
        ) : (
          <div className="post-media-grid">
            {mediaItems.map((item) => (
              <article key={item.id} className="post-media-card">
                <div className="post-media-preview">
                  {item.type === 'image' ? (
                    <img src={item.src} alt={item.name} />
                  ) : (
                    <video src={item.src} controls preload="metadata" />
                  )}
                </div>
                <p>{item.name}</p>
                <small>{item.type.toUpperCase()} | {(item.size / (1024 * 1024)).toFixed(2)}MB</small>
                <div className="admin-post-item-actions">
                  {item.type === 'image' ? (
                    <button type="button" onClick={() => setCoverFromMedia(item)}>
                      Set cover
                    </button>
                  ) : null}
                  <button type="button" onClick={() => insertMediaIntoEditor(item)}>
                    Insert
                  </button>
                  <button type="button" className="btn-danger" onClick={() => void removeMediaItem(item.id)}>
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {htmlMode ? (
        <textarea
          className="post-editor-html"
          value={htmlDraft}
          onChange={(event) => setHtmlDraft(event.target.value)}
          placeholder="Edit HTML source..."
          spellCheck={false}
        />
      ) : (
        <div className="post-editor-canvas-wrap">
          <div ref={editorNodeRef} className="post-editor-canvas" />
        </div>
      )}

      <AnimatePresence>
        {previewMode && (
          <motion.div
            className="post-preview-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <h3>{title || 'Untitled Draft'}</h3>
            <article dangerouslySetInnerHTML={{ __html: sanitizedPreviewHTML }} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="admin-post-list">
        <div className="admin-post-list-head">
          <h4>Saved Admin Posts ({adminPosts.length})</h4>
          <select value={postsFilter} onChange={(event) => setPostsFilter(event.target.value)}>
            <option value="all">All posts</option>
            <option value="published">Published only</option>
            <option value="scheduled">Scheduled only</option>
          </select>
        </div>
        {filteredPosts.length === 0 ? (
          <p>No admin posts yet.</p>
        ) : (
          <ul>
            {filteredPosts.map((post) => (
              <li key={post.id}>
                <div>
                  <strong>{post.title}</strong>
                  <p>{post.category} | {post.author} | {post.date}</p>
                  <p>
                    <span className={`post-status-badge ${(post.status || 'published')}`}>
                      {(post.status || 'published').toUpperCase()}
                    </span>
                    {(post.status || 'published') === 'scheduled'
                      ? ` Schedule Date: ${formatDateOnly(post.scheduledFor)} | Schedule Time: ${formatTimeOnly(post.scheduledFor)}`
                      : ` Publish Date: ${formatDateOnly(post.publishedAt)} | Publish Time: ${formatTimeOnly(post.publishedAt)}`}
                  </p>
                </div>
                <div className="admin-post-item-actions">
                  {(post.status || 'published') === 'scheduled' && (
                    <button type="button" onClick={() => handlePublishNow(post.id)}>
                      Publish Now
                    </button>
                  )}
                  <button type="button" className="btn-danger" onClick={() => handleDeletePost(post.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
