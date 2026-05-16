import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Supabase browser client. Add to `.env`:
 *   VITE_SUPABASE_URL=https://xxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY=eyJ...
 * Keys are in Project Settings → API in the Supabase dashboard.
 */
export const supabase =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: true } }) : null
