import { categories as feedCategories } from '../data/feed'
import { CATEGORY_STORAGE_KEY, getCategoryPath } from '../admin/storage'
import { supabase } from './supabaseClient'

const DEDICATED_ROUTES = {
  world: '/world-news',
  politics: '/politics-news',
  sports: '/sports-news',
  school: '/school-news',
  technology: '/technology-news',
  entertainment: '/entertainment-news',
}

export function slugifyCategoryName(name) {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function defaultRouteForSlug(slug) {
  return DEDICATED_ROUTES[slug] || `/category/${slug}`
}

export function mapCategoryRow(row) {
  if (!row) return null
  const slug = row.slug?.trim()
  if (!slug) return null

  return {
    slug,
    name: row.name?.trim() || slug,
    description: row.description?.trim() || '',
    routePath: row.route_path?.trim() || defaultRouteForSlug(slug),
    sortOrder: Number.isFinite(row.sort_order) ? row.sort_order : 0,
    isActive: row.is_active !== false,
    updatedAt: row.updated_at,
  }
}

export function categoryRecordsToNames(records) {
  return records.filter((r) => r.isActive).map((r) => r.name)
}

export function applyCategoriesToCache(records) {
  if (typeof window === 'undefined') return

  const active = records.filter((r) => r.isActive)
  const names = active.map((r) => r.name)

  const merged = [...names]
  feedCategories.forEach((category) => {
    if (!merged.some((item) => item.toLowerCase() === category.toLowerCase())) {
      merged.push(category)
    }
  })

  const nextJson = JSON.stringify(merged)
  const prevJson = localStorage.getItem(CATEGORY_STORAGE_KEY)
  if (prevJson === nextJson) return

  localStorage.setItem(CATEGORY_STORAGE_KEY, nextJson)
  window.dispatchEvent(new CustomEvent('worldnews-admin-storage'))
}

export async function fetchCategoriesFromDatabase(options = {}) {
  const { applyCache = true } = options
  if (!supabase) return { categories: [], fromDatabase: false }

  const { data, error } = await supabase
    .from('cms_categories')
    .select('slug, name, description, route_path, sort_order, is_active, updated_at')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.warn('cms_categories fetch:', error.message)
    return { categories: [], fromDatabase: false, error: error.message }
  }

  const categories = (data || []).map(mapCategoryRow).filter(Boolean)
  if (applyCache && categories.length) {
    applyCategoriesToCache(categories)
  }

  return { categories, fromDatabase: categories.length > 0 }
}

function categoryToRow(category, userId) {
  const slug = slugifyCategoryName(category.slug || category.name)
  return {
    slug,
    name: category.name?.trim() || slug,
    description: category.description?.trim() || '',
    route_path: category.routePath?.trim() || defaultRouteForSlug(slug),
    sort_order: Number.isFinite(category.sortOrder) ? category.sortOrder : 0,
    is_active: category.isActive !== false,
    ...(userId ? { created_by: userId } : {}),
    updated_at: new Date().toISOString(),
  }
}

export async function upsertCategoryToDatabase(category) {
  if (!supabase) return { ok: false, error: 'Supabase not configured' }

  const slug = slugifyCategoryName(category.slug || category.name)
  if (!slug) return { ok: false, error: 'Invalid category slug' }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const row = categoryToRow({ ...category, slug }, session?.user?.id)
  const { error } = await supabase.from('cms_categories').upsert(row, { onConflict: 'slug' })

  if (error) {
    console.warn('cms_categories upsert:', error.message)
    return { ok: false, error: error.message }
  }

  const { categories } = await fetchCategoriesFromDatabase()
  return { ok: true, categories }
}

export async function deleteCategoryFromDatabase(slug) {
  if (!supabase) return { ok: false, error: 'Supabase not configured' }

  const { error } = await supabase.from('cms_categories').delete().eq('slug', slug)
  if (error) {
    console.warn('cms_categories delete:', error.message)
    return { ok: false, error: error.message }
  }

  await fetchCategoriesFromDatabase()
  return { ok: true }
}

/** Sync cms_categories from legacy string list (localStorage / cms_config push). */
export async function syncCategoriesFromNames(names) {
  if (!supabase || !Array.isArray(names)) return { ok: false }

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return { ok: false }

  const unique = [...new Set(names.map((n) => n?.trim()).filter(Boolean))]
  const rows = unique.map((name, index) =>
    categoryToRow(
      {
        name,
        slug: slugifyCategoryName(name),
        routePath: getCategoryPath(name),
        sortOrder: index + 1,
        isActive: true,
      },
      session.user.id,
    ),
  )

  if (rows.length) {
    const { error } = await supabase.from('cms_categories').upsert(rows, { onConflict: 'slug' })
    if (error) {
      console.warn('cms_categories bulk sync:', error.message)
      return { ok: false, error: error.message }
    }
  }

  const { data: existing, error: listErr } = await supabase.from('cms_categories').select('slug')
  if (listErr) return { ok: false, error: listErr.message }

  const nameSlugs = new Set(rows.map((r) => r.slug))
  const toRemove = (existing || []).map((r) => r.slug).filter((slug) => !nameSlugs.has(slug))

  if (toRemove.length) {
    await supabase.from('cms_categories').delete().in('slug', toRemove)
  }

  return { ok: true }
}
