'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, User, Menu, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/user-context'

interface HeaderProps {
  user: any
  profile: any
  isSidebarOpen?: boolean
  onToggleSidebar?: () => void
}

export function Header({ user, profile, isSidebarOpen, onToggleSidebar }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const { profile: contextProfile } = useUser()

  // Usar o profile do contexto se disponível, senão usar o prop
  const currentProfile = contextProfile || profile

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between p-4 sm:px-6">
        {/* Menu hambúrguer para mobile */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onToggleSidebar}
          >
            {isSidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Bem-vindo, {currentProfile?.nome_completo || user?.email}
            </h2>
            {currentProfile?.clinicas?.nome && (
              <p className="text-sm text-gray-500">{currentProfile.clinicas.nome}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="size-4" />
            <span>{currentProfile?.cargo === 'medico' ? 'Médico' :
              currentProfile?.cargo === 'assistente' ? 'Assistente' :
                currentProfile?.cargo === 'recepcionista' ? 'Recepcionista' :
                  currentProfile?.cargo === 'admin' ? 'Administrador' : 'Usuário'}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 size-4" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  )
}
