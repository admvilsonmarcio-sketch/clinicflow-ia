import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface HeroSectionProps {
  priority?: boolean
}

export function HeroSection({ priority = true }: HeroSectionProps) {
  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xl font-bold text-slate-800">MediFlow</span>
            </div>
            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login" className="text-slate-600 hover:text-teal-600 transition-colors font-medium px-4 py-2">
                Login
              </Link>
              <Link href="/auth/register" className="bg-teal-600 text-white px-6 py-2.5 rounded-lg hover:bg-teal-700 transition-all duration-200 font-medium shadow-sm">
                Cadastrar
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {/* Promotional Banner */}
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="mr-2">🎉</span>
                <span className="font-semibold">Oferta especial: 30 dias grátis!</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Aumente sua receita em{' '}
                <span className="text-teal-600">até 40%</span>{' '}
                com nosso CRM
              </h1>

              {/* Description */}
              <p className="text-xl text-slate-600 leading-relaxed">
                Sistema completo de CRM com atendimento automatizado via WhatsApp/Instagram 
                e IA contextual para médicos e clínicas.
              </p>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-6 py-6">
                <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="text-2xl font-bold text-teal-600">40%</div>
                  <div className="text-sm text-slate-600 font-medium">Aumento na receita</div>
                </div>
                <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="text-2xl font-bold text-emerald-600">60%</div>
                  <div className="text-sm text-slate-600 font-medium">Menos tempo administrativo</div>
                </div>
                <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="text-2xl font-bold text-cyan-600">85%</div>
                  <div className="text-sm text-slate-600 font-medium">Retenção de pacientes</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  <Link href="/auth/register">
                    Começar Gratuitamente
                  </Link>
                </Button>
              </div>

              {/* Guarantee */}
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <span className="text-emerald-500 text-base">✓</span>
                <span className="font-medium">Sem compromisso • Cancele quando quiser • Suporte 24/7</span>
              </div>
            </div>

            {/* Illustration */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-emerald-400/20 rounded-2xl blur-3xl"></div>
              <Image
                src="/login-illustration.svg"
                alt="MediFlow Dashboard Illustration"
                width={600}
                height={400}
                priority={priority}
                className="w-full h-auto relative z-10"
                loading={priority ? "eager" : "lazy"}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}