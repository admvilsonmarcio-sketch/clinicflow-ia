# 🏥 PLANO DE MELHORIAS CRÍTICAS - MediFlow

**Documento:** Plano de Ação para Sistema Médico Profissional  
**Data:** 29/12/2024  
**Versão:** 1.0  
**Prioridade:** CRÍTICA - Sistema para Profissionais de Saúde

---

## 🎯 **OBJETIVO**

Transformar o MediFlow em um sistema robusto, seguro e confiável para profissionais de saúde, seguindo as melhores práticas de desenvolvimento e compliance médico.

---

## ✅ **FASE 1: CORREÇÕES CRÍTICAS (COMPLETA - 29/12/2024)**

### **✅ 1.1 Sincronização Schema vs Types - COMPLETO**
**Prioridade:** 🔴 CRÍTICA  
**Tempo estimado:** 2-3 horas  
**Responsável:** Desenvolvedor Principal  
**Status:** ✅ CONCLUÍDO

#### **Problema Identificado:**
```typescript
// database-schema.sql (REAL)
CREATE TABLE clinicas (
    nome TEXT NOT NULL,
    descricao TEXT,
    endereco TEXT,
    telefone TEXT,
    email TEXT,
    site TEXT
    // NÃO TEM: cnpj, cep, cidade, estado
);

// types/database.ts (INCORRETO)
clinicas: {
    cnpj: string | null,     // ❌ NÃO EXISTE
    cep: string | null,      // ❌ NÃO EXISTE
    cidade: string | null,   // ❌ NÃO EXISTE
    estado: string | null    // ❌ NÃO EXISTE
}
```

#### **Ações Necessárias:**
- [ ] **1.1.1** Auditar TODAS as tabelas do schema
- [ ] **1.1.2** Corrigir types/database.ts para bater 100% com schema
- [ ] **1.1.3** Verificar todos os formulários que usam campos inexistentes
- [ ] **1.1.4** Criar script de validação automática schema vs types
- [ ] **1.1.5** Testar todos os CRUDs após correção

#### **Arquivos Afetados:**
- `types/database.ts`
- `components/settings/clinic-form.tsx`
- `database-schema.sql` (se necessário adicionar campos)

---

### **1.2 Implementação de Validação Zod**
**Prioridade:** 🔴 CRÍTICA  
**Tempo estimado:** 4-6 horas  
**Responsável:** Desenvolvedor Principal

#### **Problema Atual:**
```typescript
// VALIDAÇÃO ATUAL (INSUFICIENTE)
if (!formData.nome_completo.trim()) {
    toast({ title: "Campo obrigatório" })
    return
}
```

#### **Solução Necessária:**
```typescript
// VALIDAÇÃO MÉDICA ROBUSTA
import { z } from 'zod'

const pacienteSchema = z.object({
    nome_completo: z.string()
        .min(2, "Nome deve ter pelo menos 2 caracteres")
        .max(100, "Nome muito longo")
        .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
    
    telefone: z.string()
        .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Formato inválido: (11) 99999-9999"),
    
    email: z.string()
        .email("Email inválido")
        .optional()
        .or(z.literal("")),
    
    data_nascimento: z.string()
        .refine((date) => {
            const nascimento = new Date(date)
            const hoje = new Date()
            const idade = hoje.getFullYear() - nascimento.getFullYear()
            return idade >= 0 && idade <= 120
        }, "Data de nascimento inválida"),
    
    historico_medico: z.string()
        .max(2000, "Histórico muito longo")
        .optional(),
    
    alergias: z.string()
        .max(500, "Lista de alergias muito longa")
        .optional(),
    
    medicamentos: z.string()
        .max(1000, "Lista de medicamentos muito longa")
        .optional()
})
```

#### **Ações Necessárias:**
- [ ] **1.2.1** Instalar e configurar Zod
- [ ] **1.2.2** Criar schemas para todas as entidades médicas
- [ ] **1.2.3** Implementar validação em todos os formulários
- [ ] **1.2.4** Criar mensagens de erro específicas para área médica
- [ ] **1.2.5** Adicionar validação server-side nas API routes

#### **Schemas Necessários:**
- `lib/validations/paciente.ts`
- `lib/validations/clinica.ts`
- `lib/validations/consulta.ts`
- `lib/validations/perfil.ts`

---

### **1.3 Sistema de Logging Médico**
**Prioridade:** 🔴 CRÍTICA  
**Tempo estimado:** 3-4 horas  
**Responsável:** Desenvolvedor Principal

