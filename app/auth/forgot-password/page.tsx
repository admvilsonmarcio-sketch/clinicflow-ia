import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ForgotPasswordPage() {
  const supabase = createServerClient()

  // Verificar sessão apenas se o cliente Supabase estiver disponível
  if (supabase) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        redirect('/dashboard')
      }
    } catch (error) {
      // Ignorar erros de sessão durante o build ou problemas de conectividade
      console.log('Erro ao verificar sessão:', error)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Forgot Password Form */}
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
              Esqueceu sua senha?
            </h2>
            <p className="text-sm text-gray-600 sm:text-base">
              Digite seu email para receber as instruções de recuperação
            </p>
          </div>
          
          <ForgotPasswordForm />
          
          <div className="text-center">
            <p className="text-xs text-gray-600 sm:text-sm">
              Lembrou da senha?{' '}
              <Link 
                href="/auth/login" 
                className="font-medium text-green-600 transition-colors hover:text-green-500"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side - Illustration */}
      <div className="hidden items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-8 lg:flex lg:flex-1">
        <div className="max-w-md text-center">
          <img 
            src="/login-illustration.svg" 
            alt="Recuperação de senha" 
            className="mb-8 h-auto w-full"
          />
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            Recupere o acesso à sua conta
          </h3>
          <p className="text-gray-600">
            Enviaremos um link seguro para seu email para que você possa redefinir sua senha.
          </p>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Esqueceu a Senha - MediFlow',
  description: 'Recupere o acesso à sua conta MediFlow',
}
