'use client'

import React, { useState, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, Save, User, Phone, MapPin, Heart, FileText } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'
// Hooks são utilizados nos componentes filhos
import { pacienteSchema, PacienteFormData, PacienteFormSteps } from '@/lib/validations/paciente'
import { createClient } from '@/lib/supabase'

// Função para validar e limpar dados antes de enviar para o Supabase
const sanitizeDataForSupabase = (data: any) => {
  // Lista de campos válidos na tabela pacientes
  const validFields = [
    'id', 'clinica_id', 'nome_completo', 'email', 'data_nascimento',
    'genero', 'cpf', 'rg', 'orgao_emissor', 'uf_rg', 'estado_civil', 'profissao',
    'telefone_celular', 'telefone_fixo', 'cep', 'logradouro', 'numero', 'complemento',
    'bairro', 'cidade', 'uf', 'nome_emergencia', 'parentesco_emergencia',
    'telefone_emergencia', 'observacoes_emergencia', 'tipo_sanguineo',
    'alergias_conhecidas', 'medicamentos_uso', 'historico_medico_detalhado',
    'observacoes_gerais', 'foto_url', 'qr_code', 'data_ultima_consulta',
    'status_ativo', 'convenio_medico', 'numero_carteirinha', 'data_rascunho', 'whatsapp_id', 'instagram_id', 'ultimo_contato', 'status', 'atualizado_em'
  ]
  
  // Campos que devem permanecer como arrays no banco
  const arrayFields = ['alergias_conhecidas', 'medicamentos_uso']
  
  // Filtrar apenas campos válidos
  const sanitizedData: any = {}
  for (const field of validFields) {
    if (data.hasOwnProperty(field)) {
      let value = data[field]
      
      // Para campos que devem ser arrays no banco
      if (arrayFields.includes(field)) {
        if (typeof value === 'string' && value.trim() !== '') {
          // Converter string para array
          value = value.split(',').map(item => item.trim()).filter(item => item !== '')
        } else if (!Array.isArray(value)) {
          // Se não for array nem string válida, definir como array vazio
          value = []
        }
        // Se for array vazio, definir como null para o banco
        if (Array.isArray(value) && value.length === 0) {
          value = null
        }
      } else {
        // Para outros campos, converter arrays para strings se necessário
        if (Array.isArray(value)) {
          value = value.join(', ')
        }
        
        // Converter null/undefined para string vazia em campos opcionais
        if (value === null || value === undefined) {
          value = ''
        }
      }
      
      sanitizedData[field] = value
    }
  }
  
  return sanitizedData
}

// Componentes das etapas
import { DadosPessoaisStep } from './form-steps/dados-pessoais-step'
import { ContatoStep } from './form-steps/contato-step'
import { EnderecoStep } from './form-steps/endereco-step'
import { EmergenciaStep } from './form-steps/emergencia-step'
import { MedicoStep } from './form-steps/medico-step'
import { DocumentUpload } from './document-upload'
import { DocumentList } from './document-list'

interface PatientFormWizardProps {
  initialData?: Partial<PacienteFormData & { id?: string }>
  onSuccess?: (patient: any) => void
  onCancel?: () => void
  mode?: 'create' | 'edit'
}

const STEPS = [
  {
    id: 'dadosPessoais',
    title: 'Dados Pessoais',
    description: 'Informações básicas do paciente',
    icon: User,
    required: true
  },
  {
    id: 'contato',
    title: 'Contato',
    description: 'Telefone, email e redes sociais',
    icon: Phone,
    required: true
  },
  {
    id: 'endereco',
    title: 'Endereço',
    description: 'Localização e dados de endereço',
    icon: MapPin,
    required: true
  },
  {
    id: 'emergencia',
    title: 'Emergência',
    description: 'Contato de emergência',
    icon: Heart,
    required: false
  },
  {
    id: 'medico',
    title: 'Informações Médicas',
    description: 'Histórico, alergias e medicamentos',
    icon: FileText,
    required: false
  },
  {
    id: 'documentos',
    title: 'Documentos',
    description: 'Upload de documentos',
    icon: FileText,
    required: false
  }
] as const

type StepId = typeof STEPS[number]['id']

