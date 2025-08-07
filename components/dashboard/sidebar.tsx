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
  Brain,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'

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

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Backdrop para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "bg-white shadow-sm border-r border-gray-200 min-h-screen transition-transform duration-300 ease-in-out",
        "fixed md:relative z-50 md:z-auto",
        "w-64",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "md:block"
      )}>
        <div className="p-4 sm:p-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-blue-600">MediFlow</h1>
            <p className="text-sm text-gray-500">CRM Médico</p>
          </div>
          {/* Botão fechar para mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      
        <nav className="px-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose} // Fechar sidebar ao clicar em link no mobile
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
    </>
  )
}
