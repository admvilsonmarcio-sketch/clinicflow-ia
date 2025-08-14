import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function UrgencyCTASection() {
  return (
    <section className="bg-gradient-to-br from-teal-900 via-slate-800 to-slate-900 py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white shadow-2xl sm:p-12">
            <h2 className="mb-4 text-3xl font-bold sm:mb-6 sm:text-4xl lg:text-5xl">
              🚨 ÚLTIMAS 48 HORAS - Oferta Especial
            </h2>
            <p className="mb-6 text-xl sm:mb-8 sm:text-2xl lg:text-3xl">
              <strong>30 dias grátis + Setup personalizado</strong> (valor R$ 2.500)
            </p>
            <div className="mb-8 flex flex-col justify-center gap-4 text-sm sm:mb-10 sm:flex-row sm:gap-8 sm:text-base lg:text-lg">
              <div className="flex items-center justify-center gap-3">
                <span className="text-white text-lg">✓</span>
                <span className="font-semibold">Sem taxa de setup</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-white text-lg">✓</span>
                <span className="font-semibold">Migração gratuita</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-white text-lg">✓</span>
                <span className="font-semibold">Treinamento incluído</span>
              </div>
            </div>
            <Link href="/auth/register">
              <Button size="lg" className="w-full bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 hover:border-slate-600 px-6 py-4 text-base font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-slate-900/50 sm:w-auto sm:px-10 sm:py-5 sm:text-lg lg:px-14 lg:py-6 lg:text-xl xl:text-2xl">
                <span className="block sm:hidden">🎯 GARANTIR VAGA</span>
                <span className="hidden sm:block">🎯 GARANTIR MINHA VAGA AGORA</span>
              </Button>
            </Link>
            <p className="mt-4 text-sm opacity-90 sm:mt-6 sm:text-base lg:text-lg">
              ⏰ Restam apenas 12 vagas para esta oferta
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}