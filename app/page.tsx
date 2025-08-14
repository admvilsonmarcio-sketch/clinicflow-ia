import { Suspense } from 'react'
import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/hero-section'
import { LazySections } from '@/components/home/lazy-sections'
import { Footer } from '@/components/home/footer'

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
    <>
      <main className="min-h-screen">
        <HeroSection priority />
        
        {/* Lazy loaded sections */}
        <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100" />}>
          <LazySections />
        </Suspense>
      </main>
      
      <Footer />
    </>
  )
}
