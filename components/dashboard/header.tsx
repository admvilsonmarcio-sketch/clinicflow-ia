'use client'

import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/user-context'

interface HeaderProps {
  user: any
  profile: any
}

export function Header({ user, profile }: HeaderProps) {
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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Bem-vindo, {currentProfile?.nome_completo || user?.email}
          </h2>
          {currentProfile?.clinicas?.nome && (
            <p className="text-sm text-gray-500">{currentProfile.clinicas.nome}</p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
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
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  )
}