import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createServerClient()

  if (supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      redirect('/dashboard')
    }
  }

  // Redirecionar para a página de login
  redirect('/auth/login')
}