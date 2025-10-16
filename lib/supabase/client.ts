import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'

export const createClient = () => createClientComponentClient<Database>()

// Environment variables validation
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vxgavovjuyqmfqztheul.supabase.co'
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4Z2F2b3ZqdXlxbWZxenRoZXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMzg2MTUsImV4cCI6MjA3NDkxNDYxNX0.yesbXrC6op0kT_pOkQf0WF2JcnYMvtW0nmYSuwJuaog'

// Only throw error in runtime, not during build
if (typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  console.error('Missing Supabase environment variables')
}