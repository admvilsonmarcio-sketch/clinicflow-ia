import { createServerClient } from '@/lib/supabase-server'
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
    <div className="min-h-screen flex">
      {/* Left side - Forgot Password Form */}
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
              Esqueceu sua senha?
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Digite seu email para receber as instruções de recuperação
            </p>
          </div>
          
          <ForgotPasswordForm />
          
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Lembrou da senha?{' '}
              <Link 
                href="/auth/login" 
                className="font-medium text-green-600 hover:text-green-500 transition-colors"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side - Illustration */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-green-50 to-green-100 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <img 
            src="/login-illustration.svg" 
            alt="Recuperação de senha" 
            className="w-full h-auto mb-8"
          />
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
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