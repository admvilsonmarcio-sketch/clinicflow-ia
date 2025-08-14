export default function BenefitsSection() {
  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <h2 className="mb-4 text-center text-3xl font-bold text-white sm:text-4xl lg:mb-6">
          Como o MediFlow vai transformar sua clínica
        </h2>
        <p className="mx-auto mb-12 max-w-2xl px-4 text-center text-slate-300 text-lg lg:mb-16">
          Veja os resultados reais que nossos clientes alcançaram em apenas 90 dias
        </p>
        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {/* Benefit 1 */}
          <div className="group rounded-2xl border border-teal-500/20 bg-white/5 p-6 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-teal-400/30 hover:shadow-2xl hover:shadow-teal-500/10 sm:p-8">
            <div className="mb-4 text-4xl sm:mb-6 sm:text-5xl">💰</div>
            <h3 className="mb-3 text-xl font-bold text-teal-300 sm:mb-4 sm:text-2xl">+300% de Receita</h3>
            <p className="mb-4 text-base text-slate-200 leading-relaxed sm:mb-6 sm:text-lg">
              Atendimento automatizado 24/7 que converte leads em pacientes enquanto você dorme.
            </p>
            <div className="text-sm text-emerald-300 font-semibold sm:text-base">
              ✓ Média de R$ 15.000 extras/mês
            </div>
          </div>
          
          {/* Benefit 2 */}
          <div className="group rounded-2xl border border-teal-500/20 bg-white/5 p-6 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-teal-400/30 hover:shadow-2xl hover:shadow-teal-500/10 sm:p-8">
            <div className="mb-4 text-4xl sm:mb-6 sm:text-5xl">⏰</div>
            <h3 className="mb-3 text-xl font-bold text-teal-300 sm:mb-4 sm:text-2xl">-70% Tempo Administrativo</h3>
            <p className="mb-4 text-base text-slate-200 leading-relaxed sm:mb-6 sm:text-lg">
              IA que automatiza agendamentos, prontuários e follow-ups. Mais tempo para pacientes.
            </p>
            <div className="text-sm text-emerald-300 font-semibold sm:text-base">
              ✓ 4h/dia economizadas em média
            </div>
          </div>
          
          {/* Benefit 3 */}
          <div className="group rounded-2xl border border-teal-500/20 bg-white/5 p-6 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-teal-400/30 hover:shadow-2xl hover:shadow-teal-500/10 sm:col-span-2 sm:p-8 lg:col-span-1">
            <div className="mb-4 text-4xl sm:mb-6 sm:text-5xl">📈</div>
            <h3 className="mb-3 text-xl font-bold text-teal-300 sm:mb-4 sm:text-2xl">+85% Retenção</h3>
            <p className="mb-4 text-base text-slate-200 leading-relaxed sm:mb-6 sm:text-lg">
              Sistema de follow-up inteligente que mantém pacientes engajados e fiéis.
            </p>
            <div className="text-sm text-emerald-300 font-semibold sm:text-base">
              ✓ Pacientes retornam 3x mais
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}