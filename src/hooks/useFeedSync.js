import { useEffect, useState } from 'react'
import { CMS_SYNC_EVENT } from '../lib/cmsEvents'

const ADMIN_STORAGE_EVENT = 'worldnews-admin-storage'

/** Incrementing tick when CMS data in localStorage changes (admin UI or Supabase pull). */
export function useFeedSync() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const bump = () => setTick((t) => t + 1)
    window.addEventListener(ADMIN_STORAGE_EVENT, bump)
    window.addEventListener(CMS_SYNC_EVENT, bump)
    return () => {
      window.removeEventListener(ADMIN_STORAGE_EVENT, bump)
      window.removeEventListener(CMS_SYNC_EVENT, bump)
    }
  }, [])
  return tick
}
