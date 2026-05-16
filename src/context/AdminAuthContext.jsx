import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { syncLocalCmsToCloud } from '../lib/cmsSync'
import { supabase } from '../lib/supabaseClient'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return undefined
    }

    let cancelled = false

    supabase.auth.getSession().then(({ data: { session: current } }) => {
      if (cancelled) return
      localStorage.removeItem('worldnews-admin-auth')
      setSession(current)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
      if (event === 'SIGNED_IN' && nextSession) {
        void syncLocalCmsToCloud()
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      isAuthenticated: Boolean(session),
      signOut: async () => {
        if (supabase) await supabase.auth.signOut()
        setSession(null)
      },
    }),
    [session, loading],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return ctx
}
