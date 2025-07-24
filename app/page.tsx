import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-500 to-blue-600">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image
              src="/logo.svg"
              alt="MediFlow Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="text-2xl font-bold text-white">MediFlow</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Entrar
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-white text-blue-600 hover:bg-gray-100">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-white">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              A melhor experiência de
              <span className="block text-yellow-300">gestão médica</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100 leading-relaxed">
              Simplifique sua prática médica com nossa plataforma completa de CRM, 
              atendimento automatizado e IA contextual.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">99%</div>
                <div className="text-sm text-blue-200">Satisfação</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">24/7</div>
                <div className="text-sm text-blue-200">Suporte</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">100%</div>
                <div className="text-sm text-blue-200">Seguro</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto bg-yellow-400 text-blue-900 hover:bg-yellow-300 font-semibold px-8">
                  Começar Gratuitamente
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <Image
                src="/login-illustration.svg"
                alt="MediFlow Dashboard"
                width={500}
                height={400}
                className="w-full h-auto"
              />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-yellow-400 text-blue-900 p-3 rounded-full text-2xl animate-bounce">
              🩺
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white/20 backdrop-blur-sm p-3 rounded-full text-2xl animate-pulse">
              📱
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Recursos que transformam sua prática médica
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-3">Atendimento Automatizado</h3>
              <p className="text-blue-100">
                Integração completa com WhatsApp e Instagram para atendimento 24/7 automatizado.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-3">IA Contextual</h3>
              <p className="text-blue-100">
                Assistente inteligente que entende o contexto médico e ajuda nas decisões.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3">Gestão Completa</h3>
              <p className="text-blue-100">
                CRM completo com prontuários eletrônicos, relatórios e análises detalhadas.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16">
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-white/80">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Image
                src="/logo.svg"
                alt="MediFlow Logo"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <span className="font-semibold">MediFlow</span>
            </div>
            <div className="text-sm">
              © 2024 MediFlow. Desenvolvido por Marshall Paiva.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}