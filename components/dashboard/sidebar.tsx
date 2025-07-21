'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  MessageCircle, 
  Settings,
  Activity,
  Brain
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Pacientes',
    href: '/dashboard/patients',
    icon: Users,
  },
  {
    name: 'Agenda',
    href: '/dashboard/appointments',
    icon: Calendar,
  },
  {
    name: 'Atendimento',
    href: '/dashboard/conversations',
    icon: MessageCircle,
  },
  {
    name: 'IA & Automação',
    href: '/dashboard/ai',
    icon: Brain,
  },
  {
    name: 'Relatórios',
    href: '/dashboard/reports',
    icon: Activity,
  },
  {
    name: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">MediFlow</h1>
        <p className="text-sm text-gray-500">CRM Médico</p>
      </div>
      
      <nav className="px-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}