// Função para mapear dados do banco para o formato do formulário
const mapDatabaseToForm = (data: any) => {
  if (!data) return {}
  
  // Função para formatar CPF
  const formatCPF = (cpf: string) => {
    if (!cpf) return ''
    const numbers = cpf.replace(/\D/g, '')
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  
  // Função para formatar CEP
  const formatCEP = (cep: string) => {
    if (!cep) return ''
    const numbers = cep.replace(/\D/g, '')
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
  }

  // Função para formatar telefone
  const formatTelefone = (telefone: string) => {
    if (!telefone) return ''
    const numbers = telefone.replace(/\D/g, '')
    if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    } else if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return telefone
  }

  return {
    ...data,
    // Formatar CPF, CEP e telefones
    cpf: formatCPF(data.cpf),
    cep: formatCEP(data.cep),
    telefone_celular: formatTelefone(data.telefone_celular),
    telefone_fixo: formatTelefone(data.telefone_fixo),
    // Mapear campos de emergência do banco para o formulário
    contato_emergencia_nome: data.nome_emergencia || '',
    contato_emergencia_parentesco: data.parentesco_emergencia || '',
    contato_emergencia_telefone: formatTelefone(data.telefone_emergencia),
    // Converter campos null para string vazia
    instagram_id: data.instagram_id || '',
    whatsapp_id: data.whatsapp_id || '',
    observacoes_gerais: data.observacoes_gerais || '',
    observacoes_emergencia: data.observacoes_emergencia || '',
    // Converter arrays para string se necessário
    alergias_conhecidas: Array.isArray(data.alergias_conhecidas) ? data.alergias_conhecidas.join(', ') : (data.alergias_conhecidas || ''),
    medicamentos_uso: Array.isArray(data.medicamentos_uso) ? data.medicamentos_uso.join(', ') : (data.medicamentos_uso || '')
  }
}

