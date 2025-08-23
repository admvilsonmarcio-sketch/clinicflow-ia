
'use client'

import { useRef, useState, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  User,
  Filter,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Consulta } from '@/types/consulta'

// Dynamic import para evitar SSR issues
const FullCalendar = dynamic(() => import('@fullcalendar/react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center">
      <div className="text-center">
        <CalendarIcon className="mx-auto mb-4 size-12 animate-pulse text-muted-foreground" />
        <p className="text-muted-foreground">Carregando calendário...</p>
      </div>
    </div>
  )
})

// Imports diretos dos plugins (will be loaded via FullCalendar component)
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'

interface MediflowFullCalendarProps {
  consultas: Consulta[]
  loading?: boolean
  onConsultaClick?: (consulta: Consulta) => void
  onDateClick?: (date: Date) => void
  onEventDrop?: (info: any) => void
  onEventResize?: (info: any) => void
  className?: string
  viewType?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'
  onViewChange?: (view: string) => void
}

// Mapeamento de cores por status
const statusColors = {
  agendada: '#3B82F6',     // blue-500
  confirmada: '#10B981',   // green-500
  realizada: '#6B7280',    // gray-500
  cancelada: '#EF4444',    // red-500
  faltou: '#F59E0B',       // amber-500
}

const statusBgColors = {
  agendada: '#EFF6FF',     // blue-50
  confirmada: '#ECFDF5',   // green-50
  realizada: '#F9FAFB',    // gray-50
  cancelada: '#FEF2F2',    // red-50
  faltou: '#FFFBEB',       // amber-50
}

