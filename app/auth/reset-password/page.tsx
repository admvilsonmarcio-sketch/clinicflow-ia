import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface ResetPasswordPageProps {
  searchParams: {
    verified?: string
    error?: string
    error_description?: string
  }
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const supabase = createServerClient()
  
  // Verificar se há erro nos parâmetros da URL
  if (searchParams.error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-md w-full space-y-6 text-center">
          <img 
            src="/logo.svg" 
            alt="MediFlow" 
            className="mx-auto h-12 sm:h-16 w-auto mb-4 sm:mb-6"
          />
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Link inválido ou expirado
            </h2>
            <p className="text-sm text-red-700 mb-4">
              {searchParams.error_description || 'O link de recuperação não é válido ou já expirou.'}
            </p>
            <Link 
              href="/auth/forgot-password"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              Solicitar novo link
            </Link>
          </div>
          <Link 
            href="/auth/login"
            className="text-sm text-gray-600 hover:text-gray-500 transition-colors"
          >
            Voltar ao login
          </Link>
        </div>
      </div>
    )
  }

  // Se não foi verificado via /auth/confirm, mostrar erro
  if (!searchParams.verified) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-md w-full space-y-6 text-center">
          <img 
            src="/logo.svg" 
            alt="MediFlow" 
            className="mx-auto h-12 sm:h-16 w-auto mb-4 sm:mb-6"
          />
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Acesso não autorizado
            </h2>
            <p className="text-sm text-red-700 mb-4">
              Você precisa acessar esta página através do link enviado por e-mail.
            </p>
            <Link 
              href="/auth/forgot-password"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              Solicitar novo link
            </Link>
          </div>
          <Link 
            href="/auth/login"
            className="text-sm text-gray-600 hover:text-gray-500 transition-colors"
          >
            Voltar ao login
          </Link>
        </div>
      </div>
    )
  }

  // Verificar sessão atual - se já estiver logado, redirecionar para dashboard
  if (supabase) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        redirect('/dashboard')
      }
    } catch (error) {
      console.log('Erro ao verificar sessão:', error)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Reset Password Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-md w-full space-y-6 sm:space-y-8">
          {/* Logo */}
          <div className="text-center">
            <img 
              src="/logo.svg" 
              alt="MediFlow" 
              className="mx-auto h-12 sm:h-16 w-auto mb-4 sm:mb-6"
            />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Redefinir senha
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Digite sua nova senha abaixo
            </p>
          </div>
          
          <ResetPasswordForm />
          
          <div className="text-center">
            <Link 
              href="/auth/login" 
              className="text-xs sm:text-sm text-gray-600 hover:text-gray-500 transition-colors"
            >
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
      
      {/* Right side - Illustration */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-green-50 to-green-100 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <img 
            src="/login-illustration.svg" 
            alt="Redefinir senha" 
            className="w-full h-auto mb-8"
          />
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Quase lá!
          </h3>
          <p className="text-gray-600">
            Defina uma nova senha segura para sua conta e volte a usar o MediFlow.
          </p>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Redefinir Senha - MediFlow',
  description: 'Redefina sua senha do MediFlow',
}