export function PatientFormWizard({ 
  initialData, 
  onSuccess, 
  onCancel, 
  mode = 'create' 
}: PatientFormWizardProps) {
  const [currentStep, setCurrentStep] = useState<StepId>('dadosPessoais')
  const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [documentsKey, setDocumentsKey] = useState(0)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  // Configurar formulário com React Hook Form
  const methods = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: mapDatabaseToForm(initialData),
    mode: 'onChange'
  })

  const { handleSubmit, watch, reset, trigger, formState: { errors, isValid } } = methods
  const watchedValues = watch()

  // Função para verificar se um step específico está válido
  const isStepValid = (stepId: StepId) => {
    switch (stepId) {
      case 'dadosPessoais':
        return !errors.nome_completo && !errors.cpf && !errors.data_nascimento && !errors.genero &&
               watchedValues.nome_completo && watchedValues.cpf && watchedValues.data_nascimento && watchedValues.genero
      case 'contato':
        return !errors.telefone_celular && !errors.email &&
               watchedValues.telefone_celular && watchedValues.email
      case 'endereco':
        return !errors.cep && !errors.logradouro && !errors.numero && !errors.bairro && !errors.cidade && !errors.uf &&
               watchedValues.cep && watchedValues.logradouro && watchedValues.numero && watchedValues.bairro && watchedValues.cidade && watchedValues.uf
      case 'emergencia':
        return true // Contato de emergência é opcional
      case 'medico':
        return true // Informações médicas são opcionais
      case 'documentos':
        return true // Documentos são opcionais
      default:
        return true
    }
  }

  // Mapear dados iniciais quando initialData mudar
  useEffect(() => {
    if (initialData && mode === 'edit') {
      const mappedData = mapDatabaseToForm(initialData)
      reset(mappedData)
      // Trigger validation após reset para atualizar isValid
      setTimeout(() => trigger(), 100)
    }
  }, [initialData, mode, reset, trigger])

  // No modo de edição, validar automaticamente todos os steps após carregar os dados
  useEffect(() => {
    if (mode === 'edit' && watchedValues && Object.keys(watchedValues).length > 0) {
      const validSteps = new Set<StepId>()
      
      STEPS.forEach(step => {
        if (isStepValid(step.id)) {
          validSteps.add(step.id)
        }
      })
      
      // Só atualizar se houver diferença nos steps válidos
      const currentValidSteps = Array.from(completedSteps).sort()
      const newValidSteps = Array.from(validSteps).sort()
      
      if (JSON.stringify(currentValidSteps) !== JSON.stringify(newValidSteps)) {
        setCompletedSteps(validSteps)
      }
    }
  }, [mode, watchedValues, errors, completedSteps])



  const currentStepIndex = STEPS.findIndex(step => step.id === currentStep)
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100

  // Verificar se a etapa atual está válida
  const isCurrentStepValid = () => {
    const step = STEPS[currentStepIndex]
    if (!step.required) return true
    return isStepValid(step.id)
  }

  const nextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      if (isCurrentStepValid()) {
        setCompletedSteps(prev => new Set([...Array.from(prev), currentStep]))
        setCurrentStep(STEPS[currentStepIndex + 1].id)
      } else {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos obrigatórios antes de continuar.",
          variant: "destructive"
        })
      }
    } else {
      console.log('Already at last step')
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].id)
    }
  }

  const goToStep = (stepId: StepId) => {
    const targetIndex = STEPS.findIndex(step => step.id === stepId)
    const currentIndex = STEPS.findIndex(step => step.id === currentStep)
    
    // Só permite ir para etapas anteriores ou próxima se a atual estiver válida
    if (targetIndex <= currentIndex || isCurrentStepValid()) {
      if (isCurrentStepValid()) {
        setCompletedSteps(prev => new Set([...Array.from(prev), currentStep]))
      }
      setCurrentStep(stepId)
    }
  }



  const onSubmit = async (data: PacienteFormData) => {
    console.log('=== FUNÇÃO ONSUBMIT INICIADA ===', { mode, data })
    
    if (!isValid) {
      console.log('Formulário inválido, não enviando')
      
      // Mostrar notificação de erro com detalhes dos campos inválidos
      const errorMessages = Object.entries(errors).map(([field, error]) => {
        const fieldNames: { [key: string]: string } = {
          'nome_completo': 'Nome Completo',
          'cpf': 'CPF',
          'data_nascimento': 'Data de Nascimento',
          'genero': 'Gênero',
          'telefone_celular': 'Telefone Celular',
          'email': 'Email',
          'cep': 'CEP',
          'logradouro': 'Logradouro',
          'numero': 'Número',
          'bairro': 'Bairro',
          'cidade': 'Cidade',
          'uf': 'UF',
          'contato_emergencia_telefone': 'Telefone de Emergência'
        }
        return `${fieldNames[field] || field}: ${error?.message || 'Campo inválido'}`
      })
      
      toast({
        title: "Campos inválidos",
        description: `Por favor, corrija os seguintes campos:\n${errorMessages.join('\n')}`,
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsSubmitting(true)
      console.log('onSubmit chamado:', { mode, hasInitialData: !!initialData, initialDataId: initialData?.id })
      
      // Verificar se o usuário está autenticado e obter clinica_id
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Usuário não autenticado.",
          variant: "destructive"
        })
        return
      }

      // Buscar o perfil do usuário para obter o clinica_id
      const { data: perfil, error: perfilError } = await supabase
        .from('perfis')
        .select('clinica_id')
        .eq('id', user.id)
        .single()

      if (perfilError || !perfil?.clinica_id) {
        toast({
          title: "Erro de configuração",
          description: "Não foi possível identificar a clínica do usuário.",
          variant: "destructive"
        })
        return
      }
      
      // Verificar se CPF já existe (apenas para novos pacientes)
      if (mode === 'create') {
        const { data: existingPatient } = await supabase
          .from('pacientes')
          .select('id')
          .eq('cpf', data.cpf.replace(/\D/g, ''))
          .single()

        if (existingPatient) {
          toast({
            title: "CPF já cadastrado",
            description: "Já existe um paciente com este CPF.",
            variant: "destructive"
          })
          return
        }
      }

      // Preparar dados para inserção/atualização
      const pacienteData = {
        ...data,
        clinica_id: perfil.clinica_id,
        cpf: data.cpf.replace(/\D/g, ''),
        telefone_celular: data.telefone_celular?.replace(/\D/g, ''),
        telefone_fixo: data.telefone_fixo?.replace(/\D/g, ''),
        cep: data.cep?.replace(/\D/g, ''),
        // Mapear campos de emergência para os nomes corretos no banco
        nome_emergencia: data.contato_emergencia_nome,
        parentesco_emergencia: data.contato_emergencia_parentesco,
        telefone_emergencia: data.contato_emergencia_telefone?.replace(/\D/g, ''),
        observacoes_emergencia: data.observacoes_emergencia,
        status: 'ativo'
      }

      // Sanitizar dados antes de enviar
        const sanitizedData = sanitizeDataForSupabase(pacienteData)
        console.log('Dados originais:', pacienteData)
        console.log('Dados sanitizados:', sanitizedData)

        let result
        if (mode === 'create') {
          // Verificar se já existe um paciente com o mesmo CPF ou email
          const { data: existingPatient, error: checkError } = await supabase
            .from('pacientes')
            .select('id, cpf, email')
            .or(`cpf.eq.${sanitizedData.cpf},email.eq.${sanitizedData.email}`)
            .limit(1)
          
          if (checkError) {
            console.error('Erro ao verificar paciente existente:', checkError)
            toast({
              title: "Erro de validação",
              description: "Não foi possível verificar se o paciente já existe.",
              variant: "destructive",
            })
            return
          }
          
          if (existingPatient && existingPatient.length > 0) {
            const existing = existingPatient[0]
            let duplicateField = ''
            if (existing.cpf === sanitizedData.cpf) duplicateField = 'CPF'
            if (existing.email === sanitizedData.email) duplicateField = 'E-mail'
            
            toast({
              title: "Paciente já cadastrado",
              description: `Já existe um paciente com este ${duplicateField}.`,
              variant: "destructive",
            })
            return
          }
          
          console.log('Tentando criar novo paciente:', { cpf: sanitizedData.cpf, nome: sanitizedData.nome_completo })
          
          result = await supabase
            .from('pacientes')
            .insert([sanitizedData])
            .select()
            .single()
      } else {
        // Verificar se já existe outro paciente com o mesmo CPF ou email
        const { data: existingPatient, error: checkError } = await supabase
          .from('pacientes')
          .select('id, cpf, email')
          .or(`cpf.eq.${sanitizedData.cpf},email.eq.${sanitizedData.email}`)
          .neq('id', initialData!.id)
          .limit(1)
        
        if (checkError) {
          console.error('Erro ao verificar paciente existente:', checkError)
          toast({
            title: "Erro de validação",
            description: "Não foi possível verificar se já existe outro paciente com estes dados.",
            variant: "destructive",
          })
          return
        }
        
        if (existingPatient && existingPatient.length > 0) {
          const existing = existingPatient[0]
          let duplicateField = ''
          if (existing.cpf === sanitizedData.cpf) duplicateField = 'CPF'
          if (existing.email === sanitizedData.email) duplicateField = 'E-mail'
          
          toast({
            title: "Dados já em uso",
            description: `Já existe outro paciente com este ${duplicateField}.`,
            variant: "destructive",
          })
          return
        }
        
        console.log('Tentando atualizar paciente:', { id: initialData!.id, cpf: sanitizedData.cpf, nome: sanitizedData.nome_completo })
        
        result = await supabase
          .from('pacientes')
          .update(sanitizedData)
          .eq('id', initialData!.id)
          .select()
          .single()
      }

      if (result.error) {
        console.error('Erro detalhado na operação:', {
          mode,
          code: result.error.code,
          message: result.error.message,
          details: result.error.details,
          hint: result.error.hint,
          sanitizedData: sanitizedData
        })
        throw result.error
      }

      console.log(`${mode === 'create' ? 'Paciente criado' : 'Paciente atualizado'} com sucesso:`, result.data)
      
      toast({
        title: mode === 'create' ? "Paciente cadastrado com sucesso!" : "Paciente atualizado com sucesso!",
        description: mode === 'create' 
          ? `${result.data.nome_completo} foi adicionado ao sistema.` 
          : `Os dados de ${result.data.nome_completo} foram atualizados.`,
        variant: "default",
        className: "border-green-500 bg-green-50 text-green-900"
      })

      // Redirecionar após sucesso
      if (mode === 'create') {
        setTimeout(() => {
          router.push('/dashboard/patients')
        }, 1500)
      } else {
        setTimeout(() => {
          router.push(`/dashboard/patients/${result.data.id}`)
        }, 1500)
      }

      if (onSuccess) {
        onSuccess(result.data)
      }
    } catch (error: any) {
      console.error('Erro detalhado ao salvar paciente:', {
        mode,
        error: error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      toast({
        title: "Erro ao salvar",
        description: `Falha ao ${mode === 'create' ? 'cadastrar' : 'atualizar'} paciente: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'dadosPessoais':
        return <DadosPessoaisStep />
      case 'contato':
        return <ContatoStep />
      case 'endereco':
        return <EnderecoStep />
      case 'emergencia':
        return <EmergenciaStep />
      case 'medico':
        return <MedicoStep />
      case 'documentos':
        return initialData?.id ? (
          <div className="space-y-6">
            <DocumentUpload 
              pacienteId={initialData.id} 
              onDocumentUploaded={() => setDocumentsKey(prev => prev + 1)}
            />
            <DocumentList 
              pacienteId={initialData.id} 
              refreshTrigger={documentsKey}
            />
          </div>
        ) : (
          <div className="text-center text-muted-foreground">Salve o paciente primeiro para fazer upload de documentos</div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            {mode === 'create' ? 'Cadastrar Novo Paciente' : 'Editar Paciente'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {mode === 'create' 
              ? 'Preencha as informações do paciente seguindo os passos abaixo para um cadastro completo e organizado'
              : 'Atualize as informações do paciente de forma rápida e eficiente'
            }
          </p>
        </div>


      {/* Progress - apenas no modo de criação */}
      {mode === 'create' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progresso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Steps Navigation */}
      <div className="bg-white rounded-xl border-0 p-6 shadow-lg">
        <div className="flex flex-wrap gap-2 justify-center">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isCompleted = completedSteps.has(step.id)
            const isCurrent = currentStep === step.id
            // No modo de edição, todos os passos são acessíveis
            const isAccessible = mode === 'edit' ? true : (index <= currentStepIndex || isCompleted)
            
            return (
              <Button
                key={step.id}
                variant={isCurrent ? "default" : isCompleted ? "secondary" : "outline"}
                size="sm"
                className={`flex items-center gap-2 transition-all duration-200 hover:scale-105 ${!isAccessible ? 'opacity-50 cursor-not-allowed' : ''} ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                onClick={() => isAccessible && goToStep(step.id)}
                disabled={!isAccessible}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{step.title}</span>

                {isCompleted && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </Button>
            )
          })}
        </div>
      </div>



      {/* Form */}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                {React.createElement(STEPS[currentStepIndex].icon, { className: "h-6 w-6 text-blue-600" })}
                {STEPS[currentStepIndex].title}
                {STEPS[currentStepIndex].required && (
                  <Badge variant="secondary" className="text-xs">
                    Obrigatório
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-base">
                {STEPS[currentStepIndex].description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="bg-white rounded-xl border-0 shadow-lg p-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  className="border-gray-300 hover:border-blue-400"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                
                {onCancel && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    onClick={onCancel}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </Button>
                )}
              </div>

              <div className="flex gap-3">
                
                {currentStepIndex < STEPS.length - 1 ? (
                  <Button
                    type="button"
                    size="lg"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      nextStep()
                    }}
                    disabled={!isCurrentStepValid()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  >
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    onClick={(e) => {
                      console.log('=== BOTÃO SUBMIT CLICADO ===', { isSubmitting, mode, isValid, errors })
                      console.log('Valores do formulário:', watchedValues)
                      console.log('Erros detalhados:', errors)
                      console.log('Dados iniciais mapeados:', mapDatabaseToForm(initialData))
                      
                      // Verificar campos obrigatórios específicos
                      const requiredFields = {
                        nome_completo: watchedValues.nome_completo,
                        cpf: watchedValues.cpf,
                        data_nascimento: watchedValues.data_nascimento,
                        genero: watchedValues.genero,
                        telefone_celular: watchedValues.telefone_celular,
                        email: watchedValues.email,
                        cep: watchedValues.cep,
                        logradouro: watchedValues.logradouro,
                        numero: watchedValues.numero,
                        bairro: watchedValues.bairro,
                        cidade: watchedValues.cidade,
                        uf: watchedValues.uf
                      }
                      console.log('Campos obrigatórios:', requiredFields)
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-8"
                  >
                    {isSubmitting ? 'Salvando...' : (mode === 'create' ? 'Cadastrar Paciente' : 'Atualizar Paciente')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
      </div>
    </div>
  )
}