'use client'

import { useState } from 'react'
import { DayPicker, DateRange } from 'react-day-picker'
import { format, isSameDay, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, Clock, User, MapPin } from 'lucide-react'
import type { Consulta } from '@/types/consulta'

interface CalendarProps {
  consultas?: Consulta[]
  selectedDate?: Date
  onDateSelect?: (date: Date | undefined) => void
  onConsultaClick?: (consulta: Consulta) => void
  className?: string
  mode?: 'single' | 'range'
  showConsultas?: boolean
}

const statusColors = {
  agendada: 'bg-blue-100 text-blue-800 border-blue-200',
  confirmada: 'bg-green-100 text-green-800 border-green-200',
  realizada: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelada: 'bg-red-100 text-red-800 border-red-200',
  faltou: 'bg-orange-100 text-orange-800 border-orange-200'
}

const statusLabels = {
  agendada: 'Agendada',
  confirmada: 'Confirmada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
  faltou: 'Faltou'
}

export function Calendar({
  consultas = [],
  selectedDate,
  onDateSelect,
  onConsultaClick,
  className,
  mode = 'single',
  showConsultas = true
}: CalendarProps) {
  const [selected, setSelected] = useState<Date | DateRange | undefined>(selectedDate)

  const handleDateSelect = (date: Date | DateRange | undefined) => {
    setSelected(date)
    if (mode === 'single' && onDateSelect) {
      onDateSelect(date as Date)
    }
  }

  // Agrupar consultas por data
  const consultasPorData = consultas.reduce((acc, consulta) => {
    const data = startOfDay(new Date(consulta.data_consulta))
    const dataKey = format(data, 'yyyy-MM-dd')
    
    if (!acc[dataKey]) {
      acc[dataKey] = []
    }
    acc[dataKey].push(consulta)
    
    return acc
  }, {} as Record<string, Consulta[]>)

  // Função para verificar se uma data tem consultas
  const hasConsultas = (date: Date) => {
    const dataKey = format(date, 'yyyy-MM-dd')
    return consultasPorData[dataKey]?.length > 0
  }

  // Função para obter consultas de uma data específica
  const getConsultasForDate = (date: Date) => {
    const dataKey = format(date, 'yyyy-MM-dd')
    return consultasPorData[dataKey] || []
  }

  // Consultas do dia selecionado
  const consultasDodia = selectedDate ? getConsultasForDate(selectedDate) : []

  return (
    <div className={cn('flex flex-col gap-6 lg:flex-row', className)}>
      {/* Calendário */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="size-5" />
            Calendário de Consultas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DayPicker
            mode={mode as any}
            selected={selected}
            onSelect={handleDateSelect}
            locale={ptBR}
            showOutsideDays
            className="mx-auto"
            classNames={{
              months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
              month: 'space-y-4',
              caption: 'flex justify-center pt-1 relative items-center',
              caption_label: 'text-sm font-medium',
              nav: 'space-x-1 flex items-center',
              nav_button: cn(
                'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
                'size-7 bg-transparent p-0 opacity-50 hover:bg-accent hover:text-accent-foreground hover:opacity-100'
              ),
              nav_button_previous: 'absolute left-1',
              nav_button_next: 'absolute right-1',
              table: 'w-full border-collapse space-y-1',
              head_row: 'flex',
              head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
              row: 'flex w-full mt-2',
              cell: cn(
                'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent',
                '[&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-middle)]:rounded-none'
              ),
              day: cn(
                'inline-flex items-center justify-center rounded-md text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'size-9 p-0 font-normal aria-selected:opacity-100'
              ),
              day_range_start: 'day-range-start',
              day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
              day_range_end: 'day-range-end',
              day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
              day_today: 'bg-accent text-accent-foreground',
              day_outside: 'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
              day_disabled: 'text-muted-foreground opacity-50',
              day_hidden: 'invisible'
            }}
            modifiers={{
              hasConsultas: (date) => hasConsultas(date)
            }}
            modifiersClassNames={{
              hasConsultas: 'relative after:absolute after:bottom-1 after:left-1/2 after:transform after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full'
            }}
          />
        </CardContent>
      </Card>

      {/* Lista de consultas do dia selecionado */}
      {showConsultas && (
        <Card className="w-full lg:w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              {selectedDate ? (
                `Consultas - ${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}`
              ) : (
                'Selecione uma data'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {consultasDodia.length > 0 ? (
              <div className="space-y-3">
                {consultasDodia
                  .sort((a, b) => new Date(a.data_consulta).getTime() - new Date(b.data_consulta).getTime())
                  .map((consulta) => (
                    <div
                      key={consulta.id}
                      className="cursor-pointer rounded-lg border p-3 transition-colors hover:bg-accent/50"
                      onClick={() => onConsultaClick?.(consulta)}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{consulta.titulo}</h4>
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            {format(new Date(consulta.data_consulta), 'HH:mm')} 
                            ({consulta.duracao_minutos}min)
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs', statusColors[consulta.status])}
                        >
                          {statusLabels[consulta.status]}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="size-3" />
                          Paciente: {consulta.pacientes[0]?.nome_completo}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" />
                          Médico: {consulta.perfis[0]?.nome_completo}
                        </p>
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="py-8 text-center">
                <CalendarIcon className="mx-auto mb-4 size-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {selectedDate ? 'Nenhuma consulta agendada para este dia' : 'Selecione uma data para ver as consultas'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Calendar