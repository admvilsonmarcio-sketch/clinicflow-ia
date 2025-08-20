"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { format, isWeekend, isBefore, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import type { Consulta } from '@/types/consulta'

interface AgendaCalendarProps {
  className?: string
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  consultas?: Consulta[]
  onConsultaClick?: (consulta: Consulta) => void
}

function AgendaCalendar({
  className,
  selected,
  onSelect,
  consultas = [],
  onConsultaClick,
  ...props
}: AgendaCalendarProps) {
  // Função para desabilitar datas
  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date())
    return isBefore(date, today) || isWeekend(date)
  }
  const renderDayContent = (dayProps: { date: Date; displayMonth: Date; activeModifiers: any; modifiers: any }) => {
    const { date } = dayProps
    const consultasDoDia = consultas.filter(consulta => {
      const consultaDate = new Date(consulta.data_consulta)
      return consultaDate.toDateString() === date.toDateString()
    })

    return (
      <div className="relative flex size-full flex-col items-center justify-start p-1">
        <div className="mb-1 text-center">
          {date.getDate()}
        </div>
        {consultasDoDia.length > 0 && (
          <div className="w-full space-y-0.5">
            {consultasDoDia.slice(0, 2).map((consulta) => {
              const pacienteNome = consulta.pacientes[0]?.nome_completo.split(' ')[0]
              return (
                <div
                  key={consulta.id}
                  className={cn(
                    "cursor-pointer truncate rounded p-0.5 text-[0.6rem] transition-opacity hover:opacity-80 sm:px-1 sm:text-xs",
                    {
                      'bg-green-100 text-green-800': consulta.status === 'confirmada',
                      'bg-red-100 text-red-800': consulta.status === 'cancelada',
                      'bg-blue-100 text-blue-800': consulta.status === 'agendada',
                      'bg-gray-100 text-gray-800': consulta.status === 'realizada',
                    }
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    onConsultaClick?.(consulta)
                  }}
                  title={`${format(new Date(consulta.data_consulta), 'HH:mm')} - ${consulta.titulo} (${pacienteNome})`}
                >
                  {format(new Date(consulta.data_consulta), 'HH:mm')} {pacienteNome}
                </div>
              )
            })}
            {consultasDoDia.length > 2 && (
              <div className="py-0.5 text-center text-[0.6rem] text-muted-foreground sm:text-xs">
                +{consultasDoDia.length - 2}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={onSelect}
      locale={ptBR}
      disabled={isDateDisabled}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex w-full",
        head_cell:
          "text-muted-foreground rounded-md w-12 sm:w-16 font-normal text-[0.7rem] sm:text-[0.8rem] flex items-center justify-center",
        row: "flex w-full mt-1 sm:mt-2",
        cell: "h-16 w-12 sm:h-20 sm:w-16 text-center text-xs sm:text-sm p-0 relative border border-border/50 hover:bg-muted/50 transition-colors",
        day: cn(
          "size-full p-0 font-normal hover:bg-transparent aria-selected:opacity-100"
        ),
        day_selected:
          "bg-primary/10 text-primary hover:bg-primary/20 focus:bg-primary/10",
        day_today: "bg-accent/50 text-accent-foreground font-semibold",
        day_outside:
          "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_hidden: "invisible",
      }}
      components={{
        PreviousMonthButton: ({ ...props }) => <ChevronLeft className="size-4" />,
        NextMonthButton: ({ ...props }) => <ChevronRight className="size-4" />,
        Day: (props) => renderDayContent({ date: props.day.date, displayMonth: new Date(), activeModifiers: {}, modifiers: props.modifiers }),
      }}
      {...props}
    />
  )
}

AgendaCalendar.displayName = "AgendaCalendar"

export { AgendaCalendar }
export type { AgendaCalendarProps }