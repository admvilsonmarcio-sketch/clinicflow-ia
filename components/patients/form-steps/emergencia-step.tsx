'use client'

import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Phone, User, Heart } from 'lucide-react'
import { useFormatTelefone } from '@/hooks/use-viacep'
import { PacienteFormData } from '@/lib/validations/paciente'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const PARENTESCOS = [
  { value: 'pai', label: 'Pai' },
  { value: 'mae', label: 'Mãe' },
  { value: 'conjuge', label: 'Cônjuge' },
  { value: 'filho', label: 'Filho(a)' },
  { value: 'irmao', label: 'Irmão/Irmã' },
  { value: 'avo', label: 'Avô/Avó' },
  { value: 'tio', label: 'Tio/Tia' },
  { value: 'primo', label: 'Primo(a)' },
  { value: 'sogro', label: 'Sogro/Sogra' },
  { value: 'cunhado', label: 'Cunhado(a)' },
  { value: 'amigo', label: 'Amigo(a)' },
  { value: 'vizinho', label: 'Vizinho(a)' },
  { value: 'cuidador', label: 'Cuidador(a)' },
  { value: 'outro', label: 'Outro' }
]

export function EmergenciaStep() {
  const { control, watch, formState: { errors } } = useFormContext<PacienteFormData>()
  const { formatTelefone } = useFormatTelefone()
  const [telefoneValidation, setTelefoneValidation] = useState<{ isValid: boolean; message: string } | null>(null)
  
  // Corrigir nomes dos campos para corresponder ao schema
  const watchedNomeEmergencia = watch('contato_emergencia_nome')
  const watchedTelefoneEmergencia = watch('contato_emergencia_telefone')
  const watchedParentesco = watch('contato_emergencia_parentesco')
  const watchedObservacoesEmergencia = watch('observacoes_emergencia')

  // Validação de telefone em tempo real
  useEffect(() => {
    if (watchedTelefoneEmergencia) {
      const numbers = watchedTelefoneEmergencia.replace(/\D/g, '')
      const isValid = numbers.length >= 10 && numbers.length <= 11
      setTelefoneValidation({
        isValid,
        message: isValid ? 'Telefone válido' : 'Telefone deve ter 10 ou 11 dígitos'
      })
    } else {
      setTelefoneValidation(null)
    }
  }, [watchedTelefoneEmergencia])

  // Função para formatar telefone brasileiro
  const formatarTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length <= 10) {
      // Telefone fixo: (11) 1234-5678
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    } else {
      // Celular: (11) 91234-5678
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
  }

  return (
    <div className="space-y-6">
      {/* Título da Seção */}
      <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        Contato de Emergência
      </div>

      {/* Alerta de Importância */}
      <Alert className="border-orange-200 bg-orange-50">
        <Heart className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Importante:</strong> Essas informações são essenciais em caso de emergência médica.
          Certifique-se de que os dados estão atualizados e que a pessoa pode ser facilmente contatada.
        </AlertDescription>
      </Alert>

      {/* Informações do Contato de Emergência */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome do Contato - corrigir nome do campo */}
          <FormField
            control={control}
            name="contato_emergencia_nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome Completo
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nome completo do contato"
                    {...field}
                    value={field.value || ''}
                    className={errors.contato_emergencia_nome ? 'border-red-500' : ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Parentesco - corrigir nome do campo */}
          <FormField
            control={control}
            name="contato_emergencia_parentesco"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Parentesco/Relação
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className={errors.contato_emergencia_parentesco ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o parentesco" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PARENTESCOS.map((parentesco) => (
                      <SelectItem key={parentesco.value} value={parentesco.value}>
                        {parentesco.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Telefone de Emergência - corrigir nome do campo */}
        <FormField
          control={control}
          name="contato_emergencia_telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone de Emergência
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="(11) 91234-5678 ou (11) 1234-5678"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const formatted = formatTelefone(e.target.value)
                      field.onChange(formatted)
                    }}
                    className={cn(
                      errors.contato_emergencia_telefone ? 'border-red-500' : '',
                      telefoneValidation?.isValid === false ? 'border-red-500' : '',
                      telefoneValidation?.isValid === true ? 'border-green-500' : ''
                    )}
                  />
                  {telefoneValidation && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {telefoneValidation.isValid ? (
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                      ) : (
                        <div className="h-2 w-2 bg-red-500 rounded-full" />
                      )}
                    </div>
                  )}
                </div>
              </FormControl>
              {telefoneValidation && !errors.contato_emergencia_telefone && (
                <p className={cn(
                  "text-sm",
                  telefoneValidation.isValid ? "text-green-600" : "text-red-600"
                )}>
                  {telefoneValidation.message}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />      </div>

      {/* Observações de Emergência */}
      <FormField
        control={control}
        name="observacoes_emergencia"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Observações de Emergência
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Informações importantes para situações de emergência (ex: alergias graves, medicamentos essenciais, condições especiais, etc.)"
                {...field}
                value={field.value || ''}
                rows={3}
                className="resize-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Resumo do Contato de Emergência */}
      {(watchedNomeEmergencia || watchedTelefoneEmergencia || watchedParentesco || watchedObservacoesEmergencia) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Resumo do Contato de Emergência:
          </h4>
          <div className="space-y-1 text-sm text-red-800">
            {watchedNomeEmergencia && (
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <span><strong>Nome:</strong> {watchedNomeEmergencia}</span>
              </div>
            )}
            {watchedParentesco && (
              <div className="flex items-center gap-2">
                <Heart className="h-3 w-3" />
                <span><strong>Parentesco:</strong> {PARENTESCOS.find(p => p.value === watchedParentesco)?.label}</span>
              </div>
            )}
            {watchedTelefoneEmergencia && (
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <span><strong>Telefone:</strong> {watchedTelefoneEmergencia}</span>
              </div>
            )}
            {watchedObservacoesEmergencia && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-3 w-3 mt-0.5" />
                <span><strong>Observações:</strong> {watchedObservacoesEmergencia}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alerta sobre campos obrigatórios */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Campos opcionais:</strong> Todas as informações de contato de emergência são opcionais, mas recomendadas para situações de emergência.
        </AlertDescription>
      </Alert>
    </div>
  )
}
