
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, addMinutes, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, Clock, User, MapPin, AlertCircle, Search, UserCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import type { 
  Paciente, 
  Medico, 
  ConsultaExistente, 
  ConsultaFormData,
  ConflitosHorario,
  ConflitosUnion 
} from '@/types/consulta'

// Schema de validação usando Zod - CORRIGIDO para a estrutura real
const consultaFormSchema = z.object({
  titulo: z.string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  
  descricao: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  
  paciente_id: z.string()
    .uuid('Selecione um paciente válido'),
  
  medico_id: z.string()
    .uuid('Selecione um profissional válido'),
  
  data_consulta: z.date({
    required_error: 'Data da consulta é obrigatória',
  }),
  
  hora_consulta: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  
  duracao_minutos: z.coerce.number()
    .int('Duração deve ser um número inteiro')
    .min(15, 'Duração mínima de 15 minutos')
    .max(480, 'Duração máxima de 8 horas')
    .default(60),
  
  status: z.enum(['agendada', 'confirmada', 'realizada', 'cancelada', 'faltou'], {
    required_error: 'Status é obrigatório',
  }),
  
  observacoes: z.string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional(),
})

interface ConsultaFormProps {
  initialData?: Partial<ConsultaFormData & { id: string }>
  pacientes: Paciente[]
  medicos: Medico[]
  consultasExistentes?: ConsultaExistente[]
  onSubmit: (data: ConsultaFormData) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  mode?: 'create' | 'edit'
}

const statusOptions = [
  { value: 'agendada', label: 'Agendada', color: 'bg-blue-100 text-blue-800' },
  { value: 'confirmada', label: 'Confirmada', color: 'bg-green-100 text-green-800' },
  { value: 'realizada', label: 'Realizada', color: 'bg-gray-100 text-gray-800' },
  { value: 'cancelada', label: 'Cancelada', color: 'bg-red-100 text-red-800' },
  { value: 'faltou', label: 'Faltou', color: 'bg-orange-100 text-orange-800' },
]

const duracaoOptions = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1h 30min' },
  { value: 120, label: '2 horas' },
  { value: 180, label: '3 horas' },
]

