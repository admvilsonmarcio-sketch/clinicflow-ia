import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'

export const createClient = () => createClientComponentClient<Database>()

// Environment variables validation
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}