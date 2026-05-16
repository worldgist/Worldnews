/**
 * Supabase project URL + anon key for the browser client.
 * VITE_* from the build environment wins; otherwise these defaults are used so
 * production (e.g. Vercel) still talks to the live database without extra env setup.
 * The anon key is intended to be public (RLS protects data).
 */
export const SUPABASE_PROJECT_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://ljojsxoadyykkupuqqhe.supabase.co'

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb2pzeG9hZHl5a2t1cHVxcWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4ODk0MTgsImV4cCI6MjA5NDQ2NTQxOH0.xeFgPxJ24NZ3bdanmjy_6HTrR1IFwUbZ0WzH9mxJXUg'

export const isSupabaseConfigured = Boolean(SUPABASE_PROJECT_URL && SUPABASE_ANON_KEY)
