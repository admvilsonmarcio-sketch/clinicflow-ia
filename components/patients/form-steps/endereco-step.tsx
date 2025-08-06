'use client'

import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, MapPin, Search, Loader2, CheckCircle2 } from 'lucide-react'
import { useViaCEP, useFormatCEP } from '@/hooks/use-viacep'
import { PacienteFormData } from '@/lib/validations/paciente'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const ESTADOS_BRASILEIROS = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
]

export function EnderecoStep() {
  const { control, watch, setValue, formState: { errors } } = useFormContext<PacienteFormData>()
  const { formatCEP } = useFormatCEP()
  const { buscarEndereco, loading, error } = useViaCEP()
  const [cepSearched, setCepSearched] = useState(false)
  const [manualEdit, setManualEdit] = useState(false)
  
  const watchedCep = watch('cep')
  const watchedLogradouro = watch('logradouro')
  const watchedBairro = watch('bairro')
  const watchedCidade = watch('cidade')
  const watchedUf = watch('uf')

  // Buscar endereço automaticamente quando CEP for preenchido
  useEffect(() => {
    const handleCEPSearch = async () => {
      if (watchedCep && watchedCep.length === 9 && !manualEdit) { // CEP formatado completo
        const cepNumbers = watchedCep.replace(/\D/g, '')
        if (cepNumbers.length === 8) {
          try {
            const endereco = await buscarEndereco(cepNumbers)
            if (endereco) {
              setValue('logradouro', endereco.logradouro || '')
              setValue('bairro', endereco.bairro || '')
              setValue('cidade', endereco.localidade || '')
              setValue('uf', endereco.uf || '')
              setCepSearched(true)
            }
          } catch (error) {
            console.error('Erro ao buscar CEP:', error)
          }
        }
      }
    }

    handleCEPSearch()
  }, [watchedCep, buscarEndereco, setValue, manualEdit])

  // Resetar busca quando CEP for alterado
  useEffect(() => {
    if (watchedCep && watchedCep.length < 9) {
      setCepSearched(false)
      setManualEdit(false)
    }
  }, [watchedCep])

  const handleManualEdit = () => {
    setManualEdit(true)
  }

  const handleSearchCEP = async () => {
    if (watchedCep) {
      const cepNumbers = watchedCep.replace(/\D/g, '')
      if (cepNumbers.length === 8) {
        try {
          const endereco = await buscarEndereco(cepNumbers)
          if (endereco) {
            setValue('logradouro', endereco.logradouro || '')
            setValue('bairro', endereco.bairro || '')
            setValue('cidade', endereco.localidade || '')
            setValue('uf', endereco.uf || '')
            setCepSearched(true)
            setManualEdit(false)
          }
        } catch (error) {
          console.error('Erro ao buscar CEP:', error)
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Título da Seção */}
      <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
        <MapPin className="h-5 w-5" />
        Endereço Residencial
      </div>

      {/* CEP com busca automática */}
      <div className="space-y-4">
        <FormField
          control={control}
          name="cep"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                CEP
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      placeholder="00000-000"
                      {...field}
                      value={field.value ? formatCEP(field.value) : ''}
                      onChange={(e) => {
                        const formatted = formatCEP(e.target.value)
                        field.onChange(formatted)
                        setCepSearched(false)
                        setManualEdit(false)
                      }}
                      className={cn(
                        errors.cep ? 'border-red-500' : '',
                        cepSearched && !error ? 'border-green-500' : ''
                      )}
                    />
                    {loading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      </div>
                    )}
                    {cepSearched && !loading && !error && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSearchCEP}
                    disabled={loading || !watchedCep || watchedCep.length < 9}
                    className="shrink-0"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormControl>
              {error && (
                <p className="text-sm text-red-600">
                  {error}
                </p>
              )}
              {cepSearched && !error && (
                <p className="text-sm text-green-600">
                  Endereço encontrado automaticamente
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Alerta sobre preenchimento automático */}
        {cepSearched && !manualEdit && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Endereço preenchido automaticamente. 
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto font-normal underline"
                onClick={handleManualEdit}
              >
                Clique aqui para editar manualmente
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Campos de Endereço */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Logradouro */}
        <FormField
          control={control}
          name="logradouro"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="flex items-center gap-2">
                Logradouro (Rua, Avenida, etc.)
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Rua das Flores, Avenida Paulista"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => {
                    field.onChange(e.target.value)
                    if (!manualEdit && cepSearched) {
                      setManualEdit(true)
                    }
                  }}
                  className={errors.logradouro ? 'border-red-500' : ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Número */}
        <FormField
          control={control}
          name="numero"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Número
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="123"
                  {...field}
                  value={field.value || ''}
                  className={errors.numero ? 'border-red-500' : ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Complemento */}
        <FormField
          control={control}
          name="complemento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Complemento</FormLabel>
              <FormControl>
                <Input
                  placeholder="Apto 101, Bloco A, etc."
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bairro */}
        <FormField
          control={control}
          name="bairro"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Bairro
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Nome do bairro"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => {
                    field.onChange(e.target.value)
                    if (!manualEdit && cepSearched) {
                      setManualEdit(true)
                    }
                  }}
                  className={errors.bairro ? 'border-red-500' : ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cidade */}
        <FormField
          control={control}
          name="cidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Cidade
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Nome da cidade"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => {
                    field.onChange(e.target.value)
                    if (!manualEdit && cepSearched) {
                      setManualEdit(true)
                    }
                  }}
                  className={errors.cidade ? 'border-red-500' : ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Estado */}
        <FormField
          control={control}
          name="uf"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Estado
                <span className="text-red-500">*</span>
              </FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value)
                  if (!manualEdit && cepSearched) {
                    setManualEdit(true)
                  }
                }} 
                value={field.value || ''}
              >
                <FormControl>
                  <SelectTrigger className={errors.uf ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ESTADOS_BRASILEIROS.map((estado) => (
                    <SelectItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Resumo do Endereço */}
      {(watchedLogradouro || watchedBairro || watchedCidade) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Endereço Completo:</h4>
          <p className="text-sm text-blue-800">
            {[watchedLogradouro, watchedBairro, watchedCidade, watchedUf]
              .filter(Boolean)
              .join(', ')}
            {watchedCep && ` - CEP: ${watchedCep}`}
          </p>
        </div>
      )}

      {/* Alerta sobre campos obrigatórios */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Dica:</strong> Digite o CEP para preenchimento automático do endereço.
          <br />
          <span className="text-sm text-muted-foreground mt-1 block">
            Campos obrigatórios: CEP, Logradouro, Número, Bairro, Cidade e Estado.
          </span>
        </AlertDescription>
      </Alert>
    </div>
  )
}