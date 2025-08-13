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
      <div className="flex min-h-screen items-center justify-center bg-white px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-md space-y-6 text-center">
          <img 
            src="/logo.svg" 
            alt="MediFlow" 
            className="mx-auto mb-4 h-12 w-auto sm:mb-6 sm:h-16"
          />
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="mb-2 text-xl font-semibold text-red-900">
              Link inválido ou expirado
            </h2>
            <p className="mb-4 text-sm text-red-700">
              {searchParams.error_description || 'O link de recuperação não é válido ou já expirou.'}
            </p>
            <Link 
              href="/auth/forgot-password"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Solicitar novo link
            </Link>
          </div>
          <Link 
            href="/auth/login"
            className="text-sm text-gray-600 transition-colors hover:text-gray-500"
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
      <div className="flex min-h-screen items-center justify-center bg-white px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-md space-y-6 text-center">
          <img 
            src="/logo.svg" 
            alt="MediFlow" 
            className="mx-auto mb-4 h-12 w-auto sm:mb-6 sm:h-16"
          />
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="mb-2 text-xl font-semibold text-red-900">
              Acesso não autorizado
            </h2>
            <p className="mb-4 text-sm text-red-700">
              Você precisa acessar esta página através do link enviado por e-mail.
            </p>
            <Link 
              href="/auth/forgot-password"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Solicitar novo link
            </Link>
          </div>
          <Link 
            href="/auth/login"
            className="text-sm text-gray-600 transition-colors hover:text-gray-500"
          >
            Voltar ao login
          </Link>
        </div>
      </div>
    )
  }

  // Para reset de senha, não redirecionar mesmo se houver sessão
  // A sessão é necessária para a API de atualização de senha funcionar

  return (
    <div className="flex min-h-screen">
      {/* Left side - Reset Password Form */}
      <div className="flex flex-1 items-center justify-center bg-white px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Logo */}
          <div className="text-center">
            <img 
              src="/logo.svg" 
              alt="MediFlow" 
              className="mx-auto mb-4 h-12 w-auto sm:mb-6 sm:h-16"
            />
            <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              Redefinir senha
            </h2>
            <p className="text-sm text-gray-600 sm:text-base">
              Digite sua nova senha abaixo
            </p>
          </div>
          
          <ResetPasswordForm />
          
          <div className="text-center">
            <Link 
              href="/auth/login" 
              className="text-xs text-gray-600 transition-colors hover:text-gray-500 sm:text-sm"
            >
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
      
      {/* Right side - Illustration */}
      <div className="hidden items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-8 lg:flex lg:flex-1">
        <div className="max-w-md text-center">
          <img 
            src="/login-illustration.svg" 
            alt="Redefinir senha" 
            className="mb-8 h-auto w-full"
          />
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
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