#### **Problema Atual:**
```typescript
// LOGGING GENÉRICO (INADEQUADO PARA SAÚDE)
console.error('Erro ao salvar paciente')
toast({ title: "Erro inesperado" })
```

#### **Solução Necessária:**
```typescript
// LOGGING MÉDICO ESTRUTURADO
interface MedicalLogEntry {
    timestamp: string
    userId: string
    clinicaId: string
    action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
    resource: 'PACIENTE' | 'CONSULTA' | 'PRONTUARIO'
    resourceId: string
    details: Record<string, any>
    ipAddress: string
    userAgent: string
    success: boolean
    errorMessage?: string
}

const logMedicalAction = async (entry: MedicalLogEntry) => {
    // Salvar no banco + arquivo + serviço externo
}
```

#### **Ações Necessárias:**
- [ ] **1.3.1** Criar sistema de logging estruturado
- [ ] **1.3.2** Implementar logs em todas as operações CRUD
- [ ] **1.3.3** Configurar rotação de logs
- [ ] **1.3.4** Criar dashboard de auditoria
- [ ] **1.3.5** Implementar alertas para ações críticas

#### **Arquivos a Criar:**
- `lib/logging/medical-logger.ts`
- `lib/logging/audit-service.ts`
- `app/api/logs/route.ts`
- `components/admin/audit-dashboard.tsx`

---

### **1.4 Tratamento de Erros Médicos**
**Prioridade:** 🔴 CRÍTICA  
**Tempo estimado:** 2-3 horas  
**Responsável:** Desenvolvedor Principal

#### **Problema Atual:**
```typescript
// ERROS GENÉRICOS (PERIGOSO EM SAÚDE)
} catch (err) {
    toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes."
    })
}
```

#### **Solução Necessária:**
```typescript
// TRATAMENTO ESPECÍFICO PARA ÁREA MÉDICA
enum MedicalErrorType {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    PERMISSION_ERROR = 'PERMISSION_ERROR',
    PATIENT_NOT_FOUND = 'PATIENT_NOT_FOUND',
    APPOINTMENT_CONFLICT = 'APPOINTMENT_CONFLICT'
}

class MedicalError extends Error {
    constructor(
        public type: MedicalErrorType,
        public userMessage: string,
        public technicalMessage: string,
        public context?: Record<string, any>
    ) {
        super(technicalMessage)
    }
}

const handleMedicalError = (error: MedicalError) => {
    // Log técnico detalhado
    logMedicalAction({...})
    
    // Mensagem amigável para usuário
    toast({
        variant: "destructive",
        title: getMedicalErrorTitle(error.type),
        description: error.userMessage
    })
}
```

#### **Ações Necessárias:**
- [ ] **1.4.1** Criar classes de erro específicas para área médica
- [ ] **1.4.2** Implementar tratamento categorizado de erros
- [ ] **1.4.3** Criar mensagens amigáveis para profissionais de saúde
- [ ] **1.4.4** Implementar retry automático para operações críticas
- [ ] **1.4.5** Configurar alertas para erros críticos

---

## 🔧 **FASE 2: SEGURANÇA MÉDICA (3-5 dias)**

### **2.1 API Routes com Validação Server-Side**
**Prioridade:** 🟡 ALTA  
**Tempo estimado:** 6-8 horas  
**Responsável:** Desenvolvedor Principal

#### **Problema Atual:**
- Todas as validações estão no frontend
- Dados podem ser manipulados diretamente
- Sem controle de rate limiting

#### **Solução Necessária:**
```typescript
// app/api/pacientes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { pacienteSchema } from '@/lib/validations/paciente'
import { logMedicalAction } from '@/lib/logging/medical-logger'

export async function POST(request: NextRequest) {
    try {
        // 1. Autenticação
        const supabase = createServerClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new MedicalError(...)

        // 2. Validação de dados
        const body = await request.json()
        const validatedData = pacienteSchema.parse(body)

        // 3. Verificação de permissões
        const hasPermission = await checkMedicalPermission(user.id, 'CREATE_PATIENT')
        if (!hasPermission) throw new MedicalError(...)

        // 4. Operação no banco
        const result = await supabase.from('pacientes').insert(validatedData)

        // 5. Log da ação
        await logMedicalAction({
            userId: user.id,
            action: 'CREATE',
            resource: 'PACIENTE',
            success: true
        })

        return NextResponse.json(result)
    } catch (error) {
        return handleMedicalError(error)
    }
}
```

#### **Ações Necessárias:**
- [ ] **2.1.1** Criar API routes para todas as entidades
- [ ] **2.1.2** Implementar validação server-side com Zod
- [ ] **2.1.3** Adicionar rate limiting para operações médicas
- [ ] **2.1.4** Implementar controle de permissões granular
- [ ] **2.1.5** Criar middleware de autenticação médica

