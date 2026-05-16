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
  const [lastSavedAt, setLastSavedAt] = useState(null)

  const editorNodeRef = useRef(null)
  const quillRef = useRef(null)
  const imageInputRef = useRef(null)

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
      setLastSavedAt(draft.savedAt ? new Date(draft.savedAt) : null)
    }
  }, [managedCategories])

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
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
      setLastSavedAt(new Date())
    }, 700)

    return () => clearTimeout(timeout)
  }, [title, category, author, editorHTML, autosaveEnabled])

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

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file || !quillRef.current) return

    const reader = new FileReader()
    reader.onload = () => {
      const range = quillRef.current.getSelection(true)
      const index = range ? range.index : quillRef.current.getLength()
      quillRef.current.insertEmbed(index, 'image', reader.result)
      quillRef.current.setSelection(index + 1)
    }
    reader.readAsDataURL(file)
    event.target.value = ''
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
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80',
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
        className="post-image-input"
        onChange={handleImageChange}
      />

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
