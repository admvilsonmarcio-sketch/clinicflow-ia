
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  Calendar,
  Clock,
  User,
  Stethoscope
} from 'lucide-react'
import type { 
  Paciente, 
  Medico, 
  ConsultaFormData 
} from '@/types/consulta'

interface QuickCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date | null
  selectedTime?: string
  pacientes: Paciente[]
  medicos: Medico[]
  onSubmit: (data: ConsultaFormData) => Promise<void>
  loading?: boolean
}

const quickCreateSchema = z.object({
  titulo: z.string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  
  paciente_id: z.string()
    .uuid('Selecione um paciente válido'),
  
  medico_id: z.string()
    .uuid('Selecione um médico válido'),
  
  hora_consulta: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  
  duracao_minutos: z.coerce.number()
    .int('Duração deve ser um número inteiro')
    .min(15, 'Duração mínima de 15 minutos')
    .max(480, 'Duração máxima de 8 horas')
    .default(60),
  
  descricao: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
})

type QuickCreateFormData = z.infer<typeof quickCreateSchema>

const duracaoOptions = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1h 30min' },
  { value: 120, label: '2 horas' },
  { value: 180, label: '3 horas' },
]

export function QuickCreateModal({
  open,
  onOpenChange,
  selectedDate,
  selectedTime,
  pacientes,
  medicos,
  onSubmit,
  loading = false
}: QuickCreateModalProps) {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<QuickCreateFormData>({
    resolver: zodResolver(quickCreateSchema),
    defaultValues: {
      titulo: '',
      paciente_id: '',
      medico_id: '',
      hora_consulta: selectedTime || '09:00',
      duracao_minutos: 60,
      descricao: '',
    },
  })

  const handleSubmit = async (data: QuickCreateFormData) => {
    if (!selectedDate) return

    setSubmitting(true)
    try {
      // Combinar data e hora
      const [horas, minutos] = data.hora_consulta.split(':').map(Number)
      const dataHoraConsulta = new Date(selectedDate)
      dataHoraConsulta.setHours(horas, minutos, 0, 0)

      const formData: ConsultaFormData = {
        titulo: data.titulo,
        descricao: data.descricao,
        paciente_id: data.paciente_id,
        medico_id: data.medico_id,
        data_consulta: dataHoraConsulta,
        hora_consulta: data.hora_consulta,
        duracao_minutos: data.duracao_minutos,
        status: 'agendada',
        observacoes: undefined,
      }

      await onSubmit(formData)
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Erro ao criar consulta:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      onOpenChange(false)
      form.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-5" />
            Nova Consulta
          </DialogTitle>
          {selectedDate && (
            <p className="text-sm text-muted-foreground">
              {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Título */}
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Consulta</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Consulta de rotina"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Paciente */}
            <FormField
              control={form.control}
              name="paciente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="size-4" />
                    Paciente
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o paciente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pacientes.map((paciente) => (
                        <SelectItem key={paciente.id} value={paciente.id}>
                          {paciente.nome_completo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Médico */}
            <FormField
              control={form.control}
              name="medico_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Stethoscope className="size-4" />
                    Médico
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o médico" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {medicos.map((medico) => (
                        <SelectItem key={medico.id} value={medico.id}>
                          {medico.nome_completo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Horário e Duração */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hora_consulta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="size-4" />
                      Hora
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="time"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duracao_minutos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(Number(value))} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Duração" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {duracaoOptions.map((opcao) => (
                          <SelectItem key={opcao.value} value={opcao.value.toString()}>
                            {opcao.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Descrição */}
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o motivo da consulta"
                      className="resize-none"
                      rows={2}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botões */}
            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                disabled={loading || submitting}
                className="flex-1"
              >
                {submitting ? 'Criando...' : 'Criar Consulta'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={loading || submitting}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default QuickCreateModal
