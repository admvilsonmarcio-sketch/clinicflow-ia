
'use client'

import { useState, useEffect } from 'react'
import { mockPatients } from '@/lib/mock-data'
import type { Paciente } from '@/types/consulta'

export function usePatientsDemo() {
  const [patients, setPatients] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    // Simular delay de API
    setTimeout(() => {
      setPatients(mockPatients)
      setLoading(false)
    }, 300)
  }, [])

  return { patients, loading }
}
