'use client'

import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CalendarIcon, AlertCircle, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useFormatCPF } from '@/hooks/use-viacep'
import { PacienteFormData } from '@/lib/validations/paciente'
import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'

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

const ORGAOS_EMISSORES = [
  'SSP', 'IFP', 'IML', 'PM', 'PC', 'DPT', 'DETRAN', 'CREA', 'CRM', 'OAB', 'COREN', 'CRF', 'OUTROS'
]

export function DadosPessoaisStep() {
  const { control, watch, setValue, formState: { errors } } = useFormContext<PacienteFormData>()
  const { formatCPF } = useFormatCPF()
  const [cpfValidation, setCpfValidation] = useState<{ isValid: boolean; message: string } | null>(null)
  
  const watchedCpf = watch('cpf')
  const watchedDataNascimento = watch('data_nascimento')

  // Validação de CPF em tempo real
  useEffect(() => {
    if (watchedCpf && watchedCpf.length >= 14) { // CPF formatado completo
      const cpfNumbers = watchedCpf.replace(/\D/g, '')
      if (cpfNumbers.length === 11) {
        const isValid = validarCPF(cpfNumbers)
        setCpfValidation({
          isValid,
          message: isValid ? 'CPF válido' : 'CPF inválido'
        })
      }
    } else {
      setCpfValidation(null)
    }
  }, [watchedCpf])

  // Função de validação de CPF
  const validarCPF = (cpf: string): boolean => {
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false
    }

    let soma = 0
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i)
    }
    let resto = 11 - (soma % 11)
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpf.charAt(9))) return false

    soma = 0
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i)
    }
    resto = 11 - (soma % 11)
    if (resto === 10 || resto === 11) resto = 0
    return resto === parseInt(cpf.charAt(10))
  }

  // Calcular idade baseada na data de nascimento
  const calcularIdade = (dataNascimento: string): number => {
    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }
    
    return idade
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Nome Completo */}
      <FormField
        control={control}
        name="nome_completo"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel className="flex items-center gap-2">
              Nome Completo
              <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Digite o nome completo do paciente"
                {...field}
                className={errors.nome_completo ? 'border-red-500' : ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* CPF */}
      <FormField
        control={control}
        name="cpf"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              CPF
              <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  placeholder="000.000.000-00"
                  {...field}
                  value={field.value ? formatCPF(field.value) : ''}
                  onChange={(e) => {
                    const formatted = formatCPF(e.target.value)
                    field.onChange(formatted)
                  }}
                  className={cn(
                    errors.cpf ? 'border-red-500' : '',
                    cpfValidation?.isValid === false ? 'border-red-500' : '',
                    cpfValidation?.isValid === true ? 'border-green-500' : ''
                  )}
                />
                {cpfValidation && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {cpfValidation.isValid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </FormControl>
            {cpfValidation && (
              <p className={cn(
                "text-sm",
                cpfValidation.isValid ? "text-green-600" : "text-red-600"
              )}>
                {cpfValidation.message}
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Data de Nascimento */}
      <FormField
        control={control}
        name="data_nascimento"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Data de Nascimento
              <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                type="date"
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value)}
                min="1900-01-01"
                max={new Date().toISOString().split('T')[0]}
                className="w-full"
              />
            </FormControl>
            {watchedDataNascimento && (
              <p className="text-sm text-muted-foreground">
                Idade: {calcularIdade(watchedDataNascimento)} anos
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Gênero */}
      <FormField
        control={control}
        name="genero"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Gênero
              <span className="text-red-500">*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className={errors.genero ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o gênero" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* RG */}
      <FormField
        control={control}
        name="rg"
        render={({ field }) => (
          <FormItem>
            <FormLabel>RG</FormLabel>
            <FormControl>
              <Input
                placeholder="12.345.678-9"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Órgão Emissor RG */}
      <FormField
        control={control}
        name="orgao_emissor_rg"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Órgão Emissor</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o órgão" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ORGAOS_EMISSORES.map((orgao) => (
                  <SelectItem key={orgao} value={orgao}>
                    {orgao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* UF RG */}
      <FormField
        control={control}
        name="uf_rg"
        render={({ field }) => (
          <FormItem>
            <FormLabel>UF do RG</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger className={errors.uf_rg ? 'border-red-500' : ''}>
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

      {/* Estado Civil */}
      <FormField
        control={control}
        name="estado_civil"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estado Civil</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado civil" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                <SelectItem value="casado">Casado(a)</SelectItem>
                <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                <SelectItem value="uniao_estavel">União Estável</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Profissão */}
      <FormField
        control={control}
        name="profissao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Profissão</FormLabel>
            <FormControl>
              <Input
                placeholder="Digite a profissão"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Alerta sobre campos obrigatórios */}
      <div className="md:col-span-2">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Os campos marcados com <span className="text-red-500 font-semibold">*</span> são obrigatórios para prosseguir.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}