'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar as CalendarIcon, Filter, Search, Clock, User, Users, Stethoscope } from 'lucide-react'
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
import { AgendaCalendar } from '@/components/calendar/agenda-calendar'
import { ConsultaForm } from '@/components/forms/consulta-form'
import { useConsultas } from '@/hooks/use-consultas'
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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingConsulta, setEditingConsulta] = useState<Consulta | null>(null)

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
      })
      
      setDialogOpen(false)
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
      setDialogOpen(false)
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
    if (!confirm('Tem certeza que deseja excluir esta consulta?')) return

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

  const openEditDialog = (consulta: Consulta) => {
    setEditingConsulta(consulta)
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingConsulta(null)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingConsulta(null)
  }

  // Filtrar consultas
  const filteredConsultas = consultas.filter((consulta: Consulta) => {
    const matchesSearch = 
        consulta.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consulta.pacientes[0]?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consulta.perfis[0]?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || consulta.status === statusFilter
      const matchesMedico = medicoFilter === 'all' || consulta.perfis[0]?.id === medicoFilter
    
    return matchesSearch && matchesStatus && matchesMedico
  })

  // Consultas do dia selecionado
  const consultasDoDia = selectedDate 
    ? filteredConsultas.filter((consulta: Consulta) => {
        const dataConsulta = new Date(consulta.data_consulta)
        return (
          dataConsulta.getDate() === selectedDate.getDate() &&
          dataConsulta.getMonth() === selectedDate.getMonth() &&
          dataConsulta.getFullYear() === selectedDate.getFullYear()
        )
      })
    : []

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' 
      ? subMonths(currentDate, 1)
      : addMonths(currentDate, 1)
    setCurrentDate(newDate)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">
            Gerencie consultas e visualize a agenda médica
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{patients.length} pacientes</span>
            </div>
            <div className="flex items-center gap-1">
              <Stethoscope className="h-4 w-4" />
              <span>{medicos.length} médicos</span>
            </div>
          </div>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Consulta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                  paciente_id: editingConsulta.pacientes[0]?.id,
                    medico_id: editingConsulta.perfis[0]?.id,
                  data_consulta: new Date(editingConsulta.data_consulta),
                  hora_consulta: format(new Date(editingConsulta.data_consulta), 'HH:mm'),
                  duracao_minutos: editingConsulta.duracao_minutos,
                  status: editingConsulta.status,
                  observacoes: editingConsulta.observacoes,
                } : undefined}
                pacientes={patients}
                medicos={medicos}
                consultasExistentes={consultas as ConsultaExistente[]}
                onSubmit={editingConsulta ? handleEditConsulta : handleCreateConsulta}
                onCancel={closeDialog}
                loading={loading || loadingPatients || loadingMedicos}
                mode={editingConsulta ? 'edit' : 'create'}
              />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                <SelectValue placeholder="Médico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os médicos</SelectItem>
                {medicos.map((medico) => (
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
                onClick={() => navigateMonth('prev')}
              >
                ← Mês Anterior
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                Próximo Mês →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo Principal */}
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Calendário</span>
            <span className="sm:hidden">Cal.</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Calendário */}
            <div className="xl:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className="text-lg sm:text-xl">Calendário - {format(currentDate, 'MMMM yyyy', { locale: ptBR })}</span>
                    <div className="flex gap-1 sm:gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigateMonth('prev')}
                      >
                        ←
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentDate(new Date())}
                      >
                        Hoje
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigateMonth('next')}
                      >
                        →
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AgendaCalendar
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    consultas={filteredConsultas}
                    onConsultaClick={(consulta: Consulta) => {
                      openEditDialog(consulta)
                    }}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Consultas do Dia */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {selectedDate 
                      ? `Consultas - ${format(selectedDate, 'dd/MM/yyyy')}` 
                      : 'Selecione uma data'
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    consultasDoDia.length > 0 ? (
                      <div className="space-y-3">
                        {consultasDoDia
                          .sort((a, b) => new Date(a.data_consulta).getTime() - new Date(b.data_consulta).getTime())
                          .map((consulta: Consulta) => (
                            <div 
                              key={consulta.id} 
                              className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => openEditDialog(consulta)}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {consulta.titulo}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                    {consulta.pacientes[0]?.nome_completo}
                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(consulta.data_consulta), 'HH:mm')} 
                                    ({consulta.duracao_minutos}min)
                                  </p>
                                </div>
                                <Badge className={statusColors[consulta.status]}>
                                  {statusLabels[consulta.status]}
                                </Badge>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma consulta agendada para este dia
                      </p>
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Clique em uma data no calendário para ver as consultas
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>


          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Consultas</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredConsultas.length > 0 ? (
                <div className="space-y-3">
                  {filteredConsultas
                    .sort((a, b) => new Date(a.data_consulta).getTime() - new Date(b.data_consulta).getTime())
                    .map((consulta) => (
                      <div 
                        key={consulta.id} 
                        className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => openEditDialog(consulta)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium">{consulta.titulo}</h3>
                              <Badge className={statusColors[consulta.status]}>
                                {statusLabels[consulta.status]}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {consulta.pacientes[0]?.nome_completo}
                              </div>
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                {format(new Date(consulta.data_consulta), 'dd/MM/yyyy HH:mm')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {consulta.duracao_minutos} minutos
                              </div>
                            </div>
                            {consulta.descricao && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {consulta.descricao}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma consulta encontrada com os filtros aplicados
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}