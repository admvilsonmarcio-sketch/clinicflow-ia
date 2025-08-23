
'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, startOfMonth, endOfMonth, addMinutes } from 'date-fns'
import { toast } from '@/components/ui/use-toast'
import type { 
  Consulta, 
  CreateConsultaData, 
  UpdateConsultaData,
  ConsultaFormData,
  StatusConsulta
} from '@/types/consulta'

// Dados de exemplo atualizados
const mockConsultas: Consulta[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    titulo: "Consulta Cardiológica",
    descricao: "Avaliação cardiológica de rotina com ECG",
    data_consulta: "2024-01-15T14:00:00.000Z",
    duracao_minutos: 60,
    status: "agendada",
    observacoes: "Paciente em jejum de 12 horas",
    google_calendar_event_id: undefined,
    lembrete_enviado: false,
    paciente_id: "550e8400-e29b-41d4-a716-446655440101",
    medico_id: "550e8400-e29b-41d4-a716-446655440201",
    clinica_id: "550e8400-e29b-41d4-a716-446655440301",
    pacientes: [
      {
        id: "550e8400-e29b-41d4-a716-446655440101",
        nome_completo: "João Silva",
        email: "joao.silva@email.com",
        telefone_celular: "(11) 99999-1234"
      }
    ],
    perfis: [
      {
        id: "550e8400-e29b-41d4-a716-446655440201",
        nome_completo: "Dr. Carlos Medeiros",
        cargo: "medico"
      }
    ],
    clinicas: [
      {
        id: "550e8400-e29b-41d4-a716-446655440301",
        nome: "Clínica Cardio+"
      }
    ]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    titulo: "Consulta Neurológica",
    descricao: "Avaliação de dores de cabeça recorrentes",
    data_consulta: "2024-01-16T09:00:00.000Z",
    duracao_minutos: 45,
    status: "confirmada",
    observacoes: "Trazer exames anteriores",
    google_calendar_event_id: undefined,
    lembrete_enviado: true,
    paciente_id: "550e8400-e29b-41d4-a716-446655440102",
    medico_id: "550e8400-e29b-41d4-a716-446655440202",
    clinica_id: "550e8400-e29b-41d4-a716-446655440301",
    pacientes: [
      {
        id: "550e8400-e29b-41d4-a716-446655440102",
        nome_completo: "Maria Santos",
        email: "maria.santos@email.com",
        telefone_celular: "(11) 98888-5678"
      }
    ],
    perfis: [
      {
        id: "550e8400-e29b-41d4-a716-446655440202",
        nome_completo: "Dra. Ana Neurologia",
        cargo: "medico"
      }
    ],
    clinicas: [
      {
        id: "550e8400-e29b-41d4-a716-446655440301",
        nome: "Clínica Cardio+"
      }
    ]
  }
]

interface UseConsultasOptions {
  clinicaId?: string
  medicoId?: string
  pacienteId?: string
  status?: string
  dataInicio?: Date
  dataFim?: Date
}

