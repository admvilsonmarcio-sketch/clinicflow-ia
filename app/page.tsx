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
      <main className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div className="text-white order-2 lg:order-1">
            <div className="mb-3 sm:mb-4">
              <span className="bg-yellow-400 text-blue-900 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold">
                🔥 OFERTA LIMITADA - 30 DIAS GRÁTIS
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              Aumente sua receita em
              <span className="block text-yellow-300">até 300% em 90 dias</span>
            </h1>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-blue-100 leading-relaxed">
              <strong>Mais de 2.500 médicos</strong> já aumentaram seus lucros com nossa plataforma de CRM médico, 
              atendimento automatizado 24/7 e IA que converte leads em pacientes.
            </p>
            
            {/* Stats */}
             <div className="grid grid-cols-3 gap-6 mb-8">
               <div className="text-center">
                 <div className="text-3xl font-bold text-yellow-300">+300%</div>
                 <div className="text-sm text-blue-200">Aumento de Receita</div>
               </div>
               <div className="text-center">
                 <div className="text-3xl font-bold text-yellow-300">2.500+</div>
                 <div className="text-sm text-blue-200">Médicos Ativos</div>
               </div>
               <div className="text-center">
                 <div className="text-3xl font-bold text-yellow-300">R$ 2M+</div>
                 <div className="text-sm text-blue-200">Receita Gerada</div>
               </div>
             </div>

            {/* CTA Buttons */}
             <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
               <Link href="/auth/register" className="w-full sm:w-auto">
                 <Button size="lg" className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 hover:from-yellow-300 hover:to-yellow-400 font-bold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                   🚀 COMEÇAR TESTE GRÁTIS AGORA
                 </Button>
               </Link>
               <Link href="/auth/login" className="w-full sm:w-auto">
                 <Button size="lg" variant="outline" className="w-full border-2 border-white/60 text-blue-600 hover:bg-white hover:text-blue-900 hover:border-white font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg transition-all duration-200">
                   Entrar na Conta
                 </Button>
               </Link>
             </div>
             
             {/* Guarantee */}
             <div className="flex items-center justify-center sm:justify-start gap-2 text-blue-100 text-xs sm:text-sm">
               <span className="text-green-400">✓</span>
               <span className="text-center sm:text-left">Sem cartão de crédito • Cancele quando quiser • Suporte 24/7</span>
             </div>
          </div>

          {/* Illustration */}
          <div className="relative order-1 lg:order-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8">
              <Image
                src="/login-illustration.svg"
                alt="MediFlow Dashboard"
                width={500}
                height={400}
                className="w-full h-auto"
              />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-yellow-400 text-blue-900 p-2 sm:p-3 rounded-full text-lg sm:text-2xl animate-bounce">
              🩺
            </div>
            <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-full text-lg sm:text-2xl animate-pulse">
              📱
            </div>
          </div>
        </div>

        {/* Benefits Section */}
         <div className="mt-16 lg:mt-24">
           <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3 lg:mb-4">
             Como o MediFlow vai transformar sua clínica
           </h2>
           <p className="text-center text-blue-100 mb-8 lg:mb-12 max-w-2xl mx-auto px-4">
             Veja os resultados reais que nossos clientes alcançaram em apenas 90 dias
           </p>
           
           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
             {/* Benefit 1 */}
             <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-white border border-yellow-400/20">
               <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">💰</div>
               <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-yellow-300">+300% de Receita</h3>
               <p className="text-blue-100 mb-3 sm:mb-4 text-sm sm:text-base">
                 Atendimento automatizado 24/7 que converte leads em pacientes enquanto você dorme.
               </p>
               <div className="text-xs sm:text-sm text-green-300">
                 ✓ Média de R$ 15.000 extras/mês
               </div>
             </div>
             
             {/* Benefit 2 */}
             <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-white border border-yellow-400/20">
               <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">⏰</div>
               <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-yellow-300">-70% Tempo Administrativo</h3>
               <p className="text-blue-100 mb-3 sm:mb-4 text-sm sm:text-base">
                 IA que automatiza agendamentos, prontuários e follow-ups. Mais tempo para pacientes.
               </p>
               <div className="text-xs sm:text-sm text-green-300">
                 ✓ 4h/dia economizadas em média
               </div>
             </div>
             
             {/* Benefit 3 */}
             <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-white border border-yellow-400/20 sm:col-span-2 lg:col-span-1">
               <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📈</div>
               <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-yellow-300">+85% Retenção</h3>
               <p className="text-blue-100 mb-3 sm:mb-4 text-sm sm:text-base">
                 Sistema de follow-up inteligente que mantém pacientes engajados e fiéis.
               </p>
               <div className="text-xs sm:text-sm text-green-300">
                 ✓ Pacientes retornam 3x mais
               </div>
             </div>
           </div>
         </div>

         {/* Testimonials Section */}
         <div className="mt-16 lg:mt-24">
           <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8 lg:mb-12 px-4">
             O que nossos clientes estão dizendo
           </h2>
           
           <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
             {/* Testimonial 1 */}
             <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-white">
               <div className="flex items-center mb-3 sm:mb-4">
                 <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 font-bold mr-3 sm:mr-4 text-sm sm:text-base">
                   DR
                 </div>
                 <div>
                   <div className="font-semibold text-sm sm:text-base">Dr. Carlos Silva</div>
                   <div className="text-xs sm:text-sm text-blue-200">Cardiologista - São Paulo</div>
                 </div>
               </div>
               <p className="text-blue-100 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
                 Em 3 meses, minha receita aumentou 280%. O atendimento automatizado trouxe 150 novos pacientes. 
                 Nunca imaginei que seria tão fácil!
               </p>
               <div className="text-yellow-300 text-xs sm:text-sm">⭐⭐⭐⭐⭐ 5/5 estrelas</div>
             </div>
             
             {/* Testimonial 2 */}
             <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-white">
               <div className="flex items-center mb-3 sm:mb-4">
                 <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 font-bold mr-3 sm:mr-4 text-sm sm:text-base">
                   DRA
                 </div>
                 <div>
                   <div className="font-semibold text-sm sm:text-base">Dra. Ana Costa</div>
                   <div className="text-xs sm:text-sm text-blue-200">Dermatologista - Rio de Janeiro</div>
                 </div>
               </div>
               <p className="text-blue-100 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
                 Economizo 5 horas por dia com a automação. Agora posso focar no que realmente importa: 
                 cuidar dos meus pacientes.
               </p>
               <div className="text-yellow-300 text-xs sm:text-sm">⭐⭐⭐⭐⭐ 5/5 estrelas</div>
             </div>
           </div>
         </div>

         {/* Urgency CTA Section */}
         <div className="mt-16 lg:mt-24 text-center">
           <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 sm:p-8 text-blue-900">
             <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
               🚨 ÚLTIMAS 48 HORAS - Oferta Especial
             </h2>
             <p className="text-lg sm:text-xl mb-4 sm:mb-6">
               <strong>30 dias grátis + Setup personalizado</strong> (valor R$ 2.500)
             </p>
             <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-8 mb-4 sm:mb-6 text-xs sm:text-sm">
               <div className="flex items-center justify-center gap-2">
                 <span className="text-green-600">✓</span>
                 <span>Sem taxa de setup</span>
               </div>
               <div className="flex items-center justify-center gap-2">
                 <span className="text-green-600">✓</span>
                 <span>Migração gratuita</span>
               </div>
               <div className="flex items-center justify-center gap-2">
                 <span className="text-green-600">✓</span>
                 <span>Treinamento incluído</span>
               </div>
             </div>
             <Link href="/auth/register">
               <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 font-bold px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 border-2 border-blue-500 w-full sm:w-auto">
                 🎯 GARANTIR MINHA VAGA AGORA
               </Button>
             </Link>
             <p className="text-xs sm:text-sm mt-3 sm:mt-4 opacity-80">
               ⏰ Restam apenas 12 vagas para esta oferta
             </p>
           </div>
         </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-6 sm:py-8 mt-12 sm:mt-16">
        <div className="border-t border-white/20 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-white/80 gap-4">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm sm:text-base">MediFlow</span>
            </div>
            <div className="text-xs sm:text-sm text-center">
              © 2024 MediFlow. Todos os direitos reservados.{' '}
              <a 
                href="https://www.linkedin.com/in/marshallpaiva/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-yellow-300 hover:text-yellow-200 transition-colors duration-200 font-medium"
              >
                Marshall Paiva
              </a>
              .
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}