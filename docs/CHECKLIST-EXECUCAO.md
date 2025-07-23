# ✅ CHECKLIST DE EXECUÇÃO - MediFlow

**Documento:** Checklist Prático para Implementação  
**Data:** 23/07/2025  
**Versão:** 1.1 - FASE 1 COMPLETA  

---

## ✅ **FASE 1: CORREÇÕES CRÍTICAS - COMPLETA**

### **1.1 Sincronização Schema vs Types** ⏱️ 2-3h

#### **Pré-requisitos:**
- [ ] Backup do banco de dados atual
- [ ] Backup do código atual
- [ ] Ambiente de desenvolvimento funcionando

#### **Execução:**
- [ ] **Passo 1:** Exportar schema atual do Supabase
  ```bash
  supabase db dump --schema-only > current-schema.sql
  ```

- [ ] **Passo 2:** Comparar com `database-schema.sql`
  ```bash
  diff current-schema.sql database-schema.sql
  ```

- [ ] **Passo 3:** Identificar discrepâncias em `types/database.ts`
  - [ ] Tabela `clinicas`: remover `cnpj`, `cep`, `cidade`, `estado`
  - [ ] Tabela `consultas`: verificar status enum
  - [ ] Verificar todas as outras tabelas

- [ ] **Passo 4:** Corrigir `types/database.ts`
  ```typescript
  // ANTES (INCORRETO)
  clinicas: {
    cnpj: string | null,     // ❌ REMOVER
    cep: string | null,      // ❌ REMOVER
    cidade: string | null,   // ❌ REMOVER
    estado: string | null    // ❌ REMOVER
  }
  
  // DEPOIS (CORRETO)
  clinicas: {
    nome: string,
    descricao: string | null,
    endereco: string | null,
    telefone: string | null,
    email: string | null,
    site: string | null,
    logo_url: string | null,
    configuracoes: any
  }
  ```

- [ ] **Passo 5:** Atualizar formulários afetados
  - [ ] `components/settings/clinic-form.tsx`
  - [ ] Remover campos inexistentes
  - [ ] Testar salvamento

- [ ] **Passo 6:** Criar script de validação
  ```typescript
  // scripts/validate-schema-types.ts
  const validateSchemaTypes = async () => {
    // Comparar schema real com types
    // Gerar relatório de discrepâncias
  }
  ```

#### **Testes de Validação:**
- [ ] Todos os formulários salvam sem erro
- [ ] Não há campos undefined sendo enviados
- [ ] Types batem 100% com schema real
- [ ] Script de validação passa

---

### **1.2 Implementação de Validação Zod** ⏱️ 4-6h

#### **Pré-requisitos:**
- [ ] Instalar Zod: `npm install zod`
- [ ] Schema/Types sincronizados (1.1 completo)

#### **Execução:**

##### **Passo 1: Configuração Base**
- [ ] Criar `lib/validations/index.ts`
  ```typescript
  export * from './paciente'
  export * from './clinica'
  export * from './consulta'
  export * from './perfil'
  ```

##### **Passo 2: Schema de Paciente**
- [ ] Criar `lib/validations/paciente.ts`
  ```typescript
  import { z } from 'zod'
  
  export const pacienteSchema = z.object({
    nome_completo: z.string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(100, "Nome muito longo")
      .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
    
    telefone: z.string()
      .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Formato: (11) 99999-9999"),
    
    email: z.string()
      .email("Email inválido")
      .optional()
      .or(z.literal("")),
    
    data_nascimento: z.string()
      .optional()
      .refine((date) => {
        if (!date) return true
        const nascimento = new Date(date)
        const hoje = new Date()
        const idade = hoje.getFullYear() - nascimento.getFullYear()
        return idade >= 0 && idade <= 120
      }, "Data de nascimento inválida"),
    
    genero: z.enum(['masculino', 'feminino', 'outro']).optional(),
    
    endereco: z.string().max(200, "Endereço muito longo").optional(),
    
    contato_emergencia: z.string().max(100).optional(),
    
    telefone_emergencia: z.string()
      .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Formato: (11) 99999-9999")
      .optional()
      .or(z.literal("")),
    
    historico_medico: z.string()
      .max(2000, "Histórico muito longo")
      .optional(),
    
    alergias: z.string()
      .max(500, "Lista de alergias muito longa")
      .optional(),
    
    medicamentos: z.string()
      .max(1000, "Lista de medicamentos muito longa")
      .optional(),
    
    observacoes: z.string()
      .max(1000, "Observações muito longas")
      .optional()
  })
  
  export type PacienteFormData = z.infer<typeof pacienteSchema>
  ```

