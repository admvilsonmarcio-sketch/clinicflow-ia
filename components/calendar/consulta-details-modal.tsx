
'use client'

import { useState } from 'react'
import { format, parseISO, differenceInMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  AlertCircle,
  Edit3,
  Trash2,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Consulta } from '@/types/consulta'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface ConsultaDetailsModalProps {
  consulta: Consulta | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (consulta: Consulta) => void
  onDelete?: (consultaId: string) => void
  onStatusChange?: (consultaId: string, newStatus: string) => void
  loading?: boolean
}

const statusColors = {
  agendada: 'bg-blue-100 text-blue-800 border-blue-200',
  confirmada: 'bg-green-100 text-green-800 border-green-200',
  realizada: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelada: 'bg-red-100 text-red-800 border-red-200',
  faltou: 'bg-orange-100 text-orange-800 border-orange-200',
}

const statusLabels = {
  agendada: 'Agendada',
  confirmada: 'Confirmada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
  faltou: 'Faltou',
}

const nextStatusMap = {
  agendada: 'confirmada',
  confirmada: 'realizada',
  realizada: null,
  cancelada: null,
  faltou: null,
}

const nextStatusLabels = {
  agendada: 'Confirmar',
  confirmada: 'Finalizar',
  realizada: null,
  cancelada: null,
  faltou: null,
}

export function ConsultaDetailsModal({
  consulta,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onStatusChange,
  loading = false
}: ConsultaDetailsModalProps) {
  const [actionLoading, setActionLoading] = useState(false)

  if (!consulta) return null

  const paciente = consulta.pacientes?.[0]
  const medico = consulta.perfis?.[0]
  const dataConsulta = parseISO(consulta.data_consulta)
  const horaFim = new Date(dataConsulta.getTime() + consulta.duracao_minutos * 60000)

  const handleStatusChange = async (newStatus: string) => {
    if (!onStatusChange) return
    
    setActionLoading(true)
    try {
      await onStatusChange(consulta.id, newStatus)
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    
    setActionLoading(true)
    try {
      await onDelete(consulta.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao excluir consulta:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = () => {
    if (!onEdit) return
    onEdit(consulta)
    onOpenChange(false)
  }

  const nextStatus = nextStatusMap[consulta.status]
  const nextStatusLabel = nextStatusLabels[consulta.status]
  const canAdvanceStatus = nextStatus && nextStatusLabel
  const canEdit = ['agendada', 'confirmada'].includes(consulta.status)
  const canDelete = ['agendada', 'confirmada'].includes(consulta.status)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <Calendar className="size-5" />
              Detalhes da Consulta
            </span>
            <Badge className={cn('text-sm', statusColors[consulta.status])}>
              {statusLabels[consulta.status]}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{consulta.titulo}</h3>
                  {consulta.descricao && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {consulta.descricao}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Data e Hora */}
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Data</p>
                      <p className="text-sm text-muted-foreground">
                        {format(dataConsulta, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  {/* Horário */}
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Horário</p>
                      <p className="text-sm text-muted-foreground">
                        {format(dataConsulta, 'HH:mm')} - {format(horaFim, 'HH:mm')}
                        <span className="ml-1">({consulta.duracao_minutos} min)</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paciente */}
          {paciente && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 size-5 text-muted-foreground" />
                  <div className="flex-1 space-y-2">
                    <p className="font-medium">Paciente</p>
                    <div className="space-y-1">
                      <p className="text-sm">{paciente.nome_completo}</p>
                      {paciente.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="size-3" />
                          <span>{paciente.email}</span>
                        </div>
                      )}
                      {paciente.telefone_celular && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="size-3" />
                          <span>{paciente.telefone_celular}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Médico */}
          {medico && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Stethoscope className="mt-0.5 size-5 text-muted-foreground" />
                  <div className="flex-1 space-y-2">
                    <p className="font-medium">Médico</p>
                    <div className="space-y-1">
                      <p className="text-sm">{medico.nome_completo}</p>
                      {medico.cargo && (
                        <p className="text-sm text-muted-foreground capitalize">
                          {medico.cargo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {consulta.observacoes && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 size-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">Observações</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {consulta.observacoes}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <div className="flex flex-wrap gap-2">
            {/* Avançar Status */}
            {canAdvanceStatus && onStatusChange && (
              <Button
                onClick={() => handleStatusChange(nextStatus)}
                disabled={loading || actionLoading}
                className="flex items-center gap-2"
              >
                <AlertCircle className="size-4" />
                {nextStatusLabel}
              </Button>
            )}

            {/* Editar */}
            {canEdit && onEdit && (
              <Button
                variant="outline"
                onClick={handleEdit}
                disabled={loading || actionLoading}
                className="flex items-center gap-2"
              >
                <Edit3 className="size-4" />
                Editar
              </Button>
            )}

            {/* Cancelar */}
            {consulta.status === 'agendada' && onStatusChange && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('cancelada')}
                disabled={loading || actionLoading}
                className="flex items-center gap-2"
              >
                <AlertCircle className="size-4" />
                Cancelar
              </Button>
            )}

            {/* Marcar Falta */}
            {consulta.status === 'confirmada' && onStatusChange && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('faltou')}
                disabled={loading || actionLoading}
                className="flex items-center gap-2"
              >
                <AlertCircle className="size-4" />
                Marcar Falta
              </Button>
            )}

            {/* Excluir */}
            {canDelete && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={loading || actionLoading}
                    className="flex items-center gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir esta consulta? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={actionLoading}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {actionLoading ? 'Excluindo...' : 'Excluir'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ConsultaDetailsModal
