import { useEffect, useMemo, useState } from 'react'
import { articles } from '../../data/feed'
import { DEFAULT_SETTINGS, loadPosts, loadSettings, saveSettings } from '../../admin/storage'
import { supabase } from '../../lib/supabaseClient'
import {
  fetchAllCommentsGroupedByArticle,
  rowsToNestedComments,
  deleteCommentsForArticle,
  deleteCommentById,
  setCommentHidden,
  deleteAllComments,
} from '../../lib/articleCommentsSupabase'

const COMMENTS_PREFIX = 'worldnews-comments-'

function safeParseComments(raw) {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(loadSettings())
  const [commentThreads, setCommentThreads] = useState([])
  const [message, setMessage] = useState('')

  const titleLookup = useMemo(() => {
    const mergedPosts = [...articles, ...loadPosts()]
    return mergedPosts.reduce((acc, post) => {
      acc[post.id] = post.title
      return acc
    }, {})
  }, [])

  const refreshCommentThreads = async () => {
    if (supabase) {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        const grouped = await fetchAllCommentsGroupedByArticle()
        if (grouped) {
          const threads = []
          for (const [articleId, rows] of grouped) {
            const nested = rowsToNestedComments(rows)
            const repliesCount = nested.reduce((count, item) => count + (item.replies?.length || 0), 0)
            threads.push({
              key: `supabase:${articleId}`,
              articleId,
              backend: 'supabase',
              title: titleLookup[articleId] || `Article: ${articleId}`,
              comments: nested,
              commentsCount: nested.length,
              repliesCount,
            })
          }
          threads.sort((a, b) => b.commentsCount + b.repliesCount - (a.commentsCount + a.repliesCount))
          setCommentThreads(threads)
          return
        }
      }
    }

    const threads = []
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (!key || !key.startsWith(COMMENTS_PREFIX)) continue

      const articleId = key.replace(COMMENTS_PREFIX, '')
      const comments = safeParseComments(localStorage.getItem(key))
      if (comments.length === 0) continue

      const repliesCount = comments.reduce((count, item) => count + (item.replies?.length || 0), 0)
      threads.push({
        key,
        articleId,
        backend: 'local',
        title: titleLookup[articleId] || `Article: ${articleId}`,
        comments,
        commentsCount: comments.length,
        repliesCount,
      })
    }

    setCommentThreads(threads.sort((a, b) => b.commentsCount + b.repliesCount - (a.commentsCount + a.repliesCount)))
  }

  useEffect(() => {
    refreshCommentThreads()

    const sync = () => {
      setSettings(loadSettings())
      refreshCommentThreads()
    }

    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [titleLookup])

  const handleSettingChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveSettings = (e) => {
    e.preventDefault()
    saveSettings(settings)
    setMessage('Admin settings saved successfully.')
  }

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    saveSettings(DEFAULT_SETTINGS)
    setMessage('Settings reset to defaults.')
  }

  const handleDeleteThread = async (thread) => {
    if (thread.backend === 'supabase') {
      await deleteCommentsForArticle(thread.articleId)
    } else {
      localStorage.removeItem(thread.key)
    }
    await refreshCommentThreads()
    setMessage('Comment thread removed successfully.')
  }

  const handleDeleteSingleComment = async (thread, commentId) => {
    if (thread.backend === 'supabase') {
      await deleteCommentById(commentId)
    } else {
      const comments = safeParseComments(localStorage.getItem(thread.key))
      const next = comments.filter((comment) => comment.id !== commentId)

      if (next.length === 0) {
        localStorage.removeItem(thread.key)
      } else {
        localStorage.setItem(thread.key, JSON.stringify(next))
      }
    }

    await refreshCommentThreads()
    setMessage('Comment deleted successfully.')
  }

  const handleToggleCommentStatus = async (thread, commentId) => {
    if (thread.backend === 'supabase') {
      const target = thread.comments.find((c) => c.id === commentId)
      const nextHidden = !target?.isClosed
      await setCommentHidden(commentId, nextHidden)
    } else {
      const jcomments = safeParseComments(localStorage.getItem(thread.key))
      const next = jcomments.map((comment) => {
        if (comment.id !== commentId) return comment
        return { ...comment, isClosed: !comment.isClosed }
      })

      localStorage.setItem(thread.key, JSON.stringify(next))
    }

    await refreshCommentThreads()
    setMessage('Comment status updated successfully.')
  }

  const handleClearAllComments = async () => {
    if (supabase) {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) await deleteAllComments()
    }
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (key?.startsWith(COMMENTS_PREFIX)) localStorage.removeItem(key)
    }
    await refreshCommentThreads()
    setMessage('All comments cleared successfully.')
  }

  return (
    <section className="admin-panel-card admin-settings" aria-label="Admin settings">
      <h2>Admin Settings</h2>
      <form className="admin-settings-form" onSubmit={handleSaveSettings}>
        <label htmlFor="siteNameInput">Website Name</label>
        <input id="siteNameInput" type="text" value={settings.siteName} onChange={(e) => handleSettingChange('siteName', e.target.value)} required />
        <label htmlFor="siteTaglineInput">Website Tagline</label>
        <textarea id="siteTaglineInput" rows={2} value={settings.siteTagline} onChange={(e) => handleSettingChange('siteTagline', e.target.value)} />
        <label htmlFor="siteAddressInput">Mailing address</label>
        <textarea
          id="siteAddressInput"
          rows={2}
          value={settings.siteAddress || ''}
          onChange={(e) => handleSettingChange('siteAddress', e.target.value)}
          placeholder="Street, city, state, ZIP, country"
        />
        <label htmlFor="contactEmailInput">Contact Email</label>
        <input id="contactEmailInput" type="email" value={settings.contactEmail} onChange={(e) => handleSettingChange('contactEmail', e.target.value)} />
        <label htmlFor="commercialEmailInput">Advertising / Commercial Email</label>
        <input
          id="commercialEmailInput"
          type="email"
          value={settings.commercialEmail || ''}
          onChange={(e) => handleSettingChange('commercialEmail', e.target.value)}
          placeholder="ads@example.com"
        />
        <label htmlFor="tipsEmailInput">News Tips Email</label>
        <input
          id="tipsEmailInput"
          type="email"
          value={settings.tipsEmail || ''}
          onChange={(e) => handleSettingChange('tipsEmail', e.target.value)}
          placeholder="tips@example.com"
        />
        <label htmlFor="copyrightInput">Footer Copyright Text</label>
        <input id="copyrightInput" type="text" value={settings.copyrightText} onChange={(e) => handleSettingChange('copyrightText', e.target.value)} />
        <div className="admin-settings-subsection">
          <h3>Comment Management</h3>
          <label className="admin-checkbox" htmlFor="commentsEnabledInput">
            <input
              id="commentsEnabledInput"
              type="checkbox"
              checked={settings.commentsEnabled !== false}
              onChange={(e) => handleSettingChange('commentsEnabled', e.target.checked)}
            />
            Enable comments on article pages
          </label>
          <label className="admin-checkbox" htmlFor="repliesEnabledInput">
            <input
              id="repliesEnabledInput"
              type="checkbox"
              checked={settings.repliesEnabled !== false}
              onChange={(e) => handleSettingChange('repliesEnabled', e.target.checked)}
            />
            Enable replies to comments
          </label>
          <label htmlFor="commentMaxLengthInput">Maximum comment length</label>
          <input
            id="commentMaxLengthInput"
            type="number"
            min={80}
            max={2000}
            value={settings.commentMaxLength}
            onChange={(e) => handleSettingChange('commentMaxLength', Number(e.target.value) || 500)}
          />
        </div>
        <label htmlFor="aboutUsContentInput">About Us Content</label>
        <textarea
          id="aboutUsContentInput"
          rows={6}
          value={settings.aboutUsContent}
          onChange={(e) => handleSettingChange('aboutUsContent', e.target.value)}
          placeholder="Write About Us content"
        />
        <label htmlFor="contactUsContentInput">Contact Us Content</label>
        <textarea
          id="contactUsContentInput"
          rows={5}
          value={settings.contactUsContent}
          onChange={(e) => handleSettingChange('contactUsContent', e.target.value)}
          placeholder="Write Contact Us content"
        />
        <label htmlFor="termsContentInput">Terms and Conditions Content</label>
        <textarea
          id="termsContentInput"
          rows={8}
          value={settings.termsContent}
          onChange={(e) => handleSettingChange('termsContent', e.target.value)}
          placeholder="Write Terms and Conditions content"
        />
        <div className="admin-settings-actions">
          <button type="submit">Save Settings</button>
          <button type="button" className="btn-secondary" onClick={handleResetSettings}>Reset Defaults</button>
        </div>
      </form>

      <div className="admin-settings-subsection admin-comment-threads">
        <h3>Comments Moderation</h3>
        <div className="admin-comments-tools">
          <button type="button" onClick={refreshCommentThreads}>Refresh Threads</button>
          <button type="button" className="btn-danger" onClick={handleClearAllComments}>
            Clear All Comments
          </button>
        </div>
        {commentThreads.length === 0 ? (
          <p className="comments-empty">
            No comments found.
            {supabase ? ' Sign in with Supabase on the login page to moderate comments stored in the database.' : null}
          </p>
        ) : (
          <div className="admin-comments-list">
            {commentThreads.map((thread) => (
              <article key={thread.key} className="admin-comment-thread">
                <header>
                  <strong>{thread.title}</strong>
                  <span>{thread.commentsCount} comments | {thread.repliesCount} replies</span>
                </header>
                <div className="admin-thread-actions">
          <button type="button" className="btn-danger" onClick={() => handleDeleteThread(thread)}>
                    Delete Thread
                  </button>
                </div>
                <ul>
                  {thread.comments.map((comment) => (
                    <li key={comment.id}>
                      <p><strong>{comment.name}:</strong> {comment.text}</p>
                      <span className={`admin-comment-status ${comment.isClosed ? 'closed' : 'open'}`}>
                        {comment.isClosed ? 'Closed' : 'Open'}
                      </span>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleToggleCommentStatus(thread, comment.id)}
                      >
                        {comment.isClosed ? 'Open Comment' : 'Close Comment'}
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleDeleteSingleComment(thread, comment.id)}
                      >
                        Delete Comment
                      </button>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </div>

      {message && <p className="admin-auth-hint">{message}</p>}
    </section>
  )
}