#### **API Routes Necessárias:**
- `app/api/pacientes/route.ts`
- `app/api/consultas/route.ts`
- `app/api/clinicas/route.ts`
- `app/api/audit/route.ts`

---

### **2.2 Sistema de Auditoria Completa**
**Prioridade:** 🟡 ALTA  
**Tempo estimado:** 4-6 horas  
**Responsável:** Desenvolvedor Principal

#### **Implementação Necessária:**
```typescript
// lib/audit/medical-audit.ts
interface AuditEvent {
    id: string
    timestamp: Date
    userId: string
    clinicaId: string
    action: AuditAction
    resource: AuditResource
    resourceId: string
    oldValues?: Record<string, any>
    newValues?: Record<string, any>
    ipAddress: string
    userAgent: string
    sessionId: string
}

enum AuditAction {
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    CREATE_PATIENT = 'CREATE_PATIENT',
    UPDATE_PATIENT = 'UPDATE_PATIENT',
    DELETE_PATIENT = 'DELETE_PATIENT',
    VIEW_PATIENT = 'VIEW_PATIENT',
    CREATE_APPOINTMENT = 'CREATE_APPOINTMENT',
    CANCEL_APPOINTMENT = 'CANCEL_APPOINTMENT'
}

const auditMedicalAction = async (event: AuditEvent) => {
    // Salvar no banco de dados
    await supabase.from('logs_atividade').insert({
        usuario_id: event.userId,
        clinica_id: event.clinicaId,
        acao: event.action,
        tipo_recurso: event.resource,
        recurso_id: event.resourceId,
        detalhes: {
            oldValues: event.oldValues,
            newValues: event.newValues,
            ipAddress: event.ipAddress,
            userAgent: event.userAgent,
            sessionId: event.sessionId
        }
    })

    // Backup em arquivo para compliance
    await writeAuditLog(event)
}
```

#### **Ações Necessárias:**
- [ ] **2.2.1** Implementar auditoria em todas as operações CRUD
- [ ] **2.2.2** Criar dashboard de auditoria para administradores
- [ ] **2.2.3** Implementar backup automático de logs
- [ ] **2.2.4** Criar relatórios de compliance LGPD/CFM
- [ ] **2.2.5** Configurar retenção de logs conforme legislação

---

### **2.3 Testes Críticos para Sistema Médico**
**Prioridade:** 🟡 ALTA  
**Tempo estimado:** 8-10 horas  
**Responsável:** Desenvolvedor Principal

#### **Testes Necessários:**
```typescript
// __tests__/medical/patient-crud.test.ts
describe('Patient CRUD Operations', () => {
    test('should validate patient data before saving', async () => {
        const invalidPatient = {
            nome_completo: '', // Invalid: empty name
            telefone: '123', // Invalid: wrong format
            email: 'invalid-email' // Invalid: wrong format
        }

        const result = await createPatient(invalidPatient)
        expect(result.success).toBe(false)
        expect(result.errors).toContain('Nome deve ter pelo menos 2 caracteres')
    })

    test('should log all patient operations for audit', async () => {
        const patient = createValidPatient()
        await createPatient(patient)

        const auditLogs = await getAuditLogs('CREATE_PATIENT')
        expect(auditLogs).toHaveLength(1)
        expect(auditLogs[0].action).toBe('CREATE_PATIENT')
    })

    test('should prevent unauthorized access to patient data', async () => {
        const unauthorizedUser = createUser({ clinica_id: 'different-clinic' })
        const patient = await createPatient()

        const result = await getPatient(patient.id, unauthorizedUser)
        expect(result.success).toBe(false)
        expect(result.error).toBe('PERMISSION_DENIED')
    })
})
```

#### **Ações Necessárias:**
- [ ] **2.3.1** Configurar Jest + Testing Library
- [ ] **2.3.2** Criar testes unitários para validações médicas
- [ ] **2.3.3** Implementar testes de integração para APIs
- [ ] **2.3.4** Criar testes de segurança e permissões
- [ ] **2.3.5** Implementar testes de performance para operações críticas

#### **Suites de Teste:**
- `__tests__/medical/patient-validation.test.ts`
- `__tests__/medical/appointment-scheduling.test.ts`
- `__tests__/security/authentication.test.ts`
- `__tests__/security/authorization.test.ts`
- `__tests__/audit/logging.test.ts`

---

### **2.4 Backup e Recovery para Dados Médicos**
**Prioridade:** 🟡 ALTA  
**Tempo estimado:** 4-6 horas  
**Responsável:** DevOps/Desenvolvedor

