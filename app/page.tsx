import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MediFlow - Aumente sua Receita Médica em até 300% | CRM + IA + Automação',
  description: 'Mais de 2.500 médicos já aumentaram seus lucros com nossa plataforma. CRM médico com atendimento automatizado 24/7, IA que converte leads em pacientes e sistema completo de gestão. Teste grátis por 30 dias!',
  keywords: [
    'CRM médico',
    'aumentar receita médica',
    'atendimento automatizado médico',
    'IA para médicos',
    'gestão clínica',
    'WhatsApp médico',
    'automação médica',
    'prontuário eletrônico',
    'marketing médico',
    'captação de pacientes',
    'retenção de pacientes',
    'sistema médico'
  ],
  openGraph: {
    title: 'MediFlow - Aumente sua Receita Médica em até 300% em 90 dias',
    description: 'Mais de 2.500 médicos já aumentaram seus lucros. Atendimento automatizado 24/7 + IA que converte leads + CRM completo. 30 dias grátis!',
    type: 'website',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'MediFlow - Plataforma que aumenta receita médica em até 300%',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MediFlow - Aumente sua Receita Médica em até 300%',
    description: 'Mais de 2.500 médicos já aumentaram seus lucros. Teste grátis por 30 dias!',
    images: ['/og-image.svg'],
  },
  alternates: {
    canonical: '/',
  },
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-500 to-blue-600">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">MediFlow</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/auth/login">
              <Button variant="outline" className="border-white/20 bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20 sm:px-4 sm:text-base">
                <span className="block sm:hidden">Login</span>
                <span className="hidden sm:block">Entrar</span>
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-white px-3 py-2 text-sm text-blue-600 hover:bg-gray-100 sm:px-4 sm:text-base">
                <span className="block sm:hidden">Grátis</span>
                <span className="hidden sm:block">Começar Grátis</span>
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Content */}
          <div className="order-2 text-white lg:order-1">
            <div className="mb-3 sm:mb-4">
              <span className="rounded-full bg-yellow-400 px-3 py-2 text-xs font-semibold text-blue-900 sm:px-4 sm:text-sm">
                🔥 OFERTA LIMITADA - 30 DIAS GRÁTIS
              </span>
            </div>
            <h1 className="mb-4 text-3xl font-bold leading-tight sm:mb-6 sm:text-4xl lg:text-5xl xl:text-6xl">
              Aumente sua receita em
              <span className="block text-yellow-300">até 300% em 90 dias</span>
            </h1>
            <p className="mb-6 text-lg leading-relaxed text-blue-100 sm:mb-8 sm:text-xl">
              <strong>Mais de 2.500 médicos</strong> já aumentaram seus lucros com nossa plataforma de CRM médico, 
              atendimento automatizado 24/7 e IA que converte leads em pacientes.
            </p>
            
            {/* Stats */}
             <div className="mb-8 grid grid-cols-3 gap-6">
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
             <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:gap-4">
               <Link href="/auth/register" className="w-full sm:w-auto">
                 <Button size="lg" className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-3 text-sm font-bold text-blue-900 shadow-lg transition-all duration-200 hover:scale-105 hover:from-yellow-300 hover:to-yellow-400 hover:shadow-xl sm:px-8 sm:py-4 sm:text-base lg:text-lg">
                   <span className="block sm:hidden">🚀 TESTE GRÁTIS</span>
                   <span className="hidden sm:block">🚀 COMEÇAR TESTE GRÁTIS AGORA</span>
                 </Button>
               </Link>
               <Link href="/auth/login" className="w-full sm:w-auto">
                 <Button size="lg" variant="outline" className="w-full border-2 border-white/60 px-4 py-3 text-sm font-semibold text-blue-600 transition-all duration-200 hover:border-white hover:bg-white hover:text-blue-900 sm:px-8 sm:py-4 sm:text-base lg:text-lg">
                   <span className="block sm:hidden">Entrar</span>
                   <span className="hidden sm:block">Entrar na Conta</span>
                 </Button>
               </Link>
             </div>
             
             {/* Guarantee */}
             <div className="flex items-center justify-center gap-2 text-xs text-blue-100 sm:justify-start sm:text-sm">
               <span className="text-green-400">✓</span>
               <span className="text-center sm:text-left">Sem cartão de crédito • Cancele quando quiser • Suporte 24/7</span>
             </div>
          </div>

          {/* Illustration */}
          <div className="relative order-1 lg:order-2">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm sm:p-6 lg:p-8">
              <Image
                src="/login-illustration.svg"
                alt="MediFlow Dashboard"
                width={500}
                height={400}
                className="h-auto w-full"
              />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -right-2 -top-2 animate-bounce rounded-full bg-yellow-400 p-2 text-lg text-blue-900 sm:-right-4 sm:-top-4 sm:p-3 sm:text-2xl">
              🩺
            </div>
            <div className="absolute -bottom-2 -left-2 animate-pulse rounded-full bg-white/20 p-2 text-lg backdrop-blur-sm sm:-bottom-4 sm:-left-4 sm:p-3 sm:text-2xl">
              📱
            </div>
          </div>
        </div>

        {/* Benefits Section */}
         <div className="mt-16 lg:mt-24">
           <h2 className="mb-3 text-center text-2xl font-bold text-white sm:text-3xl lg:mb-4">
             Como o MediFlow vai transformar sua clínica
           </h2>
           <p className="mx-auto mb-8 max-w-2xl px-4 text-center text-blue-100 lg:mb-12">
             Veja os resultados reais que nossos clientes alcançaram em apenas 90 dias
           </p>
           
           <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
             {/* Benefit 1 */}
             <div className="rounded-xl border border-yellow-400/20 bg-white/10 p-4 text-white backdrop-blur-sm sm:p-6">
               <div className="mb-3 text-3xl sm:mb-4 sm:text-4xl">💰</div>
               <h3 className="mb-2 text-lg font-semibold text-yellow-300 sm:mb-3 sm:text-xl">+300% de Receita</h3>
               <p className="mb-3 text-sm text-blue-100 sm:mb-4 sm:text-base">
                 Atendimento automatizado 24/7 que converte leads em pacientes enquanto você dorme.
               </p>
               <div className="text-xs text-green-300 sm:text-sm">
                 ✓ Média de R$ 15.000 extras/mês
               </div>
             </div>
             
             {/* Benefit 2 */}
             <div className="rounded-xl border border-yellow-400/20 bg-white/10 p-4 text-white backdrop-blur-sm sm:p-6">
               <div className="mb-3 text-3xl sm:mb-4 sm:text-4xl">⏰</div>
               <h3 className="mb-2 text-lg font-semibold text-yellow-300 sm:mb-3 sm:text-xl">-70% Tempo Administrativo</h3>
               <p className="mb-3 text-sm text-blue-100 sm:mb-4 sm:text-base">
                 IA que automatiza agendamentos, prontuários e follow-ups. Mais tempo para pacientes.
               </p>
               <div className="text-xs text-green-300 sm:text-sm">
                 ✓ 4h/dia economizadas em média
               </div>
             </div>
             
             {/* Benefit 3 */}
             <div className="rounded-xl border border-yellow-400/20 bg-white/10 p-4 text-white backdrop-blur-sm sm:col-span-2 sm:p-6 lg:col-span-1">
               <div className="mb-3 text-3xl sm:mb-4 sm:text-4xl">📈</div>
               <h3 className="mb-2 text-lg font-semibold text-yellow-300 sm:mb-3 sm:text-xl">+85% Retenção</h3>
               <p className="mb-3 text-sm text-blue-100 sm:mb-4 sm:text-base">
                 Sistema de follow-up inteligente que mantém pacientes engajados e fiéis.
               </p>
               <div className="text-xs text-green-300 sm:text-sm">
                 ✓ Pacientes retornam 3x mais
               </div>
             </div>
           </div>
         </div>

         {/* Testimonials Section */}
         <div className="mt-16 lg:mt-24">
           <h2 className="mb-8 px-4 text-center text-2xl font-bold text-white sm:text-3xl lg:mb-12">
             O que nossos clientes estão dizendo
           </h2>
           
           <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
             {/* Testimonial 1 */}
             <div className="rounded-xl bg-white/10 p-4 text-white backdrop-blur-sm sm:p-6">
               <div className="mb-3 flex items-center sm:mb-4">
                 <div className="mr-3 flex size-10 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-blue-900 sm:mr-4 sm:size-12 sm:text-base">
                   DR
                 </div>
                 <div>
                   <div className="text-sm font-semibold sm:text-base">Dr. Carlos Silva</div>
                   <div className="text-xs text-blue-200 sm:text-sm">Cardiologista - São Paulo</div>
                 </div>
               </div>
               <p className="mb-3 text-sm leading-relaxed text-blue-100 sm:mb-4 sm:text-base">
                 Em 3 meses, minha receita aumentou 280%. O atendimento automatizado trouxe 150 novos pacientes. 
                 Nunca imaginei que seria tão fácil!
               </p>
               <div className="text-xs text-yellow-300 sm:text-sm">⭐⭐⭐⭐⭐ 5/5 estrelas</div>
             </div>
             
             {/* Testimonial 2 */}
             <div className="rounded-xl bg-white/10 p-4 text-white backdrop-blur-sm sm:p-6">
               <div className="mb-3 flex items-center sm:mb-4">
                 <div className="mr-3 flex size-10 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-blue-900 sm:mr-4 sm:size-12 sm:text-base">
                   DRA
                 </div>
                 <div>
                   <div className="text-sm font-semibold sm:text-base">Dra. Ana Costa</div>
                   <div className="text-xs text-blue-200 sm:text-sm">Dermatologista - Rio de Janeiro</div>
                 </div>
               </div>
               <p className="mb-3 text-sm leading-relaxed text-blue-100 sm:mb-4 sm:text-base">
                 Economizo 5 horas por dia com a automação. Agora posso focar no que realmente importa: 
                 cuidar dos meus pacientes.
               </p>
               <div className="text-xs text-yellow-300 sm:text-sm">⭐⭐⭐⭐⭐ 5/5 estrelas</div>
             </div>
           </div>
         </div>

         {/* Urgency CTA Section */}
         <div className="mt-16 text-center lg:mt-24">
           <div className="rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 p-6 text-blue-900 sm:p-8">
             <h2 className="mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl">
               🚨 ÚLTIMAS 48 HORAS - Oferta Especial
             </h2>
             <p className="mb-4 text-lg sm:mb-6 sm:text-xl">
               <strong>30 dias grátis + Setup personalizado</strong> (valor R$ 2.500)
             </p>
             <div className="mb-4 flex flex-col justify-center gap-3 text-xs sm:mb-6 sm:flex-row sm:gap-8 sm:text-sm">
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
               <Button size="lg" className="w-full border-2 border-blue-500 bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-blue-700 hover:shadow-blue-500/25 sm:w-auto sm:px-8 sm:py-4 sm:text-base lg:px-12 lg:text-lg xl:text-xl">
                 <span className="block sm:hidden">🎯 GARANTIR VAGA</span>
                 <span className="hidden sm:block">🎯 GARANTIR MINHA VAGA AGORA</span>
               </Button>
             </Link>
             <p className="mt-3 text-xs opacity-80 sm:mt-4 sm:text-sm">
               ⏰ Restam apenas 12 vagas para esta oferta
             </p>
           </div>
         </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto mt-12 px-4 py-6 sm:mt-16 sm:py-8">
        <div className="border-t border-white/20 pt-6 sm:pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-white/80 md:flex-row">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold sm:text-base">MediFlow</span>
            </div>
            <div className="text-center text-xs sm:text-sm">
              © 2025 MediFlow. Todos os direitos reservados.{' '}
              <a 
                href="https://www.linkedin.com/in/marshallpaiva/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-yellow-300 transition-colors duration-200 hover:text-yellow-200"
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
