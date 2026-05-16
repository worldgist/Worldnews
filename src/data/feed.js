/**
 * News feed data store.
 * In production swap the exported arrays/functions for real API / CMS calls.
 * Example CMS adapter pattern is at the bottom of this file.
 */

import { todayArticles, todayMostRead, todayTickerItems } from './todayArticles'

export const tickerItems = todayTickerItems

export const mostRead = todayMostRead

export const articles = todayArticles

/** All unique category slugs derived from the articles array */
export const categories = [...new Set(articles.map((a) => a.category))].sort()

/** Return all articles for a given category */
export function getByCategory(category) {
  return articles.filter(
    (a) => a.category.toLowerCase() === category.toLowerCase()
  )
}

/** Return a single article by its id slug */
export function getById(id) {
  return articles.find((a) => a.id === id) ?? null
}

/** Return the featured hero article */
export function getFeatured() {
  return articles.find((a) => a.featured) ?? articles[0]
}

/** Return latest N articles (excluding featured hero) */
export function getLatest(n = 6) {
  return articles.filter((a) => !a.featured).slice(0, n)
}

/*
 * ── CMS adapter example ─────────────────────────────────────────────────
 * Replace the exports above with async functions calling your real CMS API.
 *
 * Sanity (GROQ):
 *   import { createClient } from '@sanity/client'
 *   const client = createClient({ projectId: 'xxx', dataset: 'production', useCdn: true })
 *   export const getLatest = (n = 6) =>
 *     client.fetch(`*[_type=="article"] | order(publishedAt desc) [0..${n}]`)
 *
 * Contentful:
 *   import contentful from 'contentful'
 *   const client = contentful.createClient({ space: 'xxx', accessToken: process.env.VITE_CF_TOKEN })
 *   export const getLatest = (n = 6) =>
 *     client.getEntries({ content_type: 'article', order: '-sys.createdAt', limit: n })
 *       .then(r => r.items.map(i => i.fields))
 */