#### **Implementação Necessária:**
```typescript
// lib/backup/medical-backup.ts
interface BackupConfig {
    frequency: 'hourly' | 'daily' | 'weekly'
    retention: number // days
    encryption: boolean
    offsite: boolean
}

const medicalBackupConfig: BackupConfig = {
    frequency: 'daily',
    retention: 2555, // 7 years (CFM requirement)
    encryption: true,
    offsite: true
}

const performMedicalBackup = async () => {
    // 1. Backup completo do banco
    const dbBackup = await createDatabaseBackup()
    
    // 2. Backup de arquivos/documentos
    const filesBackup = await createFilesBackup()
    
    // 3. Criptografia
    const encryptedBackup = await encryptBackup([dbBackup, filesBackup])
    
    // 4. Armazenamento offsite
    await uploadToSecureStorage(encryptedBackup)
    
    // 5. Verificação de integridade
    await verifyBackupIntegrity(encryptedBackup)
    
    // 6. Log da operação
    await logBackupOperation('SUCCESS')
}
```

#### **Ações Necessárias:**
- [ ] **2.4.1** Configurar backup automático diário
- [ ] **2.4.2** Implementar criptografia de backups
- [ ] **2.4.3** Configurar armazenamento offsite seguro
- [ ] **2.4.4** Criar procedimentos de recovery
- [ ] **2.4.5** Testar restore completo mensalmente

---

## 📋 **FASE 3: COMPLIANCE MÉDICO (1 semana)**

### **3.1 LGPD Compliance**
**Prioridade:** 🟡 ALTA  
**Tempo estimado:** 6-8 horas  
**Responsável:** Desenvolvedor + Jurídico

#### **Implementações Necessárias:**

##### **Consentimento e Privacidade:**
```typescript
// components/medical/consent-manager.tsx
interface ConsentRecord {
    patientId: string
    consentType: 'DATA_PROCESSING' | 'MEDICAL_RECORDS' | 'COMMUNICATION'
    granted: boolean
    timestamp: Date
    ipAddress: string
    version: string
}

const ConsentManager = ({ patientId }: { patientId: string }) => {
    return (
        <div className="consent-form">
            <h3>Consentimento para Tratamento de Dados</h3>
            <p>De acordo com a LGPD, precisamos do seu consentimento para:</p>
            
            <ConsentCheckbox
                type="DATA_PROCESSING"
                label="Processar seus dados pessoais para atendimento médico"
                required
            />
            
            <ConsentCheckbox
                type="MEDICAL_RECORDS"
                label="Manter histórico médico digital"
                required
            />
            
            <ConsentCheckbox
                type="COMMUNICATION"
                label="Enviar lembretes e comunicações via WhatsApp"
                optional
            />
        </div>
    )
}
```

##### **Direitos do Titular:**
```typescript
// app/api/lgpd/patient-rights/route.ts
export async function POST(request: NextRequest) {
    const { action, patientId } = await request.json()
    
    switch (action) {
        case 'ACCESS': // Art. 15 - Direito de acesso
            return await exportPatientData(patientId)
            
        case 'RECTIFICATION': // Art. 16 - Direito de retificação
            return await updatePatientData(patientId, newData)
            
        case 'DELETION': // Art. 18 - Direito de eliminação
            return await anonymizePatientData(patientId)
            
        case 'PORTABILITY': // Art. 20 - Direito de portabilidade
            return await exportPatientDataPortable(patientId)
    }
}
```

#### **Ações Necessárias:**
- [ ] **3.1.1** Implementar sistema de consentimento
- [ ] **3.1.2** Criar funcionalidades para direitos do titular
- [ ] **3.1.3** Implementar anonimização de dados
- [ ] **3.1.4** Criar relatórios de compliance LGPD
- [ ] **3.1.5** Configurar DPO (Data Protection Officer) dashboard

---

### **3.2 CFM Guidelines Compliance**
**Prioridade:** 🟡 ALTA  
**Tempo estimado:** 4-6 horas  
**Responsável:** Desenvolvedor + Médico Consultor

#### **Implementações Necessárias:**

