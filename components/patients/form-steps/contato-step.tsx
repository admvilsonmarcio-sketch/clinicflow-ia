'use client'

import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Phone, Mail, MessageSquare } from 'lucide-react'
import { useFormatTelefone } from '@/hooks/use-viacep'
import { PacienteFormData } from '@/lib/validations/paciente'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export function ContatoStep() {
  const { control, watch, formState: { errors } } = useFormContext<PacienteFormData>()
  const { formatTelefone } = useFormatTelefone()
  const [emailValidation, setEmailValidation] = useState<{ isValid: boolean; message: string } | null>(null)
  // Corrigir nomes dos campos para corresponder ao schema
  const watchedEmail = watch('email')
  const watchedCelular = watch('telefone_celular')
  const watchedTelefone = watch('telefone_fixo')

  // Validação de email em tempo real
  useEffect(() => {
    if (watchedEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const isValid = emailRegex.test(watchedEmail)
      setEmailValidation({
        isValid,
        message: isValid ? 'Email válido' : 'Email inválido'
      })
    } else {
      setEmailValidation(null)
    }
  }, [watchedEmail])

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
      {/* Informações de Contato Principal */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Phone className="h-5 w-5" />
          Informações de Contato
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Celular - corrigir nome do campo */}
          <FormField
            control={control}
            name="telefone_celular"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Celular
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="(11) 91234-5678"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const formatted = formatTelefone(e.target.value)
                      field.onChange(formatted)
                    }}
                    className={errors.telefone_celular ? 'border-red-500' : ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Telefone Fixo - corrigir nome do campo */}
          <FormField
            control={control}
            name="telefone_fixo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone Fixo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="(11) 1234-5678"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const formatted = formatTelefone(e.target.value)
                      field.onChange(formatted)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Email */}
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="exemplo@email.com"
                    {...field}
                    className={cn(
                      errors.email ? 'border-red-500' : '',
                      emailValidation?.isValid === false ? 'border-red-500' : '',
                      emailValidation?.isValid === true ? 'border-green-500' : ''
                    )}
                  />
                  {emailValidation && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {emailValidation.isValid ? (
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                      ) : (
                        <div className="h-2 w-2 bg-red-500 rounded-full" />
                      )}
                    </div>
                  )}
                </div>
              </FormControl>
              {emailValidation && (
                <p className={cn(
                  "text-sm",
                  emailValidation.isValid ? "text-green-600" : "text-red-600"
                )}>
                  {emailValidation.message}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Remover campo observacoes_contato que não existe no schema */}
      
      {/* Resumo dos Contatos */}
      {(watchedCelular || watchedTelefone || watchedEmail) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Resumo dos Contatos:</h4>
          <div className="space-y-1 text-sm text-blue-800">
            {watchedCelular && (
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <span>Celular: {watchedCelular}</span>
              </div>
            )}
            {watchedTelefone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <span>Telefone: {watchedTelefone}</span>
              </div>
            )}
            {watchedEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <span>Email: {watchedEmail}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alerta sobre campos obrigatórios */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Campos obrigatórios:</strong> Celular e Email são necessários para comunicação com o paciente.
          <br />
          <span className="text-sm text-muted-foreground mt-1 block">
            O telefone fixo é opcional, mas pode ser útil como contato alternativo.
          </span>
        </AlertDescription>
      </Alert>
    </div>
  )
}