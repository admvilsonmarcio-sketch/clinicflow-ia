'use client'

import React, { useState, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
    'id', 'clinica_id', 'nome_completo', 'email', 'telefone', 'data_nascimento',
    'genero', 'cpf', 'rg', 'orgao_emissor', 'uf_rg', 'estado_civil', 'profissao',
    'telefone_celular', 'telefone_fixo', 'cep', 'logradouro', 'numero', 'complemento',
    'bairro', 'cidade', 'uf', 'nome_emergencia', 'parentesco_emergencia',
    'telefone_emergencia', 'observacoes_emergencia', 'tipo_sanguineo',
    'alergias_conhecidas', 'medicamentos_uso', 'historico_medico_detalhado',
    'observacoes_gerais', 'foto_url', 'qr_code', 'data_ultima_consulta',
    'status_ativo', 'convenio_medico', 'data_rascunho', 'whatsapp_id', 'instagram_id', 'ultimo_contato', 'status'
  ]
  
  // Filtrar apenas campos válidos
  const sanitizedData: any = {}
  for (const field of validFields) {
    if (data.hasOwnProperty(field)) {
      sanitizedData[field] = data[field]
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

export function PatientFormWizard({ 
  initialData, 
  onSuccess, 
  onCancel, 
  mode = 'create' 
}: PatientFormWizardProps) {
  const [currentStep, setCurrentStep] = useState<StepId>('dadosPessoais')
  const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDraftSaving, setIsDraftSaving] = useState(false)
  const [documentRefresh, setDocumentRefresh] = useState(0)
  const { toast } = useToast()
  const supabase = createClient()

  // Configurar formulário com React Hook Form
  const methods = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: initialData || {},
    mode: 'onSubmit'
  })

  const { handleSubmit, watch, formState: { errors, isValid } } = methods
  const watchedValues = watch()

  // Auto-save draft a cada 30 segundos
  useEffect(() => {
    if (mode === 'create') {
      const interval = setInterval(() => {
        saveDraft()
      }, 30000) // 30 segundos

      return () => clearInterval(interval)
    }
  }, [watchedValues, mode])

  // Carregar draft salvo ao inicializar
  useEffect(() => {
    if (mode === 'create' && !initialData) {
      loadDraft()
    }
  }, [mode, initialData])

  const currentStepIndex = STEPS.findIndex(step => step.id === currentStep)
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100

  // Verificar se a etapa atual está válida
  const isCurrentStepValid = () => {
    const step = STEPS[currentStepIndex]
    if (!step.required) return true

    const stepId = step.id as StepId
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

  const saveDraft = async () => {
    console.log('saveDraft called')
    if (isDraftSaving) return
    
    setIsDraftSaving(true)
    try {
      // Preparar dados para salvamento
      const draftData = {
        nome_completo: watchedValues.nome_completo || null,
        cpf: watchedValues.cpf || null,
        data_nascimento: watchedValues.data_nascimento || null,
        genero: watchedValues.genero || null,
        rg: watchedValues.rg || null,
        orgao_emissor: watchedValues.orgao_emissor || null,
        uf_rg: watchedValues.uf_rg || null,
        estado_civil: watchedValues.estado_civil || null,
        profissao: watchedValues.profissao || null,
        telefone_celular: watchedValues.telefone_celular || null,
        telefone_fixo: watchedValues.telefone_fixo || null,
        email: watchedValues.email || null,
        cep: watchedValues.cep || null,
        logradouro: watchedValues.logradouro || null,
        numero: watchedValues.numero || null,
        complemento: watchedValues.complemento || null,
        bairro: watchedValues.bairro || null,
        cidade: watchedValues.cidade || null,
        uf: watchedValues.uf || null,
        nome_emergencia: watchedValues.contato_emergencia_nome || null,
      parentesco_emergencia: watchedValues.contato_emergencia_parentesco || null,
      telefone_emergencia: watchedValues.contato_emergencia_telefone || null,
        convenio_medico: watchedValues.convenio_medico || null,
        numero_carteirinha: watchedValues.numero_carteirinha || null,
        historico_medico_detalhado: watchedValues.historico_medico_detalhado || null,
        alergias_conhecidas: watchedValues.alergias_conhecidas || null,
        medicamentos_uso: watchedValues.medicamentos_uso || null,
        observacoes_gerais: watchedValues.observacoes_gerais || null,
        tipo_sanguineo: watchedValues.tipo_sanguineo || null,
        whatsapp_id: watchedValues.whatsapp_id || null,
        instagram_id: watchedValues.instagram_id || null,
        status: 'rascunho',
        data_rascunho: new Date().toISOString()
      }
      
      // Salvar no localStorage como backup
      localStorage.setItem('patient-form-draft', JSON.stringify(draftData))
      
      // Se há dados suficientes, salvar no banco
      if (watchedValues.nome_completo && watchedValues.cpf) {
        const { error } = await supabase
          .from('pacientes')
          .upsert([draftData], { onConflict: 'cpf' })
        
        if (error) {
           console.error('Erro ao salvar rascunho no banco:', error)
         } else {
           toast({
             title: "Rascunho salvo",
             description: "Seus dados foram salvos automaticamente."
           })
         }
      }
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error)
    } finally {
      setIsDraftSaving(false)
    }
  }

  const loadDraft = async () => {
    try {
      // Primeiro tentar carregar do localStorage
      const localDraftData = localStorage.getItem('patient-form-draft')
      if (localDraftData) {
        const parsed = JSON.parse(localDraftData)
        methods.reset(parsed)
        toast({
          title: "Rascunho carregado",
          description: "Seus dados foram restaurados do armazenamento local."
        })
        return
      }
      
      // Se não há dados locais, tentar carregar rascunhos do banco
      const { data: drafts, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('status', 'rascunho')
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (error) {
        console.error('Erro ao carregar rascunhos do banco:', error)
        return
      }
      
      if (drafts && drafts.length > 0) {
        const draft = drafts[0]
        methods.reset(draft)
        // Removida a segunda mensagem de toast para evitar duplicação
      }
    } catch (error) {
      console.error('Erro ao carregar rascunho:', error)
    }
  }

  const clearDraft = () => {
    localStorage.removeItem('patient-form-draft')
  }

  const onSubmit = async (data: PacienteFormData) => {
    try {
      setIsSubmitting(true)
      
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
        cpf: data.cpf.replace(/\D/g, ''),
        telefone_celular: data.telefone_celular?.replace(/\D/g, ''),
        telefone_fixo: data.telefone_fixo?.replace(/\D/g, ''),
        cep: data.cep?.replace(/\D/g, ''),
        contato_emergencia_telefone: data.contato_emergencia_telefone?.replace(/\D/g, ''),
        updated_at: new Date().toISOString()
      }

      // Sanitizar dados antes de enviar
        const sanitizedData = sanitizeDataForSupabase(pacienteData)

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
        
        result = await supabase
          .from('pacientes')
          .update(sanitizedData)
          .eq('id', initialData!.id)
          .select()
          .single()
      }

      if (result.error) {
        throw result.error
      }

      toast({
        title: mode === 'create' ? "Paciente cadastrado" : "Paciente atualizado",
        description: mode === 'create' 
          ? "Paciente cadastrado com sucesso!" 
          : "Dados do paciente atualizados com sucesso!"
      })

      if (onSuccess) {
        onSuccess(result.data)
      }
    } catch (error: any) {
      console.error('Erro ao salvar paciente:', error)
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
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
              onDocumentUploaded={() => setDocumentRefresh(prev => prev + 1)}
            />
            <DocumentList 
              pacienteId={initialData.id} 
              refreshTrigger={documentRefresh}
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

      {/* Auto-save indicator */}
      {isDraftSaving && (
        <Alert>
          <Save className="h-4 w-4" />
          <AlertDescription>
            Salvando rascunho automaticamente...
          </AlertDescription>
        </Alert>
      )}

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
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={saveDraft}
                  disabled={isDraftSaving}
                  className="border-gray-300 hover:border-green-400 text-green-700 hover:text-green-800"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isDraftSaving ? 'Salvando...' : 'Salvar Rascunho'}
                </Button>
                
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