'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { toast } from '@/components/ui/use-toast'
import type { 
  Consulta, 
  CreateConsultaData, 
  UpdateConsultaData,
  ConsultaFormData 
} from '@/types/consulta'

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
  
  const supabase = createClientComponentClient()

  const fetchConsultas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Construir query
      let query = supabase
        .from('consultas')
        .select(`
          id,
          titulo,
          descricao,
          data_consulta,
          duracao_minutos,
          status,
          paciente_id,
          medico_id,
          clinica_id,
          observacoes,
          google_calendar_event_id,
          lembrete_enviado,
          criado_em,
          atualizado_em,
          pacientes(id, nome_completo, email, telefone_celular),
          perfis!medico_id(id, nome_completo, cargo),
          clinicas(id, nome)
        `)
        .order('data_consulta', { ascending: true })

      // Aplicar filtros
      if (options.clinicaId) {
        query = query.eq('clinica_id', options.clinicaId)
      }

      if (options.medicoId) {
        query = query.eq('medico_id', options.medicoId)
      }

      if (options.pacienteId) {
        query = query.eq('paciente_id', options.pacienteId)
      }

      if (options.status) {
        query = query.eq('status', options.status)
      }

      if (options.dataInicio) {
        query = query.gte('data_consulta', options.dataInicio.toISOString())
      }

      if (options.dataFim) {
        query = query.lte('data_consulta', options.dataFim.toISOString())
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setConsultas(data || [])
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
  }, [supabase, options])

  const getConsultasForMonth = useCallback(async (date: Date) => {
    const startDate = startOfMonth(date)
    const endDate = endOfMonth(date)
    
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('consultas')
        .select(`
          id,
          titulo,
          descricao,
          data_consulta,
          duracao_minutos,
          status,
          paciente_id,
          medico_id,
          clinica_id,
          observacoes,
          google_calendar_event_id,
          lembrete_enviado,
          criado_em,
          atualizado_em,
          pacientes(id, nome_completo, email, telefone_celular),
          perfis!medico_id(id, nome_completo, cargo),
          clinicas(id, nome)
        `)
        .gte('data_consulta', startDate.toISOString())
        .lte('data_consulta', endDate.toISOString())
        .order('data_consulta', { ascending: true })

      // Aplicar filtros adicionais
      if (options.clinicaId) {
        query = query.eq('clinica_id', options.clinicaId)
      }

      if (options.medicoId) {
        query = query.eq('medico_id', options.medicoId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setConsultas(data || [])
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
  }, [supabase, options])

  const createConsulta = useCallback(async (data: CreateConsultaData): Promise<Consulta | null> => {
    try {
      setLoading(true)
      setError(null)

      const { data: newConsulta, error: insertError } = await supabase
        .from('consultas')
        .insert(data)
        .select(`
          id,
          titulo,
          descricao,
          data_consulta,
          duracao_minutos,
          status,
          paciente_id,
          medico_id,
          clinica_id,
          observacoes,
          google_calendar_event_id,
          lembrete_enviado,
          criado_em,
          atualizado_em,
          pacientes(id, nome_completo, email, telefone_celular),
          perfis!medico_id(id, nome_completo, cargo),
          clinicas(id, nome)
        `)
        .single()

      if (insertError) {
        throw new Error(insertError.message)
      }

      if (newConsulta) {
        setConsultas(prev => [...prev, newConsulta].sort((a, b) => 
          new Date(a.data_consulta).getTime() - new Date(b.data_consulta).getTime()
        ))
        
        toast({
          title: 'Sucesso',
          description: 'Consulta criada com sucesso!'
        })
        
        return newConsulta
      }

      return null
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
  }, [supabase])

  const updateConsulta = useCallback(async (id: string, data: UpdateConsultaData): Promise<Consulta | null> => {
    try {
      setLoading(true)
      setError(null)

      const { data: updatedConsulta, error: updateError } = await supabase
        .from('consultas')
        .update(data)
        .eq('id', id)
        .select(`
          id,
          titulo,
          descricao,
          data_consulta,
          duracao_minutos,
          status,
          paciente_id,
          medico_id,
          clinica_id,
          observacoes,
          google_calendar_event_id,
          lembrete_enviado,
          criado_em,
          atualizado_em,
          pacientes(id, nome_completo, email, telefone_celular),
          perfis!medico_id(id, nome_completo, cargo),
          clinicas(id, nome)
        `)
        .single()

      if (updateError) {
        throw new Error(updateError.message)
      }

      if (updatedConsulta) {
        setConsultas(prev => 
          prev.map(consulta => 
            consulta.id === id ? updatedConsulta : consulta
          ).sort((a, b) => 
            new Date(a.data_consulta).getTime() - new Date(b.data_consulta).getTime()
          )
        )
        
        toast({
          title: 'Sucesso',
          description: 'Consulta atualizada com sucesso!'
        })
        
        return updatedConsulta
      }

      return null
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
  }, [supabase])

  const deleteConsulta = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const { error: deleteError } = await supabase
        .from('consultas')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

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
  }, [supabase])

  // Carregar consultas na inicialização
  useEffect(() => {
    fetchConsultas()
  }, [fetchConsultas])

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