interface UseConsultasReturn {
  consultas: Consulta[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createConsulta: (data: CreateConsultaData) => Promise<Consulta | null>
  updateConsulta: (id: string, data: UpdateConsultaData) => Promise<Consulta | null>
  deleteConsulta: (id: string) => Promise<boolean>
  getConsultasForMonth: (date: Date) => Promise<void>
}

export function useConsultas(options: UseConsultasOptions = {}): UseConsultasReturn {
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConsultas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500))

      let filteredConsultas = [...mockConsultas]

      // Aplicar filtros
      if (options.clinicaId) {
        filteredConsultas = filteredConsultas.filter(c => c.clinica_id === options.clinicaId)
      }

      if (options.medicoId) {
        filteredConsultas = filteredConsultas.filter(c => c.medico_id === options.medicoId)
      }

      if (options.pacienteId) {
        filteredConsultas = filteredConsultas.filter(c => c.paciente_id === options.pacienteId)
      }

      if (options.status) {
        filteredConsultas = filteredConsultas.filter(c => c.status === options.status)
      }

      if (options.dataInicio) {
        filteredConsultas = filteredConsultas.filter(c => 
          new Date(c.data_consulta) >= options.dataInicio!
        )
      }

      if (options.dataFim) {
        filteredConsultas = filteredConsultas.filter(c => 
          new Date(c.data_consulta) <= options.dataFim!
        )
      }

      setConsultas(filteredConsultas)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar consultas'
      setError(errorMessage)
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(options)])

  const getConsultasForMonth = useCallback(async (date: Date) => {
    const startDate = startOfMonth(date)
    const endDate = endOfMonth(date)
    
    try {
      setLoading(true)
      setError(null)

      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 300))

      let filteredConsultas = mockConsultas.filter(consulta => {
        const consultaDate = new Date(consulta.data_consulta)
        return consultaDate >= startDate && consultaDate <= endDate
      })

      // Aplicar filtros adicionais
      if (options.clinicaId) {
        filteredConsultas = filteredConsultas.filter(c => c.clinica_id === options.clinicaId)
      }

      if (options.medicoId) {
        filteredConsultas = filteredConsultas.filter(c => c.medico_id === options.medicoId)
      }

      setConsultas(filteredConsultas)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar consultas do mês'
      setError(errorMessage)
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(options)])

  const createConsulta = useCallback(async (data: CreateConsultaData): Promise<Consulta | null> => {
    try {
      setLoading(true)
      setError(null)

      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500))

      const newConsulta: Consulta = {
        id: `demo-${Date.now()}`,
        titulo: data.titulo,
        descricao: data.descricao,
        data_consulta: data.data_consulta,
        duracao_minutos: data.duracao_minutos,
        status: data.status,
        observacoes: data.observacoes,
        google_calendar_event_id: data.google_calendar_event_id || undefined,
        lembrete_enviado: data.lembrete_enviado || false,
        paciente_id: data.paciente_id,
        medico_id: data.medico_id,
        clinica_id: data.clinica_id,
        pacientes: [
          {
            id: data.paciente_id,
            nome_completo: "Paciente Novo",
            email: "paciente@email.com",
            telefone_celular: "(11) 99999-0000"
          }
        ],
        perfis: [
          {
            id: data.medico_id,
            nome_completo: "Dr. Novo Médico",
            cargo: "medico"
          }
        ],
        clinicas: [
          {
            id: data.clinica_id || "550e8400-e29b-41d4-a716-446655440301",
            nome: "Clínica Demo"
          }
        ]
      }

      setConsultas(prev => [...prev, newConsulta].sort((a, b) => 
        new Date(a.data_consulta).getTime() - new Date(b.data_consulta).getTime()
      ))
      
      toast({
        title: 'Sucesso',
        description: 'Consulta criada com sucesso!'
      })
      
      return newConsulta
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar consulta'
      setError(errorMessage)
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateConsulta = useCallback(async (id: string, data: UpdateConsultaData): Promise<Consulta | null> => {
    try {
      setLoading(true)
      setError(null)

      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 300))

      setConsultas(prev => 
        prev.map(consulta => {
          if (consulta.id === id) {
            return { ...consulta, ...data }
          }
          return consulta
        }).sort((a, b) => 
          new Date(a.data_consulta).getTime() - new Date(b.data_consulta).getTime()
        )
      )
      
      toast({
        title: 'Sucesso',
        description: 'Consulta atualizada com sucesso!'
      })
      
      const updatedConsulta = consultas.find(c => c.id === id)
      return updatedConsulta ? { ...updatedConsulta, ...data } : null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar consulta'
      setError(errorMessage)
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [consultas])

  const deleteConsulta = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 300))

      setConsultas(prev => prev.filter(consulta => consulta.id !== id))
      
      toast({
        title: 'Sucesso',
        description: 'Consulta excluída com sucesso!'
      })
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir consulta'
      setError(errorMessage)
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar consultas na inicialização
  useEffect(() => {
    fetchConsultas()
  }, [])

  return {
    consultas,
    loading,
    error,
    refetch: fetchConsultas,
    createConsulta,
    updateConsulta,
    deleteConsulta,
    getConsultasForMonth
  }
}

export type { Consulta, UseConsultasOptions, UseConsultasReturn }
