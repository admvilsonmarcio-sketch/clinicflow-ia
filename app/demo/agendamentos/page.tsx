
'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar as CalendarIcon, Filter, Search, Clock, User, Users, UserCheck } from 'lucide-react'
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MediflowFullCalendar from '@/components/calendar/full-calendar'
import ConsultaDetailsModal from '@/components/calendar/consulta-details-modal'
import QuickCreateModal from '@/components/calendar/quick-create-modal'
import { ConsultaForm } from '@/components/forms/consulta-form'
import { useConsultas } from '@/hooks/use-consultas-demo'
import { usePatients } from '@/hooks/use-patients'
import { useMedicos } from '@/hooks/use-medicos'
import type { ConsultaFormData, Paciente, Medico, ConsultaExistente, Consulta, ConsultaDetalhada } from '@/types/consulta'
import { toast } from '@/components/ui/use-toast'

const statusColors = {
  agendada: 'bg-blue-100 text-blue-800',
  confirmada: 'bg-green-100 text-green-800',
  realizada: 'bg-gray-100 text-gray-800',
  cancelada: 'bg-red-100 text-red-800',
  faltou: 'bg-orange-100 text-orange-800',
}

const statusLabels = {
  agendada: 'Agendada',
  confirmada: 'Confirmada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
  faltou: 'Faltou',
}

