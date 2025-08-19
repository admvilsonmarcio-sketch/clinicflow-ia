'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

interface Patient {
  id: string
  nome_completo: string
  email?: string
  telefone?: string
  cpf?: string
  data_nascimento?: string
  endereco?: string
  cep?: string
  cidade?: string
  estado?: string
  observacoes?: string
  clinica_id: string
  criado_em: string
  atualizado_em: string
}

interface UsePatients {
  patients: Patient[]
  loading: boolean
  error: string | null
  fetchPatients: () => Promise<void>
  searchPatients: (query: string) => Patient[]
  getPatientById: (id: string) => Patient | undefined
}

export function usePatients(): UsePatients {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const fetchPatients = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from('pacientes')
        .select(`
          id,
          nome_completo,
          email,
          telefone,
          cpf,
          data_nascimento,
          endereco,
          cep,
          cidade,
          estado,
          observacoes,
          clinica_id,
          criado_em,
          atualizado_em
        `)
        .order('nome_completo', { ascending: true })

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      setPatients(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar pacientes'
      setError(errorMessage)
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const searchPatients = (query: string): Patient[] => {
    if (!query.trim()) return patients

    const searchTerm = query.toLowerCase().trim()
    return patients.filter(patient => 
      patient.nome_completo.toLowerCase().includes(searchTerm) ||
      patient.email?.toLowerCase().includes(searchTerm) ||
      patient.telefone?.includes(searchTerm) ||
      patient.cpf?.includes(searchTerm)
    )
  }

  const getPatientById = (id: string): Patient | undefined => {
    return patients.find(patient => patient.id === id)
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  return {
    patients,
    loading,
    error,
    fetchPatients,
    searchPatients,
    getPatientById
  }
}