import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createServerClient()

  if (!supabase) {
    // Durante o build, renderiza apenas o formulário
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">MediFlow</h1>
            <p className="text-gray-600">CRM para Médicos e Clínicas</p>
          </div>
          <LoginForm />
        </div>
      </div>
    )
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">MediFlow</h1>
          <p className="text-gray-600">CRM para Médicos e Clínicas</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}