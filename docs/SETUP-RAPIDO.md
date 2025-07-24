# ⚡ SETUP RÁPIDO - Começar Agora

**Documento:** Configuração Imediata para Iniciar Melhorias  
**Tempo:** 15-30 minutos  
**Data:** 29/12/2024  

---

## 🚀 **CONFIGURAÇÃO IMEDIATA**

### **1. Instalar Dependências Necessárias**
```bash
# Validação
npm install zod

# Testes (para futuro)
npm install -D jest @testing-library/react @testing-library/jest-dom

# Utilitários
npm install date-fns uuid
npm install -D @types/uuid
```

### **2. Criar Estrutura de Pastas**
```bash
mkdir -p lib/validations
mkdir -p lib/logging
mkdir -p lib/errors
mkdir -p __tests__/medical
mkdir -p docs/medical
```

### **3. Configurar Scripts no package.json**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "validate-schema": "tsx scripts/validate-schema.ts",
    "backup-db": "tsx scripts/backup-database.ts"
  }
}
```

---

## 🎯 **PRIMEIRA TAREFA: Sincronizar Schema**

### **Passo 1: Backup Atual**
```bash
# Fazer backup do código atual
git add .
git commit -m "backup: antes das melhorias críticas"
git push
```

### **Passo 2: Verificar Schema Real**
1. Abrir Supabase Dashboard
2. Ir em Database > Schema Visualizer
3. Verificar tabela `clinicas` - campos reais
4. Comparar com `types/database.ts`

### **Passo 3: Correção Imediata**
Editar `types/database.ts` - tabela clinicas:

```typescript
// REMOVER ESTES CAMPOS (não existem no banco):
// cnpj: string | null,
// cep: string | null, 
// cidade: string | null,
// estado: string | null,

// MANTER APENAS ESTES (que existem no banco):
clinicas: {
  Row: {
    id: string
    nome: string
    descricao: string | null
    endereco: string | null
    telefone: string | null
    email: string | null
    site: string | null
    logo_url: string | null
    configuracoes: any
    criado_em: string
    atualizado_em: string
  }
  // Insert e Update iguais, mas com campos opcionais
}
```

### **Passo 4: Testar Imediatamente**
```bash
npm run dev
```

1. Ir para `/dashboard/settings`
2. Aba "Clínica"
3. Tentar salvar dados
4. Verificar se não há erros no console

---

## 🔧 **SEGUNDA TAREFA: Validação Básica**

### **Criar arquivo: `lib/validations/paciente.ts`**
```typescript
import { z } from 'zod'

export const pacienteSchema = z.object({
  nome_completo: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  
  telefone: z.string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Formato: (11) 99999-9999"),
  
  email: z.string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  
  data_nascimento: z.string().optional(),
  genero: z.enum(['masculino', 'feminino', 'outro']).optional(),
  endereco: z.string().max(200).optional(),
  contato_emergencia: z.string().max(100).optional(),
  telefone_emergencia: z.string().optional(),
  historico_medico: z.string().max(2000).optional(),
  alergias: z.string().max(500).optional(),
  medicamentos: z.string().max(1000).optional(),
  observacoes: z.string().max(1000).optional()
})

export type PacienteFormData = z.infer<typeof pacienteSchema>
```

### **Implementar no formulário de paciente:**
Editar `components/patients/patient-form.tsx`:

```typescript
// Adicionar no topo
import { z } from 'zod'
import { pacienteSchema } from '@/lib/validations/paciente'

// No handleSubmit, ANTES de salvar:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    // NOVA VALIDAÇÃO
    const validatedData = pacienteSchema.parse(formData)
    
    // Validações básicas antigas (manter por enquanto)
    if (!formData.nome_completo.trim()) {
      toast({
        variant: "warning",
        title: "Campo obrigatório",
        description: "Nome completo é obrigatório.",
      })
      return
    }

    // ... resto do código continua igual ...
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Mostrar primeiro erro de validação
      const firstError = error.errors[0]
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: firstError.message
      })
      return
    }
    
    // ... resto do tratamento de erro ...
  } finally {
    setLoading(false)
  }
}
```

---

## 🧪 **TERCEIRA TAREFA: Teste Rápido**

### **Testar Validação:**
1. Ir para `/dashboard/patients/new`
2. Tentar salvar com nome vazio → deve mostrar erro Zod
3. Tentar salvar com telefone inválido → deve mostrar erro Zod
4. Salvar com dados válidos → deve funcionar normal

### **Se der erro:**
- Verificar console do navegador
- Verificar terminal do Next.js
- Verificar se Zod foi instalado: `npm list zod`

---

## 📊 **QUARTA TAREFA: Logging Básico**

### **Criar arquivo: `lib/logging/simple-logger.ts`**
```typescript
interface LogEntry {
  timestamp: Date
  action: string
  userId?: string
  details: any
}

export const simpleLogger = {
  log: (action: string, details: any, userId?: string) => {
    const entry: LogEntry = {
      timestamp: new Date(),
      action,
      userId,
      details
    }
    
    // Por enquanto, só console log
    console.log('🏥 Medical Action:', entry)
    
    // TODO: Salvar no banco depois
  },
  
  logPatientAction: (action: string, patientId: string, userId?: string) => {
    simpleLogger.log(`PATIENT_${action}`, { patientId }, userId)
  }
}
```

### **Implementar no formulário:**
```typescript
// Adicionar no topo
import { simpleLogger } from '@/lib/logging/simple-logger'

// No handleSubmit, APÓS salvar com sucesso:
if (isEditing && patient?.id) {
  result = await supabase.from('pacientes').update(patientData)
  
  // NOVO LOG
  simpleLogger.logPatientAction('UPDATE', patient.id, user.id)
} else {
  result = await supabase.from('pacientes').insert(patientData)
  
  // NOVO LOG  
  simpleLogger.logPatientAction('CREATE', result.data.id, user.id)
}
```

---

## ✅ **CHECKLIST SETUP RÁPIDO**

### **Após 30 minutos, você deve ter:**
- [ ] ✅ Dependências instaladas
- [ ] ✅ Schema sincronizado (sem erros de campos inexistentes)
- [ ] ✅ Validação Zod básica funcionando
- [ ] ✅ Logging simples implementado
- [ ] ✅ Formulário de paciente testado
- [ ] ✅ Formulário de clínica testado
- [ ] ✅ Sem erros no console

### **Próximos Passos:**
1. **Se tudo funcionou:** Prosseguir com [CHECKLIST-EXECUCAO.md](./CHECKLIST-EXECUCAO.md)
2. **Se houve problemas:** Revisar cada passo e corrigir antes de continuar

---

## 🆘 **TROUBLESHOOTING RÁPIDO**

### **Erro: "Cannot find module 'zod'"**
```bash
npm install zod
# ou
yarn add zod
```

### **Erro: "Property 'cnpj' does not exist"**
- Verificar se `types/database.ts` foi corrigido
- Reiniciar servidor: `Ctrl+C` e `npm run dev`

### **Erro: "ZodError is not defined"**
```typescript
import { z } from 'zod'
// Usar: error instanceof z.ZodError
```

### **Formulário não salva:**
- Verificar console do navegador (F12)
- Verificar se validação Zod está passando
- Verificar se campos do formulário batem com schema

---

**🎯 Meta:** Em 30 minutos, ter um sistema mais robusto e começar o desenvolvimento profissional!**