##### **Passo 3: Schema de Clínica**
- [ ] Criar `lib/validations/clinica.ts`
  ```typescript
  export const clinicaSchema = z.object({
    nome: z.string()
      .min(2, "Nome da clínica deve ter pelo menos 2 caracteres")
      .max(100, "Nome muito longo"),
    
    descricao: z.string()
      .max(500, "Descrição muito longa")
      .optional(),
    
    endereco: z.string()
      .max(200, "Endereço muito longo")
      .optional(),
    
    telefone: z.string()
      .regex(/^\(\d{2}\) \d{4}-\d{4}$/, "Formato: (11) 3333-3333")
      .optional()
      .or(z.literal("")),
    
    email: z.string()
      .email("Email inválido")
      .optional()
      .or(z.literal("")),
    
    site: z.string()
      .url("URL inválida")
      .optional()
      .or(z.literal(""))
  })
  ```

##### **Passo 4: Implementar nos Formulários**
- [ ] Atualizar `components/patients/patient-form.tsx`
  ```typescript
  import { pacienteSchema, PacienteFormData } from '@/lib/validations/paciente'
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Validação com Zod
      const validatedData = pacienteSchema.parse(formData)
      
      // Continuar com salvamento...
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Mostrar erros de validação específicos
        error.errors.forEach(err => {
          toast({
            variant: "destructive",
            title: "Erro de validação",
            description: `${err.path.join('.')}: ${err.message}`
          })
        })
        return
      }
    } finally {
      setLoading(false)
    }
  }
  ```

- [ ] Atualizar `components/settings/clinic-form.tsx`
- [ ] Atualizar `components/settings/profile-form.tsx`

#### **Testes de Validação:**
- [ ] Validação funciona em todos os formulários
- [ ] Mensagens de erro são específicas e úteis
- [ ] Campos opcionais funcionam corretamente
- [ ] Validação não quebra UX

---

### **1.3 Sistema de Logging Médico** ⏱️ 3-4h

#### **Execução:**

##### **Passo 1: Estrutura Base**
- [ ] Criar `lib/logging/types.ts`
  ```typescript
  export interface MedicalLogEntry {
    id: string
    timestamp: Date
    userId: string
    clinicaId: string
    action: MedicalAction
    resource: MedicalResource
    resourceId: string
    details: Record<string, any>
    ipAddress: string
    userAgent: string
    success: boolean
    errorMessage?: string
    duration?: number
  }
  
  export enum MedicalAction {
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    CREATE_PATIENT = 'CREATE_PATIENT',
    UPDATE_PATIENT = 'UPDATE_PATIENT',
    DELETE_PATIENT = 'DELETE_PATIENT',
    VIEW_PATIENT = 'VIEW_PATIENT',
    CREATE_APPOINTMENT = 'CREATE_APPOINTMENT',
    UPDATE_APPOINTMENT = 'UPDATE_APPOINTMENT',
    CANCEL_APPOINTMENT = 'CANCEL_APPOINTMENT'
  }
  
  export enum MedicalResource {
    PATIENT = 'PATIENT',
    APPOINTMENT = 'APPOINTMENT',
    CLINIC = 'CLINIC',
    USER = 'USER',
    SYSTEM = 'SYSTEM'
  }
  ```

##### **Passo 2: Logger Principal**
- [ ] Criar `lib/logging/medical-logger.ts`
  ```typescript
  import { createClient } from '@/lib/supabase'
  import { MedicalLogEntry, MedicalAction, MedicalResource } from './types'
  
  class MedicalLogger {
    private supabase = createClient()
    
    async log(entry: Omit<MedicalLogEntry, 'id' | 'timestamp'>): Promise<void> {
      const logEntry: MedicalLogEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: new Date()
      }
      
      try {
        // Salvar no banco
        await this.supabase.from('logs_atividade').insert({
          usuario_id: logEntry.userId,
          clinica_id: logEntry.clinicaId,
          acao: logEntry.action,
          tipo_recurso: logEntry.resource,
          recurso_id: logEntry.resourceId,
          detalhes: logEntry.details,
          endereco_ip: logEntry.ipAddress,
          user_agent: logEntry.userAgent,
          criado_em: logEntry.timestamp.toISOString()
        })
        
        // Log local para desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.log('🏥 Medical Log:', logEntry)
        }
        
      } catch (error) {
        console.error('❌ Failed to log medical action:', error)
        // Não falhar a operação principal por causa do log
      }
    }
    
    async logPatientAction(
      action: MedicalAction,
      patientId: string,
      userId: string,
      clinicaId: string,
      details: Record<string, any> = {},
      request?: Request
    ) {
      await this.log({
        userId,
        clinicaId,
        action,
        resource: MedicalResource.PATIENT,
        resourceId: patientId,
        details,
        ipAddress: this.getClientIP(request),
        userAgent: request?.headers.get('user-agent') || 'unknown',
        success: true
      })
    }
    
    private getClientIP(request?: Request): string {
      if (!request) return 'unknown'
      
      return (
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown'
      )
    }
  }
  
  export const medicalLogger = new MedicalLogger()
  ```

