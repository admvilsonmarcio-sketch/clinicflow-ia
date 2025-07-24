import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MediFlow - CRM para Médicos e Clínicas',
  description: 'Sistema completo de CRM com atendimento automatizado via WhatsApp/Instagram e IA contextual para médicos e clínicas. Simplifique sua prática médica com nossa plataforma completa.',
  keywords: ['CRM médico', 'gestão clínica', 'atendimento automatizado', 'WhatsApp médico', 'IA médica', 'prontuário eletrônico'],
  authors: [{ name: 'Marshall Paiva' }],
  creator: 'Marshall Paiva',
  publisher: 'MediFlow',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://mediflow-tau.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'MediFlow - CRM para Médicos e Clínicas',
    description: 'A melhor experiência de gestão médica. Simplifique sua prática médica com nossa plataforma completa de CRM, atendimento automatizado e IA contextual.',
    url: 'https://mediflow-tau.vercel.app',
    siteName: 'MediFlow',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'MediFlow - CRM para Médicos e Clínicas - A melhor experiência de gestão médica',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MediFlow - CRM para Médicos e Clínicas',
    description: 'A melhor experiência de gestão médica. Simplifique sua prática médica com nossa plataforma completa.',
    images: ['/og-image.svg'],
    creator: '@mediflow',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}