##### **Prontuário Eletrônico (CFM 1.821/2007):**
```typescript
// components/medical/electronic-record.tsx
interface ProntuarioEletronico {
    id: string
    pacienteId: string
    medicoId: string
    dataConsulta: Date
    anamnese: string
    exameClinico: string
    diagnostico: string
    prescricao: string
    assinaturaDigital: string
    timestampSeguro: string
}

const ProntuarioSeguro = ({ consulta }: { consulta: Consulta }) => {
    return (
        <div className="prontuario-eletronico">
            <header>
                <h2>Prontuário Eletrônico</h2>
                <div className="medical-header">
                    <span>CRM: {medico.crm}</span>
                    <span>Data: {formatDate(consulta.data)}</span>
                    <span>Paciente: {paciente.nome}</span>
                </div>
            </header>
            
            <section className="anamnese">
                <h3>Anamnese</h3>
                <textarea 
                    value={anamnese}
                    onChange={handleAnamneseChange}
                    required
                />
            </section>
            
            <section className="exame-clinico">
                <h3>Exame Clínico</h3>
                <textarea 
                    value={exameClinico}
                    onChange={handleExameChange}
                    required
                />
            </section>
            
            <section className="diagnostico">
                <h3>Diagnóstico</h3>
                <input 
                    value={diagnostico}
                    onChange={handleDiagnosticoChange}
                    required
                />
            </section>
            
            <section className="prescricao">
                <h3>Prescrição</h3>
                <textarea 
                    value={prescricao}
                    onChange={handlePrescricaoChange}
                />
            </section>
            
            <footer className="assinatura-digital">
                <AssinaturaDigital 
                    medicoId={medico.id}
                    prontuarioId={prontuario.id}
                />
            </footer>
        </div>
    )
}
```

##### **Telemedicina (CFM 2.314/2022):**
```typescript
// components/medical/telemedicine-compliance.tsx
interface TeleconsultaRecord {
    id: string
    pacienteId: string
    medicoId: string
    tipo: 'TELECONSULTA' | 'TELEDIAGNOSTICO' | 'TELEMONITORAMENTO'
    consentimentoInformado: boolean
    registroTecnico: string
    qualidadeConexao: 'EXCELENTE' | 'BOA' | 'REGULAR' | 'RUIM'
    intercorrencias: string[]
    assinaturaDigital: string
}
```

#### **Ações Necessárias:**
- [ ] **3.2.1** Implementar prontuário eletrônico conforme CFM
- [ ] **3.2.2** Criar sistema de assinatura digital médica
- [ ] **3.2.3** Implementar compliance para telemedicina
- [ ] **3.2.4** Configurar retenção de dados conforme CFM (20 anos)
- [ ] **3.2.5** Criar relatórios para fiscalização CFM

---

### **3.3 Documentação Médica Completa**
**Prioridade:** 🟡 MÉDIA  
**Tempo estimado:** 4-6 horas  
**Responsável:** Desenvolvedor + Redator Técnico

#### **Documentos Necessários:**
- [ ] **3.3.1** Manual do Usuário para Profissionais de Saúde
- [ ] **3.3.2** Guia de Compliance LGPD/CFM
- [ ] **3.3.3** Procedimentos de Backup e Recovery
- [ ] **3.3.4** Política de Segurança da Informação
- [ ] **3.3.5** Treinamento para Equipe Médica

---

## 📊 **CRONOGRAMA DETALHADO**

### **Semana 1: Correções Críticas**
- **Dia 1-2:** Sincronização Schema + Validação Zod
- **Dia 3:** Sistema de Logging + Tratamento de Erros

### **Semana 2: Segurança Médica**
- **Dia 1-2:** API Routes + Validação Server-Side
- **Dia 3:** Sistema de Auditoria
- **Dia 4-5:** Testes Críticos + Backup/Recovery

### **Semana 3: Compliance**
- **Dia 1-2:** LGPD Compliance
- **Dia 3-4:** CFM Guidelines
- **Dia 5:** Documentação + Treinamento

---

## 🎯 **CRITÉRIOS DE ACEITAÇÃO**

### **Para Cada Fase:**
- [ ] ✅ Todos os testes passando
- [ ] ✅ Code review aprovado
- [ ] ✅ Documentação atualizada
- [ ] ✅ Backup testado e funcionando
- [ ] ✅ Logs de auditoria completos
- [ ] ✅ Performance dentro dos padrões
- [ ] ✅ Segurança validada
- [ ] ✅ Compliance verificado

---

## 🚀 **PRÓXIMOS PASSOS IMEDIATOS**

1. **Revisar e aprovar este plano**
2. **Configurar ambiente de desenvolvimento**
3. **Começar pela Fase 1.1 - Sincronização Schema**
4. **Configurar pipeline de CI/CD com testes**
5. **Estabelecer rotina de code review**

---

**📞 Contato para dúvidas:** Desenvolvedor Principal  
**📅 Revisão do plano:** Semanal  
**🎯 Meta:** Sistema médico 100% confiável e compliant