import { createClient } from '@supabase/supabase-js'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// Cliente para componentes do servidor que precisa acessar cookies de sessão
export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies })
}

// Cliente administrativo com service role para operações que requerem permissões elevadas
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  // Durante o build, retornar um cliente mock para evitar erros
  if (process.env.NODE_ENV === 'production' && (!supabaseUrl || !supabaseServiceKey)) {
    console.warn('Supabase admin client not available during build')
    return null as any
  }
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase admin configuration')
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}