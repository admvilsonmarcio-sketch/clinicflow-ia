import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      {/* Skip link removido a pedido do usuário */}

      {/* Cabeçalho novo: marca + navegação responsiva */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3 md:gap-6">
          {/* Marca usando logo SVG dedicado */}
          <Link href="/" className="flex items-center gap-3" aria-label="Página inicial MediFlow">
            <img src="/logo.svg" alt="MediFlow" className="h-8 w-auto md:h-9" />
          </Link>

          {/* Navegação desktop */}
          <nav aria-label="principal" className="hidden items-center gap-6 md:flex">
            <Link
              href="#beneficios"
              className="rounded text-sm text-slate-300 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Benefícios
            </Link>
            <Link
              href="#depoimentos"
              className="rounded text-sm text-slate-300 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Depoimentos
            </Link>
            <Link
              href="#oferta"
              className="rounded text-sm text-slate-300 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Oferta
            </Link>
          </nav>

          {/* Ações + Menu mobile */}
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="hidden rounded-md px-3 py-2 text-sm text-slate-300 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 md:inline"
            >
              Entrar
            </Link>
            <Link
              href="/auth/register"
              className="hidden rounded-md bg-gradient-to-r from-teal-500 to-emerald-500 px-3 py-2 text-sm font-medium text-white shadow-lg shadow-teal-500/20 outline-none transition-colors hover:from-teal-400 hover:to-emerald-400 focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 md:inline"
            >
              Começar grátis
            </Link>

            {/* Menu mobile sem JS */}
            <details className="relative md:hidden">
              <summary aria-label="Abrir menu" aria-controls="mobile-menu" className="flex cursor-pointer list-none items-center justify-center rounded-md border border-white/10 bg-white/5 p-2 text-slate-200 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                <span className="sr-only">Abrir menu</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </summary>
              <div id="mobile-menu" className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-white/10 bg-slate-900/95 p-2 shadow-xl backdrop-blur">
                <div className="grid">
                  <Link href="#beneficios" className="rounded-md px-3 py-2 text-sm text-slate-200 outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
                    Benefícios
                  </Link>
                  <Link href="#depoimentos" className="rounded-md px-3 py-2 text-sm text-slate-200 outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
                    Depoimentos
                  </Link>
                  <Link href="#oferta" className="rounded-md px-3 py-2 text-sm text-slate-200 outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
                    Oferta
                  </Link>
                </div>
                <div className="mt-2 grid gap-2 border-t border-white/10 pt-2">
                  <Link href="/auth/login" className="rounded-md px-3 py-2 text-sm text-slate-300 outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
                    Entrar
                  </Link>
                  <Link
                    href="/auth/register"
                    className="rounded-md bg-gradient-to-r from-teal-500 to-emerald-500 px-3 py-2 text-center text-sm font-medium text-white shadow-lg shadow-teal-500/20 outline-none hover:from-teal-400 hover:to-emerald-400 focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  >
                    Começar grátis
                  </Link>
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>

      <main id="inicio" className="bg-slate-950 text-slate-100">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-white/5">
          {/* fundo discreto */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 top-0 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
          </div>

          <div className="container relative mx-auto grid gap-10 px-4 py-16 md:grid-cols-2 md:py-20">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs text-teal-300">
                <span className="h-2 w-2 rounded-full bg-teal-400" /> 30 dias grátis • Cancele quando quiser
              </span>
              <h1 className="mt-2 text-3xl font-semibold text-white md:text-5xl">
                Aumente sua receita médica em até 300% com IA + Automação
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300 md:text-lg">
                O CRM médico que capta, converte e fideliza pacientes 24/7. Atendimentos automatizados no WhatsApp,
                funis inteligentes e gestão completa em uma única plataforma.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/auth/register"
                  className="rounded-md bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-teal-500/20 hover:from-teal-400 hover:to-emerald-400"
                >
                  Testar gratuitamente
                </Link>
                <Link
                  href="#beneficios"
                  className="rounded-md border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white hover:bg-white/10"
                >
                  Ver como funciona
                </Link>
              </div>

              <ul className="mt-6 flex flex-wrap items-center gap-6 text-sm text-slate-400">
                <li>✓ Sem cartão de crédito</li>
                <li>✓ Suporte humano</li>
                <li>✓ Segurança e LGPD</li>
              </ul>
            </div>

            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900 to-black p-4">
              <img
                src="/login-illustration.svg"
                alt="Demonstração da plataforma MediFlow"
                className="mx-auto h-auto w-full max-w-md"
              />
            </div>
          </div>
        </section>

        {/* BENEFÍCIOS */}
        <section id="beneficios" className="border-b border-white/5">
          <div className="container mx-auto px-4 py-16">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold text-white md:text-3xl">Por que a MediFlow?</h2>
              <p className="mt-3 text-slate-300">
                Entregue experiências modernas e aumente sua receita com um fluxo unificado de captação, atendimento e gestão.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  title: 'Captação que funciona',
                  desc: 'Automação no WhatsApp, funis e IA treinada para converter leads em pacientes.',
                  icon: '💬',
                },
                {
                  title: 'Gestão completa',
                  desc: 'Agenda, prontuário, financeiro e relatórios com insights acionáveis.',
                  icon: '📊',
                },
                {
                  title: 'Segurança e conformidade',
                  desc: 'LGPD, backups e criptografia de ponta a ponta para dados sensíveis.',
                  icon: '🔒',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-teal-400/20 bg-white/5 p-6 shadow-sm hover:border-teal-400/40"
                >
                  <div className="mb-3 text-2xl" aria-hidden>
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-medium text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DEPOIMENTOS */}
        <section id="depoimentos" className="border-b border-white/5">
          <div className="container mx-auto px-4 py-16">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold text-white md:text-3xl">Resultados reais</h2>
              <p className="mt-3 text-slate-300">Médicos de várias especialidades aumentando receita com a MediFlow.</p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  name: 'Dra. Camila',
                  role: 'Dermatologista',
                  quote:
                    'Em 60 dias, reduzi o no-show e dobrei minhas consultas particulares. O WhatsApp automatizado é incrível.',
                },
                {
                  name: 'Dr. André',
                  role: 'Ortopedista',
                  quote:
                    'A IA realmente ajuda no atendimento. Leads chegam prontos e a equipe foca no que importa.',
                },
                {
                  name: 'Dra. Luana',
                  role: 'Ginecologista',
                  quote:
                    'Migrei de outro sistema e a transição foi suave. O suporte é impecável e os resultados aparecem rápido.',
                },
              ].map((t) => (
                <figure
                  key={t.name}
                  className="rounded-xl border border-emerald-400/20 bg-white/5 p-6 shadow-sm hover:border-emerald-400/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-slate-800 text-sm font-medium">
                      {t.name.split(' ')[1]?.[0] ?? t.name[0]}
                    </div>
                    <figcaption className="flex flex-col">
                      <span className="text-sm font-medium text-white">{t.name}</span>
                      <span className="text-xs text-slate-400">{t.role}</span>
                    </figcaption>
                  </div>
                  <blockquote className="mt-4 text-sm italic text-slate-300">{t.quote}</blockquote>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* URGÊNCIA / OFERTA */}
        <section id="oferta" className="border-b border-white/5">
          <div className="container mx-auto px-4 py-16">
            <div className="rounded-2xl border border-teal-400/20 bg-gradient-to-br from-slate-900 to-black p-6 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs text-teal-300">
                ⏳ Vagas limitadas neste mês
              </span>
              <h3 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
                30 dias grátis + Onboarding com especialista
              </h3>
              <p className="mt-2 text-slate-300">
                Ative sua conta agora e tenha implementação guiada para começar a ver resultados em poucas semanas.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/auth/register"
                  className="rounded-md bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-teal-500/20 hover:from-teal-400 hover:to-emerald-400"
                >
                  Começar agora
                </Link>
                <Link
                  href="/auth/login"
                  className="rounded-md border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
                >
                  Já possuo conta
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé simples */}
      <footer className="border-t border-white/5 bg-slate-950">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              {/* Marca no rodapé usando logo SVG */}
              <Link href="/" className="flex items-center gap-3" aria-label="Página inicial MediFlow">
                <img src="/logo.svg" alt="MediFlow" className="h-7 w-auto md:h-8" />
              </Link>
              <span className="text-sm text-slate-400">
                © {new Date().getFullYear()} MediFlow. Todos os direitos reservados.
              </span>
            </div>
            <nav className="flex items-center gap-4 text-sm text-slate-400">
              <Link href="/auth/register" className="rounded outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">Criar conta</Link>
              <Link href="/auth/login" className="rounded outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">Entrar</Link>
              <Link href="#beneficios" className="rounded outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">Benefícios</Link>
              <Link href="#depoimentos" className="rounded outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">Depoimentos</Link>
            </nav>
          </div>
        </div>
      </footer>
    </>
  )
}