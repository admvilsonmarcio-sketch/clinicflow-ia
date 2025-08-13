"use client"

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export function TestNotifications() {
  const { toast } = useToast()

  const showSuccess = () => {
    toast({
      variant: "success",
      title: "Sucesso!",
      description: "Esta é uma notificação de sucesso.",
    })
  }

  const showError = () => {
    toast({
      variant: "destructive",
      title: "Erro!",
      description: "Esta é uma notificação de erro.",
    })
  }

  const showWarning = () => {
    toast({
      variant: "warning",
      title: "Atenção!",
      description: "Esta é uma notificação de aviso.",
    })
  }

  const showDefault = () => {
    toast({
      title: "Informação",
      description: "Esta é uma notificação padrão.",
    })
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Testar Notificações</h3>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={showSuccess}>
          Sucesso
        </Button>
        <Button size="sm" variant="outline" onClick={showError}>
          Erro
        </Button>
        <Button size="sm" variant="outline" onClick={showWarning}>
          Aviso
        </Button>
        <Button size="sm" variant="outline" onClick={showDefault}>
          Padrão
        </Button>
      </div>
    </div>
  )
}