export function ConsultaForm({
  initialData,
  pacientes,
  medicos,
  consultasExistentes = [],
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create'
}: ConsultaFormProps) {
  const [conflitos, setConflitos] = useState<ConflitosUnion[]>([])
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [openPaciente, setOpenPaciente] = useState(false)
  const [openMedico, setOpenMedico] = useState(false)

  const form = useForm<ConsultaFormData>({
    resolver: zodResolver(consultaFormSchema),
    defaultValues: {
      titulo: initialData?.titulo || '',
      descricao: initialData?.descricao || '',
      paciente_id: initialData?.paciente_id || '',
      medico_id: initialData?.medico_id || '',
      data_consulta: initialData?.data_consulta || undefined,
      hora_consulta: initialData?.hora_consulta || '09:00',
      duracao_minutos: initialData?.duracao_minutos || 60,
      status: initialData?.status || 'agendada',
      observacoes: initialData?.observacoes || '',
    },
  })

  const watchedValues = form.watch(['data_consulta', 'hora_consulta', 'duracao_minutos', 'medico_id'])

  // Verificar conflitos de horário e validações
  useEffect(() => {
    const [dataConsulta, horaConsulta, duracaoMinutos, medicoId] = watchedValues
    
    if (!dataConsulta || !horaConsulta || !duracaoMinutos || !medicoId) {
      setConflitos([])
      return
    }

    try {
      const [horas, minutos] = horaConsulta.split(':').map(Number)
      const inicioConsulta = new Date(dataConsulta)
      inicioConsulta.setHours(horas, minutos, 0, 0)
      
      const fimConsulta = addMinutes(inicioConsulta, duracaoMinutos)

      // Validações de horário de funcionamento
      const horarioInicio = 7 // 07:00
      const horarioFim = 18 // 18:00
      const intervaloMinimo = 15 // 15 minutos entre consultas

      const conflitosEncontrados: ConflitosUnion[] = []

      // Verificar se é final de semana
      const diaSemana = inicioConsulta.getDay()
      if (diaSemana === 0 || diaSemana === 6) {
        conflitosEncontrados.push({
          tipo: 'final_semana',
          mensagem: 'Não é possível agendar consultas aos finais de semana'
        })
      }

      // Verificar horário de funcionamento
      if (horas < horarioInicio || horas >= horarioFim || (horas === horarioFim - 1 && minutos + duracaoMinutos > 60)) {
        conflitosEncontrados.push({
          tipo: 'horario_funcionamento',
          mensagem: `Horário deve ser entre ${horarioInicio}:00 e ${horarioFim}:00`
        })
      }

      // Verificar se a consulta termina após o horário de funcionamento
      const horaFim = fimConsulta.getHours()
      const minutoFim = fimConsulta.getMinutes()
      if (horaFim > horarioFim || (horaFim === horarioFim && minutoFim > 0)) {
        conflitosEncontrados.push({
          tipo: 'horario_funcionamento',
          mensagem: `A consulta não pode terminar após ${horarioFim}:00`
        })
      }

      // Verificar se a duração é múltiplo de 15 minutos
      if (duracaoMinutos % 15 !== 0) {
        conflitosEncontrados.push({
          tipo: 'duracao_invalida',
          mensagem: 'A duração deve ser múltiplo de 15 minutos (15, 30, 45, 60, etc.)'
        })
      }

      // Verificar duração mínima e máxima
      if (duracaoMinutos < 15) {
        conflitosEncontrados.push({
          tipo: 'duracao_minima',
          mensagem: 'A duração mínima é de 15 minutos'
        })
      }

      if (duracaoMinutos > 180) {
        conflitosEncontrados.push({
          tipo: 'duracao_maxima',
          mensagem: 'A duração máxima é de 3 horas (180 minutos)'
        })
      }

      // Verificar conflitos com outras consultas
      const conflitosHorario = consultasExistentes.filter(consulta => {
        // Pular a própria consulta se estiver editando
        if (mode === 'edit' && initialData?.id === consulta.id) {
          return false
        }

        // Verificar apenas consultas do mesmo dia e médico
        const consultaDate = new Date(consulta.data_consulta)
        const mesmoMedico = consulta.medico_id === medicoId
        const mesmoDia = consultaDate.toDateString() === inicioConsulta.toDateString()
        
        if (!mesmoMedico || !mesmoDia) {
          return false
        }

        const inicioExistente = new Date(consulta.data_consulta)
        const fimExistente = addMinutes(inicioExistente, consulta.duracao_minutos)

        // Verificar sobreposição com intervalo mínimo
        const inicioComIntervalo = addMinutes(inicioConsulta, -intervaloMinimo)
        const fimComIntervalo = addMinutes(fimConsulta, intervaloMinimo)

        const hasSobreposicao = (
          (inicioComIntervalo < fimExistente && fimComIntervalo > inicioExistente)
        )

        return hasSobreposicao
      })

      conflitosEncontrados.push(...conflitosHorario)
      setConflitos(conflitosEncontrados)
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error)
      setConflitos([])
    }
  }, [JSON.stringify(watchedValues), consultasExistentes?.length, mode, initialData?.id])

  const handleSubmit = async (data: ConsultaFormData) => {
    try {
      // Combinar data e hora
      const [horas, minutos] = data.hora_consulta.split(':').map(Number)
      const dataHoraConsulta = new Date(data.data_consulta)
      dataHoraConsulta.setHours(horas, minutos, 0, 0)

      // Verificar se a data/hora não é no passado (apenas para novas consultas)
      if (mode === 'create' && isBefore(dataHoraConsulta, new Date())) {
        toast({
          title: 'Erro de validação',
          description: 'Não é possível agendar consultas no passado.',
          variant: 'destructive'
        })
        return
      }

      // Verificar conflitos antes de submeter
      if (conflitos.length > 0) {
        toast({
          title: 'Conflito de horário',
          description: 'Existe conflito com outras consultas. Verifique os horários.',
          variant: 'destructive'
        })
        return
      }

      const formData = {
        ...data,
        data_consulta: dataHoraConsulta,
      }

      await onSubmit(formData)
    } catch (error) {
      console.error('Erro ao submeter formulário:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao salvar consulta. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="size-5" />
          {mode === 'create' ? 'Nova Consulta' : 'Editar Consulta'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Título */}
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Consulta</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Consulta de rotina, Retorno, etc."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Paciente e Profissional */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="paciente_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2">
                      <User className="size-4" />
                      Paciente
                    </FormLabel>
                    <Popover open={openPaciente} onOpenChange={setOpenPaciente}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? pacientes.find((paciente) => paciente.id === field.value)?.nome_completo
                              : "Selecione o paciente"}
                            <Search className="ml-2 size-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0 sm:w-[400px]">
                        <Command>
                          <CommandInput placeholder="Buscar paciente..." />
                          <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
                          <CommandGroup>
                            <CommandList>
                              {pacientes.map((paciente) => (
                                <CommandItem
                                  key={paciente.id}
                                  value={paciente.nome_completo}
                                  onSelect={() => {
                                    field.onChange(paciente.id)
                                    setOpenPaciente(false)
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span>{paciente.nome_completo}</span>
                                    {paciente.email && (
                                      <span className="text-xs text-muted-foreground">{paciente.email}</span>
                                    )}
                                    {paciente.telefone_celular && (
                                      <span className="text-xs text-muted-foreground">{paciente.telefone_celular}</span>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandList>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="medico_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2">
                      <UserCheck className="size-4" />
                      Profissional
                    </FormLabel>
                    <Popover open={openMedico} onOpenChange={setOpenMedico}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? medicos.find((medico) => medico.id === field.value)?.nome_completo
                              : "Selecione o profissional"}
                            <Search className="ml-2 size-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0 sm:w-[400px]">
                        <Command>
                          <CommandInput placeholder="Buscar profissional..." />
                          <CommandEmpty>Nenhum profissional encontrado.</CommandEmpty>
                          <CommandGroup>
                            <CommandList>
                              {medicos.map((medico) => (
                                <CommandItem
                                  key={medico.id}
                                  value={medico.nome_completo}
                                  onSelect={() => {
                                    field.onChange(medico.id)
                                    setOpenMedico(false)
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span>{medico.nome_completo}</span>
                                    {medico.cargo && (
                                      <span className="text-xs text-muted-foreground capitalize">{medico.cargo}</span>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandList>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Data, Hora e Duração */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="data_consulta"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data</FormLabel>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy', { locale: ptBR })
                            ) : (
                              <span>Selecione a data</span>
                            )}
                            <CalendarIcon className="ml-auto size-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date)
                            setCalendarOpen(false)
                          }}
                          disabled={(date) => isBefore(date, startOfDay(new Date()))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
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

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={cn('text-xs', status.color)}>
                              {status.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição */}
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o motivo da consulta, sintomas, etc."
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Observações */}
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações adicionais, instruções especiais, etc."
                      className="resize-none"
                      rows={2}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Alerta de conflitos */}
            {conflitos.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Problemas detectados:</p>
                    {conflitos.map((conflito, index) => (
                      <div key={index} className="text-sm">
                        {'mensagem' in conflito ? (
                          <span>• {conflito.mensagem}</span>
                        ) : (
                          <span>
                            • Conflito: {format(new Date(conflito.data_consulta), 'dd/MM/yyyy HH:mm')} - 
                            {conflito.perfis?.[0]?.nome_completo} com {conflito.pacientes?.[0]?.nome_completo}
                          </span>
                        )}
                      </div>
                    ))}
                    <p className="mt-2 text-xs opacity-75">
                      Dica: Mantenha pelo menos 15 minutos de intervalo entre consultas.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={loading || conflitos.length > 0}
                className="flex-1"
              >
                {loading ? 'Salvando...' : (mode === 'create' ? 'Criar Consulta' : 'Salvar Alterações')}
              </Button>
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default ConsultaForm
