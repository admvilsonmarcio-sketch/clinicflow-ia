'use client'

import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Stethoscope, AlertCircle, Heart, Pill, FileText, Shield } from 'lucide-react'
import { PacienteFormData } from '@/lib/validations/paciente'
import { cn } from '@/lib/utils'

export function MedicoStep() {
  const { control, watch, formState: { errors } } = useFormContext<PacienteFormData>()
  
  // Corrigir nomes dos campos para corresponder ao schema
  const watchedConvenio = watch('convenio_medico')
  const watchedCarteirinha = watch('numero_carteirinha')
  const watchedHistorico = watch('historico_medico_detalhado')
  const watchedAlergias = watch('alergias_conhecidas')
  const watchedMedicamentos = watch('medicamentos_uso')
  const watchedObservacoes = watch('observacoes_gerais')
  const watchedTipoSanguineo = watch('tipo_sanguineo')

  return (
    <div className="space-y-6">
      {/* Título da Seção */}
      <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
        <Stethoscope className="size-5 text-blue-600" />
        Informações Médicas
      </div>

      {/* Alerta de Privacidade */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="size-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Privacidade:</strong> Todas as informações médicas são confidenciais e protegidas pela LGPD.
          Estes dados ajudam a oferecer um atendimento mais seguro e personalizado.
        </AlertDescription>
      </Alert>

      {/* Convênio Médico */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={control}
            name="convenio_medico"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Heart className="size-4" />
                  Convênio Médico
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Unimed, Bradesco Saúde, SUS"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="numero_carteirinha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número da Carteirinha</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Número da carteirinha do convênio"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Tipo Sanguíneo */}
      <FormField
        control={control}
        name="tipo_sanguineo"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Heart className="size-4" />
              Tipo Sanguíneo
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: A+, B-, O+, AB-"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Histórico Médico */}
      <FormField
        control={control}
        name="historico_medico_detalhado"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <FileText className="size-4" />
              Histórico Médico Detalhado
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descreva doenças anteriores, cirurgias, internações, condições crônicas, etc."
                className="min-h-[100px]"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Alergias */}
      <FormField
        control={control}
        name="alergias_conhecidas"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <AlertCircle className="size-4" />
              Alergias Conhecidas
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Liste medicamentos, alimentos ou substâncias que causam alergia"
                className="min-h-[80px]"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Medicamentos em Uso */}
      <FormField
        control={control}
        name="medicamentos_uso"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Pill className="size-4" />
              Medicamentos em Uso
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Liste medicamentos que usa regularmente, com dosagem e frequência"
                className="min-h-[80px]"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Observações Gerais */}
      <FormField
        control={control}
        name="observacoes_gerais"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações Gerais</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Outras informações médicas relevantes"
                className="min-h-[80px]"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Resumo das Informações Médicas */}
      {(watchedConvenio || watchedHistorico || watchedAlergias || watchedMedicamentos || watchedObservacoes) && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h4 className="mb-2 flex items-center gap-2 font-medium text-green-900">
            <Stethoscope className="size-4" />
            Resumo das Informações Médicas:
          </h4>
          <div className="space-y-1 text-sm text-green-800">
            {watchedConvenio && (
              <div className="flex items-center gap-2">
                <Heart className="size-3" />
                <span><strong>Convênio:</strong> {watchedConvenio}</span>
              </div>
            )}
            {watchedCarteirinha && (
              <div className="flex items-center gap-2">
                <span><strong>Carteirinha:</strong> {watchedCarteirinha}</span>
              </div>
            )}
            {watchedAlergias && (
              <div className="flex items-center gap-2">
                <AlertCircle className="size-3" />
                <span><strong>Possui alergias:</strong> Sim</span>
              </div>
            )}
            {watchedMedicamentos && (
              <div className="flex items-center gap-2">
                <Pill className="size-3" />
                <span><strong>Medicamentos contínuos:</strong> Sim</span>
              </div>
            )}
            {watchedObservacoes && (
              <div className="flex items-center gap-2">
                <FileText className="size-3" />
                <span><strong>Observações Gerais:</strong> Sim</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alerta sobre campos opcionais */}
      <Alert>
        <AlertCircle className="size-4" />
        <AlertDescription>
          <strong>Campos opcionais:</strong> Todas as informações médicas são opcionais, mas ajudam a oferecer um atendimento mais seguro e personalizado.
        </AlertDescription>
      </Alert>
    </div>
  )
}
