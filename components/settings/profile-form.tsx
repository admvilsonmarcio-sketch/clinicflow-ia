"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputWithMask } from '@/components/ui/input-mask'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/contexts/user-context'
import { perfilUpdateSchema, z } from '@/lib/validations'
import { medicalLogger } from '@/lib/logging/medical-logger'
import { MedicalAction } from '@/lib/logging/types'
import { handleMedicalError } from '@/lib/errors/error-handler'
import { Loader2 } from 'lucide-react'

interface ProfileFormProps {
  profile: {
    id: string
    nome_completo?: string
    email?: string
    telefone?: string
    cargo?: string
  } | null
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome_completo: profile?.nome_completo || '',
    telefone: profile?.telefone || '',
  })

  const { toast } = useToast()
  const { updateProfile, profile: userProfile } = useUser()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile?.id) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Perfil não encontrado. Faça login novamente.",
      })
      return
    }

    setLoading(true)

    try {
      // 🔥 NOVA VALIDAÇÃO COM ZOD
      const validatedData = perfilUpdateSchema.parse(formData)
      const { error } = await supabase
        .from('perfis')
        .update({
          nome_completo: validatedData.nome_completo,
          telefone: validatedData.telefone,
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao salvar",
          description: error.message,
        })
      } else {
        // 🔥 LOG DA AÇÃO DE ATUALIZAÇÃO
        await medicalLogger.logProfileAction(
          MedicalAction.UPDATE_PROFILE,
          profile.id,
          medicalLogger.createBrowserContext(profile.id, userProfile?.clinica_id),
          {
            oldData: {
              nome_completo: profile.nome_completo,
              telefone: profile.telefone
            },
            newData: validatedData,
            changes: getChangedFields(profile, validatedData)
          }
        )

        // Atualizar o contexto com os novos dados
        updateProfile(validatedData)

        toast({
          variant: "success",
          title: "Perfil atualizado!",
          description: "Suas informações foram salvas com sucesso.",
        })
      }
    } catch (error) {
      // 🔥 TRATAMENTO DE ERROS ZOD
      if (error instanceof z.ZodError) {
        // Mostrar primeiro erro de validação
        const firstError = error.errors[0]
        toast({
          variant: "destructive",
          title: "Erro de validação",
          description: `${firstError.path.join('.')}: ${firstError.message}`
        })
        return
      }

      // 🔥 TRATAMENTO DE ERROS MÉDICOS
      await handleMedicalError(error, {
        userId: profile.id,
        clinicaId: userProfile?.clinica_id,
        action: MedicalAction.UPDATE_PROFILE,
        resourceId: profile.id
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

  // Helper para detectar campos alterados
  const getChangedFields = (oldData: any, newData: any) => {
    const changes: Record<string, { old: any, new: any }> = {}

    Object.keys(newData).forEach(key => {
      if (oldData[key] !== newData[key]) {
        changes[key] = {
          old: oldData[key],
          new: newData[key]
        }
      }
    })

    return changes
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
          <Input
            value={formData.nome_completo}
            onChange={(e) => handleChange('nome_completo', e.target.value)}
            placeholder="Seu nome completo"
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <Input
            value={profile?.email || ''}
            placeholder="seu@email.com"
            disabled
            className="w-full bg-gray-50"
          />
          <p className="text-xs text-gray-500">
            Email não pode ser alterado
          </p>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Telefone</label>
          <InputWithMask
            mask="(99) 99999-9999"
            value={formData.telefone}
            onChange={(e) => handleChange('telefone', e.target.value)}
            placeholder="(11) 99999-9999"
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Cargo</label>
          <div className="flex items-center h-10">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              {profile?.cargo === 'medico' ? 'Médico' :
                profile?.cargo === 'assistente' ? 'Assistente' :
                  profile?.cargo === 'recepcionista' ? 'Recepcionista' :
                    profile?.cargo === 'admin' ? 'Administrador' : 'Usuário'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t">
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full sm:w-auto min-w-[140px] h-10"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
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