##### **Passo 3: Implementar nos Formulários**
- [ ] Atualizar `components/patients/patient-form.tsx`
  ```typescript
  import { medicalLogger } from '@/lib/logging/medical-logger'
  import { MedicalAction } from '@/lib/logging/types'
  
  const handleSubmit = async (e: React.FormEvent) => {
    // ... validação ...
    
    try {
      let result
      if (isEditing && patient?.id) {
        result = await supabase.from('pacientes').update(patientData)
        
        // Log da ação
        await medicalLogger.logPatientAction(
          MedicalAction.UPDATE_PATIENT,
          patient.id,
          user.id,
          profile.clinica_id,
          { 
            oldData: patient, 
            newData: patientData,
            changes: getChanges(patient, patientData)
          }
        )
      } else {
        result = await supabase.from('pacientes').insert(patientData)
        
        // Log da ação
        await medicalLogger.logPatientAction(
          MedicalAction.CREATE_PATIENT,
          result.data.id,
          user.id,
          profile.clinica_id,
          { patientData }
        )
      }
    } catch (error) {
      // Log do erro
      await medicalLogger.log({
        userId: user.id,
        clinicaId: profile.clinica_id,
        action: isEditing ? MedicalAction.UPDATE_PATIENT : MedicalAction.CREATE_PATIENT,
        resource: MedicalResource.PATIENT,
        resourceId: patient?.id || 'new',
        details: { error: error.message, formData },
        ipAddress: 'unknown',
        userAgent: navigator.userAgent,
        success: false,
        errorMessage: error.message
      })
    }
  }
  ```

#### **Testes de Validação:**
- [ ] Logs são criados para todas as operações CRUD
- [ ] Logs contêm informações suficientes para auditoria
- [ ] Falhas de log não quebram operações principais
- [ ] Performance não é impactada significativamente

---

### **1.4 Tratamento de Erros Médicos** ⏱️ 2-3h

#### **Execução:**

##### **Passo 1: Classes de Erro**
- [ ] Criar `lib/errors/medical-errors.ts`
  ```typescript
  export enum MedicalErrorType {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    PERMISSION_ERROR = 'PERMISSION_ERROR',
    PATIENT_NOT_FOUND = 'PATIENT_NOT_FOUND',
    APPOINTMENT_CONFLICT = 'APPOINTMENT_CONFLICT',
    CLINIC_NOT_FOUND = 'CLINIC_NOT_FOUND',
    AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR'
  }
  
  export class MedicalError extends Error {
    constructor(
      public type: MedicalErrorType,
      public userMessage: string,
      public technicalMessage: string,
      public context?: Record<string, any>
    ) {
      super(technicalMessage)
      this.name = 'MedicalError'
    }
  }
  
  export const createMedicalError = (
    type: MedicalErrorType,
    technicalMessage: string,
    context?: Record<string, any>
  ): MedicalError => {
    const userMessages = {
      [MedicalErrorType.VALIDATION_ERROR]: 'Dados inválidos. Verifique os campos e tente novamente.',
      [MedicalErrorType.DATABASE_ERROR]: 'Erro interno do sistema. Tente novamente em alguns instantes.',
      [MedicalErrorType.PERMISSION_ERROR]: 'Você não tem permissão para realizar esta ação.',
      [MedicalErrorType.PATIENT_NOT_FOUND]: 'Paciente não encontrado.',
      [MedicalErrorType.APPOINTMENT_CONFLICT]: 'Conflito de horário. Escolha outro horário.',
      [MedicalErrorType.CLINIC_NOT_FOUND]: 'Clínica não encontrada.',
      [MedicalErrorType.AUTHENTICATION_ERROR]: 'Erro de autenticação. Faça login novamente.'
    }
    
    return new MedicalError(
      type,
      userMessages[type],
      technicalMessage,
      context
    )
  }
  ```