export function MediflowFullCalendar({
  consultas = [],
  loading = false,
  onConsultaClick,
  onDateClick,
  onEventDrop,
  onEventResize,
  className,
  viewType = 'dayGridMonth',
  onViewChange
}: MediflowFullCalendarProps) {
  const [currentView, setCurrentView] = useState(viewType)
  
  // Converter consultas para eventos do FullCalendar
  const events = useMemo(() => {
    return consultas.map((consulta) => {
      const start = parseISO(consulta.data_consulta)
      const end = new Date(start.getTime() + consulta.duracao_minutos * 60000)
      
      return {
        id: consulta.id,
        title: consulta.titulo,
        start: consulta.data_consulta,
        end: end.toISOString(),
        backgroundColor: statusBgColors[consulta.status],
        borderColor: statusColors[consulta.status],
        textColor: statusColors[consulta.status],
        extendedProps: {
          consulta,
          paciente: consulta.pacientes?.[0]?.nome_completo || 'Sem paciente',
          medico: consulta.perfis?.[0]?.nome_completo || 'Sem médico',
          status: consulta.status,
          duracao: consulta.duracao_minutos,
          descricao: consulta.descricao,
          observacoes: consulta.observacoes
        }
      }
    })
  }, [consultas])

  // Renderizar conteúdo do evento
  const renderEventContent = useCallback((eventInfo: any) => {
    const { event } = eventInfo
    const { consulta, paciente, medico, status, duracao } = event.extendedProps
    const isAllDay = eventInfo.view.type === 'dayGridMonth'
    
    if (isAllDay) {
      return (
        <div className="flex items-center gap-1 overflow-hidden px-1 py-0.5">
          <div 
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: event.borderColor }}
          />
          <span className="truncate text-xs font-medium">
            {format(parseISO(event.startStr), 'HH:mm')} - {event.title}
          </span>
        </div>
      )
    }

    return (
      <div className="flex h-full flex-col gap-1 overflow-hidden p-1 text-xs">
        <div className="flex items-center justify-between">
          <span className="truncate font-medium">{event.title}</span>
          <Badge 
            className="shrink-0 px-1 py-0 text-[0.6rem]"
            style={{ 
              backgroundColor: statusBgColors[status as keyof typeof statusBgColors],
              color: statusColors[status as keyof typeof statusColors],
              borderColor: statusColors[status as keyof typeof statusColors]
            }}
          >
            {status}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-[0.65rem] text-muted-foreground">
          <User className="size-2" />
          <span className="truncate">{paciente}</span>
        </div>
        <div className="flex items-center gap-1 text-[0.65rem] text-muted-foreground">
          <Clock className="size-2" />
          <span>{duracao}min</span>
        </div>
      </div>
    )
  }, [])

  // Handler para clique no evento
  const handleEventClick = useCallback((clickInfo: any) => {
    const consulta = clickInfo.event.extendedProps.consulta
    onConsultaClick?.(consulta)
  }, [onConsultaClick])

  // Handler para clique na data
  const handleDateClick = useCallback((dateInfo: any) => {
    onDateClick?.(new Date(dateInfo.dateStr))
  }, [onDateClick])

  // Handler para drop de evento
  const handleEventDrop = useCallback((dropInfo: any) => {
    if (!onEventDrop) return
    
    const consulta = dropInfo.event.extendedProps.consulta
    const newDate = dropInfo.event.start
    
    onEventDrop({
      consulta,
      newDate,
      oldDate: new Date(consulta.data_consulta),
      revert: dropInfo.revert
    })
  }, [onEventDrop])

  // Handler para redimensionar evento
  const handleEventResize = useCallback((resizeInfo: any) => {
    if (!onEventResize) return
    
    const consulta = resizeInfo.event.extendedProps.consulta
    const newEnd = resizeInfo.event.end
    const start = resizeInfo.event.start
    const newDuration = Math.round((newEnd.getTime() - start.getTime()) / 60000)
    
    onEventResize({
      consulta,
      newDuration,
      oldDuration: consulta.duracao_minutos,
      revert: resizeInfo.revert
    })
  }, [onEventResize])

  // Alterar visualização
  const changeView = useCallback((view: string) => {
    setCurrentView(view as typeof viewType)
    onViewChange?.(view)
  }, [onViewChange])

  // Configuração do calendário
  const calendarOptions = useMemo(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    headerToolbar: false as false, // Vamos criar toolbar customizada
    initialView: currentView,
    locale: 'pt-br',
    height: 'auto' as const,
    events,
    eventContent: renderEventContent,
    eventClick: handleEventClick,
    dateClick: handleDateClick,
    eventDrop: handleEventDrop,
    eventResize: handleEventResize,
    editable: !!onEventDrop || !!onEventResize,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: false, // Não mostrar finais de semana por padrão
    slotMinTime: '07:00:00',
    slotMaxTime: '19:00:00',
    slotDuration: '00:15:00', // Intervalos de 15 minutos
    slotLabelInterval: '01:00:00',
    slotLabelFormat: {
      hour: '2-digit' as const,
      minute: '2-digit' as const,
      meridiem: false,
      hour12: false
    },
    eventTimeFormat: {
      hour: '2-digit' as const,
      minute: '2-digit' as const,
      meridiem: false,
      hour12: false
    },
    allDaySlot: false,
    nowIndicator: true,
    scrollTime: '08:00:00',
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
      startTime: '07:00',
      endTime: '19:00'
    }
  }), [
    currentView, 
    events, 
    renderEventContent, 
    handleEventClick, 
    handleDateClick, 
    handleEventDrop, 
    handleEventResize,
    onEventDrop,
    onEventResize
  ])

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex h-[600px] items-center justify-center">
          <div className="text-center">
            <CalendarIcon className="mx-auto mb-4 size-12 animate-pulse text-muted-foreground" />
            <p className="text-muted-foreground">Carregando consultas...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full', className)}>
      {/* Header personalizado */}
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="size-5" />
            Calendário de Agendamentos
          </CardTitle>
          
          {/* Controles de visualização */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Navegação será controlada pelo próprio FullCalendar */}
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">
                Use os controles do calendário para navegar
              </span>
            </div>

            {/* Views */}
            <div className="flex items-center gap-1">
              <Button
                variant={currentView === 'dayGridMonth' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeView('dayGridMonth')}
              >
                Mês
              </Button>
              <Button
                variant={currentView === 'timeGridWeek' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeView('timeGridWeek')}
              >
                Semana
              </Button>
              <Button
                variant={currentView === 'timeGridDay' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeView('timeGridDay')}
              >
                Dia
              </Button>
              <Button
                variant={currentView === 'listWeek' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeView('listWeek')}
              >
                Lista
              </Button>
            </div>
          </div>
        </div>

        {/* Legenda de status */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1">
              <div 
                className="size-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="capitalize">{status}</span>
            </div>
          ))}
        </div>
      </CardHeader>

      {/* Calendário */}
      <CardContent className="p-6 pt-0">
        <div className="rounded-lg border">
          <FullCalendar
            plugins={calendarOptions.plugins}
            headerToolbar={calendarOptions.headerToolbar}
            initialView={calendarOptions.initialView}
            locale={calendarOptions.locale}
            height={calendarOptions.height}
            events={calendarOptions.events}
            eventContent={calendarOptions.eventContent}
            eventClick={calendarOptions.eventClick}
            dateClick={calendarOptions.dateClick}
            eventDrop={calendarOptions.eventDrop}
            eventResize={calendarOptions.eventResize}
            editable={calendarOptions.editable}
            selectable={calendarOptions.selectable}
            selectMirror={calendarOptions.selectMirror}
            dayMaxEvents={calendarOptions.dayMaxEvents}
            weekends={calendarOptions.weekends}
            slotMinTime={calendarOptions.slotMinTime}
            slotMaxTime={calendarOptions.slotMaxTime}
            slotDuration={calendarOptions.slotDuration}
            slotLabelInterval={calendarOptions.slotLabelInterval}
            slotLabelFormat={calendarOptions.slotLabelFormat}
            eventTimeFormat={calendarOptions.eventTimeFormat}
            allDaySlot={calendarOptions.allDaySlot}
            nowIndicator={calendarOptions.nowIndicator}
            scrollTime={calendarOptions.scrollTime}
            businessHours={calendarOptions.businessHours}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default MediflowFullCalendar
