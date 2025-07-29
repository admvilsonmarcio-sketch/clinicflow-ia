import { useState, useCallback } from 'react'
import { EnderecoViaCEP } from '@/lib/validations/paciente'

interface UseViaCEPReturn {
  endereco: EnderecoViaCEP | null
  loading: boolean
  error: string | null
  buscarEndereco: (cep: string) => Promise<EnderecoViaCEP | null>
  limparEndereco: () => void
}

export function useViaCEP(): UseViaCEPReturn {
  const [endereco, setEndereco] = useState<EnderecoViaCEP | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buscarEndereco = useCallback(async (cep: string): Promise<EnderecoViaCEP | null> => {
    // Limpar CEP (remover caracteres especiais)
    const cepLimpo = cep.replace(/\D/g, '')
    
    // Validar formato do CEP
    if (cepLimpo.length !== 8) {
      setError('CEP deve ter 8 dígitos')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      
      if (!response.ok) {
        throw new Error('Erro na consulta do CEP')
      }

      const data: EnderecoViaCEP = await response.json()
      
      // Verificar se o CEP foi encontrado
      if (data.erro) {
        setError('CEP não encontrado')
        setEndereco(null)
        return null
      }

      // Formatar o endereço retornado
      const enderecoFormatado: EnderecoViaCEP = {
        ...data,
        cep: `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`, // Formatar CEP
        localidade: data.localidade || '', // Garantir que cidade não seja undefined
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        uf: data.uf || '',
        complemento: data.complemento || '',
        ibge: data.ibge || '',
        gia: data.gia || '',
        ddd: data.ddd || '',
        siafi: data.siafi || ''
      }

      setEndereco(enderecoFormatado)
      return enderecoFormatado
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao buscar CEP'
      setError(errorMessage)
      setEndereco(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const limparEndereco = useCallback(() => {
    setEndereco(null)
    setError(null)
  }, [])

  return {
    endereco,
    loading,
    error,
    buscarEndereco,
    limparEndereco
  }
}

// Hook para formatação de CEP
export function useFormatCEP() {
  const formatCEP = useCallback((value: string): string => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '')
    
    // Limita a 8 dígitos
    const limitedNumbers = numbers.slice(0, 8)
    
    // Aplica a máscara XXXXX-XXX
    if (limitedNumbers.length <= 5) {
      return limitedNumbers
    }
    
    return `${limitedNumbers.slice(0, 5)}-${limitedNumbers.slice(5)}`
  }, [])

  return { formatCEP }
}

// Hook para formatação de CPF
export function useFormatCPF() {
  const formatCPF = useCallback((value: string): string => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '')
    
    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11)
    
    // Aplica a máscara XXX.XXX.XXX-XX
    if (limitedNumbers.length <= 3) {
      return limitedNumbers
    }
    if (limitedNumbers.length <= 6) {
      return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3)}`
    }
    if (limitedNumbers.length <= 9) {
      return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6)}`
    }
    
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6, 9)}-${limitedNumbers.slice(9)}`
  }, [])

  return { formatCPF }
}

// Hook para formatação de telefone
export function useFormatTelefone() {
  const formatTelefone = useCallback((value: string, tipo: 'celular' | 'fixo' = 'celular'): string => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '')
    
    // Limita conforme o tipo
    const maxLength = tipo === 'celular' ? 11 : 10
    const limitedNumbers = numbers.slice(0, maxLength)
    
    // Aplica a máscara conforme o tipo
    if (limitedNumbers.length <= 2) {
      return limitedNumbers
    }
    if (limitedNumbers.length <= 2) {
      return `(${limitedNumbers}`
    }
    if (limitedNumbers.length <= 2) {
      return `(${limitedNumbers.slice(0, 2)}`
    }
    if (limitedNumbers.length <= 2) {
      return `(${limitedNumbers.slice(0, 2)})`
    }
    
    const ddd = limitedNumbers.slice(0, 2)
    const resto = limitedNumbers.slice(2)
    
    if (tipo === 'celular') {
      // Formato: (XX) XXXXX-XXXX
      if (resto.length <= 5) {
        return `(${ddd}) ${resto}`
      }
      return `(${ddd}) ${resto.slice(0, 5)}-${resto.slice(5)}`
    } else {
      // Formato: (XX) XXXX-XXXX
      if (resto.length <= 4) {
        return `(${ddd}) ${resto}`
      }
      return `(${ddd}) ${resto.slice(0, 4)}-${resto.slice(4)}`
    }
  }, [])

  return { formatTelefone }
}