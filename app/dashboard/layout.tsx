import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()

  if (!supabase) {
    return <div>Carregando...</div>
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Buscar dados do perfil do usuário
  const { data: profile } = await supabase
    .from('perfis')
    .select('*, clinicas(*)')
    .eq('id', session.user.id)
    .single()

  return (
    <DashboardWrapper user={session.user} initialProfile={profile}>
      {children}
    </DashboardWrapper>
  )
}