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
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "min-h-screen border-r border-gray-200 bg-white shadow-sm transition-transform duration-300 ease-in-out",
        "fixed z-50 md:relative md:z-auto",
        "w-64",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "md:block"
      )}>
        <div className="flex items-center justify-between p-4 sm:p-6">
          <div>
            <h1 className="text-xl font-bold text-blue-600 sm:text-2xl">MediFlow</h1>
            <p className="text-sm text-gray-500">CRM Médico</p>
          </div>
          {/* Botão fechar para mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onClose}
          >
            <X className="size-5" />
          </Button>
        </div>
      
        <nav className="space-y-1 px-4">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose} // Fechar sidebar ao clicar em link no mobile
                className={cn(
                  'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-r-2 border-blue-700 bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className="mr-3 size-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
