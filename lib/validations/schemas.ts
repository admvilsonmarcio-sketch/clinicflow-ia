import { z } from 'zod'

// Validações brasileiras
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/
const cepRegex = /^\d{5}-\d{3}$/

// Schema base para auditoria
const auditSchema = {
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
}

// Schema para Pacientes
export const patientCreateSchema = z.object({
  nome_completo: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .toLowerCase(),
  
  telefone: z.string()
    .regex(phoneRegex, 'Telefone deve estar no formato (XX) XXXXX-XXXX')
    .optional(),
  
  cpf: z.string()
    .regex(cpfRegex, 'CPF deve estar no formato XXX.XXX.XXX-XX')
    .optional(),
  
  data_nascimento: z.string()
    .datetime('Data de nascimento inválida')
    .optional(),
  
  endereco: z.string()
    .max(255, 'Endereço deve ter no máximo 255 caracteres')
    .optional(),
  
  cep: z.string()
    .regex(cepRegex, 'CEP deve estar no formato XXXXX-XXX')
    .optional(),
  
  cidade: z.string()
    .max(100, 'Cidade deve ter no máximo 100 caracteres')
    .optional(),
  
  estado: z.string()
    .length(2, 'Estado deve ter 2 caracteres')
    .optional(),
  
  observacoes: z.string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional(),
  
  clinica_id: z.string().uuid('ID da clínica inválido')
})

export const patientUpdateSchema = patientCreateSchema.partial().extend({
  id: z.string().uuid('ID do paciente inválido')
})

// Schema para Consultas
export const consultaCreateSchema = z.object({
  paciente_id: z.string().uuid('ID do paciente inválido'),
  medico_id: z.string().uuid('ID do médico inválido'),
  clinica_id: z.string().uuid('ID da clínica inválido'),
  
  data_consulta: z.string().datetime('Data da consulta inválida'),
  
  tipo: z.enum(['primeira_consulta', 'retorno', 'emergencia', 'teleconsulta'], {
    errorMap: () => ({ message: 'Tipo de consulta inválido' })
  }),
  
  status: z.enum(['agendada', 'confirmada', 'em_andamento', 'concluida', 'cancelada'], {
    errorMap: () => ({ message: 'Status da consulta inválido' })
  }),
  
  observacoes: z.string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional(),
  
  google_calendar_event_id: z.string().optional(),
  
  valor: z.number()
    .positive('Valor deve ser positivo')
    .max(99999.99, 'Valor deve ser menor que R$ 99.999,99')
    .optional(),
  
  duracao_minutos: z.number()
    .int('Duração deve ser um número inteiro')
    .min(15, 'Duração mínima de 15 minutos')
    .max(480, 'Duração máxima de 8 horas')
    .default(60)
})

export const consultaUpdateSchema = consultaCreateSchema.partial().extend({
  id: z.string().uuid('ID da consulta inválido')
})

// Schema para Clínicas
export const clinicaCreateSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  
  endereco: z.string()
    .max(255, 'Endereço deve ter no máximo 255 caracteres')
    .optional(),
  
  telefone: z.string()
    .regex(phoneRegex, 'Telefone deve estar no formato (XX) XXXXX-XXXX')
    .optional(),
  
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .toLowerCase()
    .optional(),
  
  cnpj: z.string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX')
    .optional(),
  
  cep: z.string()
    .regex(cepRegex, 'CEP deve estar no formato XXXXX-XXX')
    .optional(),
  
  cidade: z.string()
    .max(100, 'Cidade deve ter no máximo 100 caracteres')
    .optional(),
  
  estado: z.string()
    .length(2, 'Estado deve ter 2 caracteres')
    .optional(),
  
  ativa: z.boolean().default(true)
})

export const clinicaUpdateSchema = clinicaCreateSchema.partial().extend({
  id: z.string().uuid('ID da clínica inválido')
})