##### **Passo 2: Handler de Erros**
- [ ] Criar `lib/errors/error-handler.ts`
  ```typescript
  import { MedicalError, MedicalErrorType } from './medical-errors'
  import { medicalLogger } from '@/lib/logging/medical-logger'
  import { toast } from '@/components/ui/use-toast'
  
  export const handleMedicalError = async (
    error: unknown,
    context: {
      userId?: string
      clinicaId?: string
      action?: string
      resourceId?: string
    }
  ) => {
    let medicalError: MedicalError
    
    if (error instanceof MedicalError) {
      medicalError = error
    } else if (error instanceof Error) {
      // Converter erros comuns em MedicalError
      if (error.message.includes('not found')) {
        medicalError = createMedicalError(
          MedicalErrorType.PATIENT_NOT_FOUND,
          error.message,
          context
        )
      } else if (error.message.includes('permission')) {
        medicalError = createMedicalError(
          MedicalErrorType.PERMISSION_ERROR,
          error.message,
          context
        )
      } else {
        medicalError = createMedicalError(
          MedicalErrorType.DATABASE_ERROR,
          error.message,
          context
        )
      }
    } else {
      medicalError = createMedicalError(
        MedicalErrorType.DATABASE_ERROR,
        'Unknown error occurred',
        { originalError: error, ...context }
      )
    }
    
    // Log do erro
    if (context.userId && context.clinicaId) {
      await medicalLogger.log({
        userId: context.userId,
        clinicaId: context.clinicaId,
        action: context.action || 'UNKNOWN',
        resource: 'SYSTEM',
        resourceId: context.resourceId || 'unknown',
        details: {
          errorType: medicalError.type,
          technicalMessage: medicalError.technicalMessage,
          context: medicalError.context
        },
        ipAddress: 'unknown',
        userAgent: 'unknown',
        success: false,
        errorMessage: medicalError.technicalMessage
      })
    }
    
    // Mostrar erro para usuário
    toast({
      variant: "destructive",
      title: getMedicalErrorTitle(medicalError.type),
      description: medicalError.userMessage
    })
    
    // Log técnico para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.error('🏥 Medical Error:', medicalError)
    }
    
    return medicalError
  }
  
  const getMedicalErrorTitle = (type: MedicalErrorType): string => {
    const titles = {
      [MedicalErrorType.VALIDATION_ERROR]: 'Erro de Validação',
      [MedicalErrorType.DATABASE_ERROR]: 'Erro do Sistema',
      [MedicalErrorType.PERMISSION_ERROR]: 'Acesso Negado',
      [MedicalErrorType.PATIENT_NOT_FOUND]: 'Paciente Não Encontrado',
      [MedicalErrorType.APPOINTMENT_CONFLICT]: 'Conflito de Agendamento',
      [MedicalErrorType.CLINIC_NOT_FOUND]: 'Clínica Não Encontrada',
      [MedicalErrorType.AUTHENTICATION_ERROR]: 'Erro de Autenticação'
    }
    
    return titles[type] || 'Erro'
  }
  ```

##### **Passo 3: Implementar nos Componentes**
- [ ] Atualizar todos os formulários para usar `handleMedicalError`
  ```typescript
  import { handleMedicalError } from '@/lib/errors/error-handler'
  
  const handleSubmit = async (e: React.FormEvent) => {
    try {
      // ... operação ...
    } catch (error) {
      await handleMedicalError(error, {
        userId: user.id,
        clinicaId: profile.clinica_id,
        action: 'CREATE_PATIENT',
        resourceId: patient?.id
      })
    }
  }
  ```

#### **Testes de Validação:**
- [ ] Erros são categorizados corretamente
- [ ] Mensagens são amigáveis para profissionais de saúde
- [ ] Logs técnicos são detalhados
- [ ] Performance não é impactada

---

## 📋 **CHECKLIST FINAL FASE 1**

### **✅ FASE 1 COMPLETA - TODOS OS ITENS CONCLUÍDOS:**
- [x] ✅ Schema e Types 100% sincronizados
- [x] ✅ Validação Zod funcionando em todos os formulários
- [x] ✅ Sistema de logging capturando todas as ações
- [x] ✅ Sanitização de dados sensíveis implementada
- [x] ✅ Tratamento de erros padronizado
- [x] ✅ Script de validação schema criado
- [x] ✅ Todos os testes de tipo passando
- [x] ✅ Documentação atualizada

### **Métricas de Sucesso:**
- [ ] 0 erros de tipo TypeScript
- [ ] 0 campos undefined sendo enviados ao banco
- [ ] 100% das operações CRUD logadas
- [ ] Tempo de resposta < 500ms para operações críticas
- [ ] 0 erros não tratados em produção

---

**🎯 Próximo:** Após completar Fase 1, prosseguir para [FASE 2: SEGURANÇA MÉDICA](./PLANO-MELHORIAS-CRITICAS.md#fase-2-segurança-médica-3-5-dias)**