export default function AgendamentosPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [medicoFilter, setMedicoFilter] = useState<string>('all')
  
  // Estados para modais
  const [consultaFormOpen, setConsultaFormOpen] = useState(false)
  const [consultaDetailsOpen, setConsultaDetailsOpen] = useState(false)
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  const [editingConsulta, setEditingConsulta] = useState<Consulta | null>(null)
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null)
  const [selectedDateForCreate, setSelectedDateForCreate] = useState<Date | null>(null)
  
  // Estados para o calendário
  const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'>('dayGridMonth')

  const {
    consultas,
    loading,
    error,
    refetch,
    createConsulta,
    updateConsulta,
    deleteConsulta,
    getConsultasForMonth
  } = useConsultas()
  
  const { patients, loading: loadingPatients } = usePatients()
  const { medicos, loading: loadingMedicos } = useMedicos()

  // Buscar dados iniciais
  useEffect(() => {
    getConsultasForMonth(currentDate)
  }, [currentDate])

  // Handlers para criação e edição de consultas
  const handleCreateConsulta = async (data: ConsultaFormData) => {
    try {
      await createConsulta({
        titulo: data.titulo,
        descricao: data.descricao,
        paciente_id: data.paciente_id,
        medico_id: data.medico_id,
        data_consulta: data.data_consulta.toISOString(),
        duracao_minutos: data.duracao_minutos,
        status: data.status,
        observacoes: data.observacoes,
        lembrete_enviado: false,
      })
      
      setConsultaFormOpen(false)
      toast({
        title: 'Sucesso',
        description: 'Consulta criada com sucesso!',
      })
    } catch (error) {
      console.error('Erro ao criar consulta:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao criar consulta. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

  const handleEditConsulta = async (data: ConsultaFormData) => {
    if (!editingConsulta) return

    try {
      await updateConsulta(editingConsulta.id, {
        id: editingConsulta.id,
        titulo: data.titulo,
        descricao: data.descricao,
        paciente_id: data.paciente_id,
        medico_id: data.medico_id,
        data_consulta: data.data_consulta.toISOString(),
        duracao_minutos: data.duracao_minutos,
        status: data.status,
        observacoes: data.observacoes,
      })
      
      setEditingConsulta(null)
      setConsultaFormOpen(false)
      toast({
        title: 'Sucesso',
        description: 'Consulta atualizada com sucesso!',
      })
    } catch (error) {
      console.error('Erro ao atualizar consulta:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar consulta. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteConsulta = async (consultaId: string) => {
    try {
      await deleteConsulta(consultaId)
      toast({
        title: 'Sucesso',
        description: 'Consulta excluída com sucesso!',
      })
    } catch (error) {
      console.error('Erro ao excluir consulta:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao excluir consulta. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

  const handleStatusChange = async (consultaId: string, newStatus: string) => {
    const consulta = consultas.find(c => c.id === consultaId)
    if (!consulta) return

    try {
      await updateConsulta(consultaId, {
        id: consultaId,
        status: newStatus as any,
      })
      
      toast({
        title: 'Sucesso',
        description: 'Status da consulta atualizado!',
      })
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao alterar status. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

  // Handlers dos modais
  const openCreateDialog = () => {
    setEditingConsulta(null)
    setConsultaFormOpen(true)
  }

  const openEditDialog = (consulta: Consulta) => {
    setEditingConsulta(consulta)
    setConsultaFormOpen(true)
  }

  const closeCreateDialog = () => {
    setConsultaFormOpen(false)
    setEditingConsulta(null)
  }

  // Handlers do FullCalendar
  const handleConsultaClick = (consulta: Consulta) => {
    setSelectedConsulta(consulta)
    setConsultaDetailsOpen(true)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDateForCreate(date)
    setQuickCreateOpen(true)
  }

  const handleEventDrop = async (info: any) => {
    const { consulta, newDate, revert } = info
    
    try {
      await updateConsulta(consulta.id, {
        id: consulta.id,
        data_consulta: newDate.toISOString(),
      })
      
      toast({
        title: 'Sucesso',
        description: 'Consulta reagendada com sucesso!',
      })
    } catch (error) {
      console.error('Erro ao reagendar consulta:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao reagendar consulta. Tente novamente.',
        variant: 'destructive'
      })
      revert()
    }
  }

  const handleEventResize = async (info: any) => {
    const { consulta, newDuration, revert } = info
    
    try {
      await updateConsulta(consulta.id, {
        id: consulta.id,
        duracao_minutos: newDuration,
      })
      
      toast({
        title: 'Sucesso',
        description: 'Duração da consulta atualizada!',
      })
    } catch (error) {
      console.error('Erro ao alterar duração:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao alterar duração. Tente novamente.',
        variant: 'destructive'
      })
      revert()
    }
  }

  // Filtrar consultas
  const filteredConsultas = consultas.filter((consulta: Consulta) => {
    const matchesSearch = 
        consulta.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consulta.pacientes?.[0]?.nome_completo?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        consulta.perfis?.[0]?.nome_completo?.toLowerCase()?.includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || consulta.status === statusFilter
      const matchesMedico = medicoFilter === 'all' || consulta.perfis?.[0]?.id === medicoFilter
    
    return matchesSearch && matchesStatus && matchesMedico
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos (Demo)</h1>
          <p className="text-muted-foreground">
            Demonstração do sistema de agendamentos
          </p>
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="size-4" />
              <span>{patients?.length || 0} pacientes</span>
            </div>
            <div className="flex items-center gap-1">
              <UserCheck className="size-4" />
              <span>{medicos?.length || 0} profissionais</span>
            </div>
          </div>
        </div>
        
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus className="size-4" />
          Nova Consulta
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="size-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar consultas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="agendada">Agendada</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="realizada">Realizada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
                <SelectItem value="faltou">Faltou</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={medicoFilter} onValueChange={setMedicoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Profissional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os profissionais</SelectItem>
                {medicos?.map((medico: Medico) => (
                  <SelectItem key={medico.id} value={medico.id}>
                    {medico.nome_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetch()}
              >
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FullCalendar */}
      <MediflowFullCalendar
        consultas={filteredConsultas}
        loading={loading}
        onConsultaClick={handleConsultaClick}
        onDateClick={handleDateClick}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        viewType={calendarView}
        onViewChange={(view) => setCalendarView(view as any)}
      />

      {/* Modais */}
      <Dialog open={consultaFormOpen} onOpenChange={closeCreateDialog}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingConsulta ? 'Editar Consulta' : 'Nova Consulta'}
            </DialogTitle>
          </DialogHeader>
          <ConsultaForm
            initialData={editingConsulta ? {
              id: editingConsulta.id,
              titulo: editingConsulta.titulo,
              descricao: editingConsulta.descricao,
              paciente_id: editingConsulta.pacientes?.[0]?.id,
              medico_id: editingConsulta.perfis?.[0]?.id,
              data_consulta: new Date(editingConsulta.data_consulta),
              hora_consulta: format(new Date(editingConsulta.data_consulta), 'HH:mm'),
              duracao_minutos: editingConsulta.duracao_minutos,
              status: editingConsulta.status,
              observacoes: editingConsulta.observacoes,
            } : undefined}
            pacientes={patients || []}
            medicos={medicos || []}
            consultasExistentes={consultas as ConsultaExistente[]}
            onSubmit={editingConsulta ? handleEditConsulta : handleCreateConsulta}
            onCancel={closeCreateDialog}
            loading={loading || loadingPatients || loadingMedicos}
            mode={editingConsulta ? 'edit' : 'create'}
          />
        </DialogContent>
      </Dialog>

      <ConsultaDetailsModal
        consulta={selectedConsulta}
        open={consultaDetailsOpen}
        onOpenChange={setConsultaDetailsOpen}
        onEdit={openEditDialog}
        onDelete={handleDeleteConsulta}
        onStatusChange={handleStatusChange}
        loading={loading}
      />

      <QuickCreateModal
        open={quickCreateOpen}
        onOpenChange={setQuickCreateOpen}
        selectedDate={selectedDateForCreate}
        pacientes={patients || []}
        medicos={medicos || []}
        onSubmit={handleCreateConsulta}
        loading={loading}
      />
    </div>
  )
}
