import { createClient } from '@supabase/supabase-js'
import {
  isSupabaseConfigured,
  SUPABASE_ANON_KEY,
  SUPABASE_PROJECT_URL,
} from '../config/supabaseProject'

export { isSupabaseConfigured }

/**
 * Supabase browser client. Override via `.env` / Vercel `VITE_*` vars, or use
 * defaults in `src/config/supabaseProject.js` (anon key is public; RLS enforces access).
 */
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true } })
  : null
