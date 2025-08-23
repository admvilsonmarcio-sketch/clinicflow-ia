
'use client'

import Link from 'next/link'
import { Calendar, Users, Stethoscope, Clock, CheckCircle, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DemoHomePage() {
  const features = [
    {
      icon: Calendar,
      title: 'FullCalendar Integrado',
      description: 'Visualização completa com drag & drop, redimensionamento e múltiplas views (mês, semana, dia, lista)'
    },
    {
      icon: Users,
      title: 'Gestão de Pacientes',
      description: 'Sistema completo de cadastro e gerenciamento de pacientes com validações'
    },
    {
      icon: Stethoscope,
      title: 'Médicos e Especialidades',
      description: 'Controle de médicos por especialidade com validação de conflitos de horários'
    },
    {
      icon: Clock,
      title: 'Validações de Negócio',
      description: 'Validação de horários, conflitos, intervalos mínimos e horário de funcionamento'
    },
    {
      icon: CheckCircle,
      title: 'CRUD Completo',
      description: 'Criar, ler, atualizar e deletar consultas com validações em tempo real'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 pb-16 pt-8">
        <div className="container mx-auto px-6">
          <div className="text-center text-white">
            <div className="mb-6">
              <Badge className="bg-white/20 text-white px-4 py-2">
                <Star className="mr-2 size-4" />
                Sistema Completo e Funcional
              </Badge>
            </div>
            
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Sistema de Agendamentos
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                MediFlow
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Demonstração completa do sistema de agendamentos médicos com FullCalendar, 
              validações avançadas de negócio, CRUD completo e interface moderna responsiva.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/demo/agendamentos">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3">
                  <Calendar className="mr-2 size-5" />
                  Acessar Demonstração
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
          <div className="absolute top-32 right-16 w-16 h-16 border-2 border-white rounded-lg rotate-45"></div>
          <div className="absolute bottom-16 left-20 w-12 h-12 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 border-2 border-white rounded-lg rotate-12"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Funcionalidades Implementadas
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sistema completo com todas as funcionalidades necessárias para um sistema de agendamentos médicos moderno
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="size-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Stack Tecnológica
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-3">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <p className="font-semibold text-gray-900">Next.js 14</p>
              <p className="text-sm text-gray-600">App Router</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center mb-3">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <p className="font-semibold text-gray-900">React 18</p>
              <p className="text-sm text-gray-600">Server Components</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-3">
                <span className="text-white font-bold text-lg">FC</span>
              </div>
              <p className="font-semibold text-gray-900">FullCalendar</p>
              <p className="text-sm text-gray-600">v6.1.19</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-3">
                <span className="text-white font-bold text-lg">TS</span>
              </div>
              <p className="font-semibold text-gray-900">TypeScript</p>
              <p className="text-sm text-gray-600">Type Safety</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              + Tailwind CSS, Zod Validations, Shadcn/UI, Date-fns
            </p>
            <Link href="/demo/agendamentos">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8">
                <Calendar className="mr-2 size-5" />
                Explorar Sistema Completo
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">
            Sistema de Agendamentos MediFlow - Demonstração Técnica
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Implementação completa com FullCalendar, validações e CRUD funcional
          </p>
        </div>
      </div>
    </div>
  )
}
