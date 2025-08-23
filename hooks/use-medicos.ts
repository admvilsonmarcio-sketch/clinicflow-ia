
'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from '@/components/ui/use-toast'

export interface Medico {
  id: string
  nome_completo: string
  email?: string
  cargo: string
  clinica_id?: string
  telefone?: string
  foto_url?: string
}

interface UseMedicosOptions {
  clinicaId?: string
}

interface UseMedicosReturn {
  medicos: Medico[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useMedicos(options: UseMedicosOptions = {}): UseMedicosReturn {
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMedicos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Construir URL da API com parâmetros
      const searchParams = new URLSearchParams()
      searchParams.append('cargo', 'medicos') // Buscar apenas médicos e admins
      searchParams.append('limit', '100') // Buscar até 100 registros
      
      if (options.clinicaId) {
        searchParams.append('clinica_id', options.clinicaId)
      }

      const response = await fetch(`/api/perfis?${searchParams.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao buscar profissionais')
      }
      
      const data = await response.json()
      setMedicos(data.data || [])
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar profissionais'
      setError(errorMessage)
      console.error('Erro ao buscar profissionais:', err)
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(options)])

  // Carregar médicos na inicialização
  useEffect(() => {
    fetchMedicos()
  }, [fetchMedicos])

  return {
    medicos,
    loading,
    error,
    refetch: fetchMedicos
  }
}

export type { UseMedicosOptions, UseMedicosReturn }
