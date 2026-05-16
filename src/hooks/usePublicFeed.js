import { usePublicFeedContext } from '../context/PublicFeedContext'

/** Live CMS + static fallback feed (provided at app root). */
export function usePublicFeed() {
  return usePublicFeedContext()
}