// Schema para Perfis (Usuários)
export const perfilCreateSchema = z.object({
  nome_completo: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .toLowerCase(),
  
  cargo: z.enum(['super_admin', 'admin', 'medico', 'enfermeiro', 'recepcionista', 'assistente'], {
    errorMap: () => ({ message: 'Cargo inválido' })
  }),
  
  clinica_id: z.string().uuid('ID da clínica inválido'),
  
  telefone: z.string()
    .regex(phoneRegex, 'Telefone deve estar no formato (XX) XXXXX-XXXX')
    .optional(),
  
  crm: z.string()
    .max(20, 'CRM deve ter no máximo 20 caracteres')
    .optional(),
  
  especialidade: z.string()
    .max(100, 'Especialidade deve ter no máximo 100 caracteres')
    .optional(),
  
  ativo: z.boolean().default(true)
})

export const perfilUpdateSchema = perfilCreateSchema.partial().extend({
  id: z.string().uuid('ID do perfil inválido')
})

// Schema para Conversas
export const conversaCreateSchema = z.object({
  consulta_id: z.string().uuid('ID da consulta inválido'),
  paciente_id: z.string().uuid('ID do paciente inválido'),
  medico_id: z.string().uuid('ID do médico inválido'),
  clinica_id: z.string().uuid('ID da clínica inválido'),
  
  tipo: z.enum(['whatsapp', 'sms', 'email', 'chat_interno'], {
    errorMap: () => ({ message: 'Tipo de conversa inválido' })
  }),
  
  status: z.enum(['ativa', 'pausada', 'finalizada'], {
    errorMap: () => ({ message: 'Status da conversa inválido' })
  }).default('ativa'),
  
  assunto: z.string()
    .max(200, 'Assunto deve ter no máximo 200 caracteres')
    .optional(),
  
  ia_ativa: z.boolean().default(true),
  
  escalada_para_humano: z.boolean().default(false)
})

export const conversaUpdateSchema = conversaCreateSchema.partial().extend({
  id: z.string().uuid('ID da conversa inválido')
})

// Schema para Mensagens
export const mensagemCreateSchema = z.object({
  conversa_id: z.string().uuid('ID da conversa inválido'),
  
  remetente_tipo: z.enum(['paciente', 'medico', 'ia', 'sistema'], {
    errorMap: () => ({ message: 'Tipo de remetente inválido' })
  }),
  
  remetente_id: z.string().uuid('ID do remetente inválido').optional(),
  
  conteudo: z.string()
    .min(1, 'Conteúdo da mensagem é obrigatório')
    .max(4000, 'Mensagem deve ter no máximo 4000 caracteres'),
  
  tipo_conteudo: z.enum(['texto', 'imagem', 'documento', 'audio', 'video'], {
    errorMap: () => ({ message: 'Tipo de conteúdo inválido' })
  }).default('texto'),
  
  lida: z.boolean().default(false),
  
  metadata: z.record(z.any()).optional()
})

export const mensagemUpdateSchema = mensagemCreateSchema.partial().extend({
  id: z.string().uuid('ID da mensagem inválido')
})

// Schema para Query Parameters
export const queryParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  sort: z.string().max(50).optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  clinica_id: z.string().uuid().optional()
})

// Schema para IDs de URL
export const idParamSchema = z.object({
  id: z.string().uuid('ID inválido')
})

// Tipos TypeScript derivados dos schemas
export type PatientCreate = z.infer<typeof patientCreateSchema>
export type PatientUpdate = z.infer<typeof patientUpdateSchema>
export type ConsultaCreate = z.infer<typeof consultaCreateSchema>
export type ConsultaUpdate = z.infer<typeof consultaUpdateSchema>
export type ClinicaCreate = z.infer<typeof clinicaCreateSchema>
export type ClinicaUpdate = z.infer<typeof clinicaUpdateSchema>
export type PerfilCreate = z.infer<typeof perfilCreateSchema>
export type PerfilUpdate = z.infer<typeof perfilUpdateSchema>
export type ConversaCreate = z.infer<typeof conversaCreateSchema>
export type ConversaUpdate = z.infer<typeof conversaUpdateSchema>
export type MensagemCreate = z.infer<typeof mensagemCreateSchema>
export type MensagemUpdate = z.infer<typeof mensagemUpdateSchema>
export type QueryParams = z.infer<typeof queryParamsSchema>
export type IdParam = z.infer<typeof idParamSchema>