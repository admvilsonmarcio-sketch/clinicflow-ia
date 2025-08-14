export default function TestimonialsSection() {
  return (
    <section className="bg-gradient-to-br from-slate-50 to-teal-50 py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 px-4 text-center text-3xl font-bold text-slate-900 sm:text-4xl lg:mb-12">
          O que nossos clientes estão dizendo
        </h2>
        
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          {/* Testimonial 1 */}
          <div className="group rounded-2xl bg-white p-6 shadow-lg border border-slate-200 transition-all duration-300 hover:shadow-xl hover:border-teal-300 sm:p-8">
            <div className="mb-4 flex items-center sm:mb-6">
              <div className="mr-4 flex size-12 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white sm:mr-5 sm:size-14 sm:text-base">
                DR
              </div>
              <div>
                <div className="text-base font-bold text-slate-900 sm:text-lg">Dr. Carlos Silva</div>
                <div className="text-sm text-slate-600 sm:text-base">Cardiologista - São Paulo</div>
              </div>
            </div>
            <p className="mb-4 text-base leading-relaxed text-slate-700 sm:mb-6 sm:text-lg">
              Em 3 meses, minha receita aumentou 280%. O atendimento automatizado trouxe 150 novos pacientes. 
              Nunca imaginei que seria tão fácil!
            </p>
            <div className="text-sm text-amber-600 font-semibold sm:text-base">⭐⭐⭐⭐⭐ 5/5 estrelas</div>
          </div>
          
          {/* Testimonial 2 */}
          <div className="group rounded-2xl bg-white p-6 shadow-lg border border-slate-200 transition-all duration-300 hover:shadow-xl hover:border-teal-300 sm:p-8">
            <div className="mb-4 flex items-center sm:mb-6">
              <div className="mr-4 flex size-12 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white sm:mr-5 sm:size-14 sm:text-base">
                DRA
              </div>
              <div>
                <div className="text-base font-bold text-slate-900 sm:text-lg">Dra. Ana Costa</div>
                <div className="text-sm text-slate-600 sm:text-base">Dermatologista - Rio de Janeiro</div>
              </div>
            </div>
            <p className="mb-4 text-base leading-relaxed text-slate-700 sm:mb-6 sm:text-lg">
              Economizo 5 horas por dia com a automação. Agora posso focar no que realmente importa: 
              cuidar dos meus pacientes.
            </p>
            <div className="text-sm text-amber-600 font-semibold sm:text-base">⭐⭐⭐⭐⭐ 5/5 estrelas</div>
          </div>
        </div>
      </div>
    </section>
  )
}