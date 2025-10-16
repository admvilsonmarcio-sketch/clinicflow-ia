import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
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
      {/* Left side - Login Form */}
      <div className="flex flex-1 items-center justify-center bg-white px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Logo */}
          <div className="text-center">
            <img 
              src="/clinicflow-logo-primary.png" 
              alt="MediFlow" 
              className="mx-auto mb-4 h-12 w-auto sm:mb-6 sm:h-16"
            />
            <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              Bem-vindo
            </h2>
            <p className="text-sm text-gray-600 sm:text-base">
              Faça login para acessar sua conta
            </p>
          </div>
          
          <LoginForm />
          
          <div className="text-center">
            <p className="text-xs text-gray-600 sm:text-sm">
              Não tem uma conta?{' '}
              <Link 
                href="/auth/register" 
                className="font-semibold text-green-600 transition-colors hover:text-green-500"
              >
                Criar conta gratuita
              </Link>
            </p>
          </div>
          
          {/* Footer */}
          <div className="pt-6 text-center sm:pt-8">
            <p className="text-xs text-gray-500">
              © 2025 MediFlow. Todos os direitos reservados.
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Desenvolvimento por{' '}
              <a 
                href="https://www.linkedin.com/in/marshallpaiva/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-green-600 transition-colors hover:text-green-500"
              >
                Marshall Paiva
              </a>
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side - Illustration */}
      <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 md:flex">
        <div className="w-full max-w-lg px-6 lg:px-8">
          <img 
            src="/login-illustration.svg" 
            alt="MediFlow Illustration" 
            className="h-auto w-full"
          />
          
          <div className="mt-6 text-center lg:mt-8">
            <h3 className="mb-3 text-xl font-bold text-white lg:mb-4 lg:text-2xl">
              A melhor experiência de gestão médica
            </h3>
            <p className="text-base leading-relaxed text-blue-100 lg:text-lg">
              Simplifique sua prática médica com nossa plataforma completa de CRM, 
              atendimento automatizado e IA contextual.
            </p>
            
            <div className="mt-6 flex items-center justify-center space-x-4 lg:mt-8 lg:space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white lg:text-3xl">99%</div>
                <div className="text-xs text-blue-200 lg:text-sm">Satisfação</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white lg:text-3xl">24/7</div>
                <div className="text-xs text-blue-200 lg:text-sm">Suporte</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white lg:text-3xl">100%</div>
                <div className="text-xs text-blue-200 lg:text-sm">Seguro</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
