'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

interface Medico {
  id: string
  nome_completo: string
  email?: string
  telefone?: string

  crm?: string
  cargo: 'medico' | 'admin' | 'super_admin'
  clinica_id: string
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

interface UseMedicos {
  medicos: Medico[]
  loading: boolean
  error: string | null
  fetchMedicos: () => Promise<void>
  searchMedicos: (query: string) => Medico[]
  getMedicoById: (id: string) => Medico | undefined
  getActiveMedicos: () => Medico[]
}

export function useMedicos(): UseMedicos {
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const fetchMedicos = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from('perfis')
        .select(`
          id,
          nome_completo,
          email,
          telefone,
      
          crm,
          cargo,
          clinica_id,
          ativo,
          criado_em,
          atualizado_em
        `)
        .in('cargo', ['medico', 'admin'])
        .eq('ativo', true)
        .order('nome_completo', { ascending: true })

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      setMedicos(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar médicos'
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

  const searchMedicos = (query: string): Medico[] => {
    if (!query.trim()) return medicos

    const searchTerm = query.toLowerCase().trim()
    return medicos.filter(medico => 
      medico.nome_completo.toLowerCase().includes(searchTerm) ||
      medico.email?.toLowerCase().includes(searchTerm) ||
      medico.cargo?.toLowerCase().includes(searchTerm) ||
      medico.crm?.includes(searchTerm)
    )
  }

  const getMedicoById = (id: string): Medico | undefined => {
    return medicos.find(medico => medico.id === id)
  }

  const getActiveMedicos = (): Medico[] => {
    return medicos.filter(medico => medico.ativo)
  }

  useEffect(() => {
    fetchMedicos()
  }, [])

  return {
    medicos,
    loading,
    error,
    fetchMedicos,
    searchMedicos,
    getMedicoById,
    getActiveMedicos
  }
}