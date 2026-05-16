/** Verified Unsplash photo IDs (paths return HTTP 200 as of 2026). */
const UNSPLASH = (photoId, width = 900) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=80`

const BY_CATEGORY = {
  World: [
    'photo-1446776877081-d282a0f896e2',
    'photo-1526304640581-d334cdbbf45e',
    'photo-1494412574643-ff11b0a5c1c3',
    'photo-1464226184884-fa280b87c399',
  ],
  Politics: [
    'photo-1529107386315-e1a2ed48a620',
    'photo-1521737604893-d14cc237f11d',
    'photo-1540910419892-4a36d2c3266c',
    'photo-1504711434969-e33886168f5c',
  ],
  Sports: [
    'photo-1574629810360-7efbbe195018',
    'photo-1504711434969-e33886168f5c',
    'photo-1461896836934-ffe607ba8211',
    'photo-1542751371-adc38448a05e',
    'photo-1579952363873-27f3bade9f55',
  ],
  School: [
    'photo-1503676260728-1c00da094a0b',
    'photo-1588072432836-e10032774350',
    'photo-1434030216411-0b793f4b4173',
    'photo-1497633763263-9827a4e1a2a0',
  ],
  Technology: [
    'photo-1518770660439-4636190af475',
    'photo-1511707171634-5f897ff02aa9',
    'photo-1531482615713-2afd69097998',
    'photo-1512941937669-90a1b58e7e9c',
  ],
  Entertainment: [
    'photo-1489599849927-2ee91cede3ba',
    'photo-1470229722913-7c0e2dbbafd3',
    'photo-1440404653325-ab127d49abc1',
    'photo-1506157786151-b8493531f3ca',
  ],
}

export const DEFAULT_ARTICLE_IMAGE = UNSPLASH('photo-1504711434969-e33886168f5c')

function hashId(id = '') {
  let h = 0
  for (let i = 0; i < id.length; i += 1) {
    h = (h << 5) - h + id.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

/** Pick a stable, working image URL for an article. */
export function resolveArticleImage(article, width) {
  const src = article?.image?.trim()
  if (src && !src.includes('images.unsplash.com')) {
    return src
  }

  const category = article?.category || 'World'
  const pool = BY_CATEGORY[category] || BY_CATEGORY.World
  const photoId = pool[hashId(article?.id) % pool.length]
  return UNSPLASH(photoId, width ?? (article?.featured ? 1400 : 900))
}
