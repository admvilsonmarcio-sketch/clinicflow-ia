"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputWithMask } from '@/components/ui/input-mask'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase'
import { useUser } from '@/contexts/user-context'
import { Loader2 } from 'lucide-react'

interface ClinicFormProps {
  clinic: {
    nome?: string
    telefone?: string
    email?: string
    endereco?: string
    site?: string
    descricao?: string
  } | null
  clinicId: string | null
}

export function ClinicForm({ clinic, clinicId }: ClinicFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: clinic?.nome || '',
    telefone: clinic?.telefone || '',
    email: clinic?.email || '',
    endereco: clinic?.endereco || '',
    site: clinic?.site || '',
    descricao: clinic?.descricao || '',
  })

  const { toast } = useToast()
  const { updateClinic } = useUser()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clinicId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Clínica não encontrada. Verifique suas permissões.",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('clinicas')
        .update({
          ...formData,
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', clinicId)

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao salvar",
          description: error.message,
        })
      } else {
        // Atualizar o contexto com os novos dados
        updateClinic(formData)

        toast({
          variant: "success",
          title: "Clínica atualizada!",
          description: "As informações da clínica foram salvas com sucesso.",
        })
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Nome da Clínica</label>
          <Input
            value={formData.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
            placeholder="Nome da sua clínica"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Telefone</label>
          <InputWithMask
            mask="(99) 9999-9999"
            value={formData.telefone}
            onChange={(e) => handleChange('telefone', e.target.value)}
            placeholder="(11) 3333-3333"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="contato@clinica.com"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Site</label>
          <Input
            type="url"
            value={formData.site}
            onChange={(e) => handleChange('site', e.target.value)}
            placeholder="https://www.clinica.com"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Descrição</label>
          <Input
            value={formData.descricao}
            onChange={(e) => handleChange('descricao', e.target.value)}
            placeholder="Breve descrição da clínica"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Endereço</label>
          <Input
            value={formData.endereco}
            onChange={(e) => handleChange('endereco', e.target.value)}
            placeholder="Rua, número, bairro, cidade - UF"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Alterações'
          )}
        </Button>
      </div>
    </form>
  )
}