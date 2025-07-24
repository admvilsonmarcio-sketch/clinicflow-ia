import { createServerClient } from '@/lib/supabase-server'
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
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          {/* Logo */}
          <div className="text-center">
            <img 
              src="/logo.svg" 
              alt="MediFlow" 
              className="mx-auto h-16 w-auto mb-6"
            />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-gray-600">
              Faça login para acessar sua conta
            </p>
          </div>
          
          <LoginForm />
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link 
                href="/auth/register" 
                className="font-semibold text-green-600 hover:text-green-500 transition-colors"
              >
                Criar conta gratuita
              </Link>
            </p>
          </div>
          
          {/* Footer */}
          <div className="text-center pt-8">
            <p className="text-xs text-gray-500">
              © 2024 MediFlow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side - Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700">
        <div className="max-w-lg w-full px-8">
          <img 
            src="/login-illustration.svg" 
            alt="MediFlow Illustration" 
            className="w-full h-auto"
          />
          
          <div className="text-center mt-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              A melhor experiência de gestão médica
            </h3>
            <p className="text-blue-100 text-lg leading-relaxed">
              Simplifique sua prática médica com nossa plataforma completa de CRM, 
              atendimento automatizado e IA contextual.
            </p>
            
            <div className="flex items-center justify-center space-x-8 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">99%</div>
                <div className="text-blue-200 text-sm">Satisfação</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-blue-200 text-sm">Suporte</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">100%</div>
                <div className="text-blue-200 text-sm">Seguro</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}