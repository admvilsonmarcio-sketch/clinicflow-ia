import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/')
  }

  // Buscar dados do perfil do usuário
  const { data: profile } = await supabase
    .from('perfis')
    .select('*, clinicas(*)')
    .eq('id', session.user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Header user={session.user} profile={profile} />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}