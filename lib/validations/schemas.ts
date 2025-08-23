
import { z } from 'zod'

// Validações brasileiras
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/
const cepRegex = /^\d{5}-\d{3}$/

// Schema base para auditoria
const auditSchema = {
  criado_em: z.string().datetime().optional(),
  atualizado_em: z.string().datetime().optional()
}

// Schema para Pacientes - CORRIGIDO para coincidir com banco.sql
export const patientCreateSchema = z.object({
  nome_completo: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .toLowerCase(),
  
  data_nascimento: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Data de nascimento inválida')
    .transform((date) => new Date(date).toISOString().split('T')[0]),
  
  genero: z.enum(['masculino', 'feminino', 'outro'], {
    errorMap: () => ({ message: 'Gênero inválido' })
  }),
  
  telefone_celular: z.string()
    .regex(phoneRegex, 'Telefone deve estar no formato (XX) XXXXX-XXXX')
    .optional(),
  
  telefone_fixo: z.string()
    .regex(phoneRegex, 'Telefone deve estar no formato (XX) XXXXX-XXXX')
    .optional(),
  
  cpf: z.string()
    .regex(cpfRegex, 'CPF deve estar no formato XXX.XXX.XXX-XX')
    .optional(),
  
  rg: z.string()
    .max(20, 'RG deve ter no máximo 20 caracteres')
    .optional(),
  
  orgao_emissor: z.string()
    .max(20, 'Órgão emissor deve ter no máximo 20 caracteres')
    .optional(),
  
  uf_rg: z.string()
    .length(2, 'UF deve ter 2 caracteres')
    .optional(),
  
  estado_civil: z.string()
    .max(20, 'Estado civil deve ter no máximo 20 caracteres')
    .optional(),
  
  profissao: z.string()
    .max(100, 'Profissão deve ter no máximo 100 caracteres')
    .optional(),
  
  cep: z.string()
    .regex(cepRegex, 'CEP deve estar no formato XXXXX-XXX')
    .optional(),
  
  logradouro: z.string()
    .max(255, 'Logradouro deve ter no máximo 255 caracteres')
    .optional(),
  
  numero: z.string()
    .max(20, 'Número deve ter no máximo 20 caracteres')
    .optional(),
  
  complemento: z.string()
    .max(100, 'Complemento deve ter no máximo 100 caracteres')
    .optional(),
  
  bairro: z.string()
    .max(100, 'Bairro deve ter no máximo 100 caracteres')
    .optional(),
  
  cidade: z.string()
    .max(100, 'Cidade deve ter no máximo 100 caracteres')
    .optional(),
  
  uf: z.string()
    .length(2, 'UF deve ter 2 caracteres')
    .optional(),
  
  nome_emergencia: z.string()
    .max(100, 'Nome de emergência deve ter no máximo 100 caracteres')
    .optional(),
  
  parentesco_emergencia: z.string()
    .max(50, 'Parentesco deve ter no máximo 50 caracteres')
    .optional(),
  
  telefone_emergencia: z.string()
    .regex(phoneRegex, 'Telefone deve estar no formato (XX) XXXXX-XXXX')
    .optional(),
  
  observacoes_emergencia: z.string()
    .max(1000, 'Observações de emergência devem ter no máximo 1000 caracteres')
    .optional(),
  
  tipo_sanguineo: z.string()
    .max(10, 'Tipo sanguíneo deve ter no máximo 10 caracteres')
    .optional(),
  
  alergias_conhecidas: z.array(z.string()).optional(),
  
  medicamentos_uso: z.array(z.string()).optional(),
  
  historico_medico_detalhado: z.string()
    .max(5000, 'Histórico médico deve ter no máximo 5000 caracteres')
    .optional(),
  
  observacoes_gerais: z.string()
    .max(1000, 'Observações gerais devem ter no máximo 1000 caracteres')
    .optional(),
  
  convenio_medico: z.string()
    .max(100, 'Convênio médico deve ter no máximo 100 caracteres')
    .optional(),
  
  numero_carteirinha: z.string()
    .max(50, 'Número da carteirinha deve ter no máximo 50 caracteres')
    .optional(),
  
  clinica_id: z.string().uuid('ID da clínica inválido')
})

export const patientUpdateSchema = patientCreateSchema.partial().extend({
  id: z.string().uuid('ID do paciente inválido')
})

// Schema para Consultas - CORRIGIDO para coincidir com banco.sql
export const consultaCreateSchema = z.object({
  paciente_id: z.string().uuid('ID do paciente inválido'),
  medico_id: z.string().uuid('ID do médico inválido'),
  clinica_id: z.string().uuid('ID da clínica inválido'),
  
  titulo: z.string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  
  descricao: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  
  data_consulta: z.string().datetime('Data da consulta inválida'),
  
  // Status corrigido conforme banco.sql
  status: z.enum(['agendada', 'confirmada', 'realizada', 'cancelada', 'faltou'], {
    errorMap: () => ({ message: 'Status da consulta inválido' })
  }).default('agendada'),
  
  observacoes: z.string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional(),
  
  google_calendar_event_id: z.string().optional(),
  
  lembrete_enviado: z.boolean().default(false),
  
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
  
  descricao: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  
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
  
  site: z.string()
    .url('URL do site inválida')
    .optional(),
  
  logo_url: z.string()
    .url('URL do logo inválida')
    .optional(),
  
  configuracoes: z.record(z.any()).default({})
})

export const clinicaUpdateSchema = clinicaCreateSchema.partial().extend({
  id: z.string().uuid('ID da clínica inválido')
})

// Schema para Perfis (Usuários) - CORRIGIDO para coincidir com banco.sql
export const perfilCreateSchema = z.object({
  nome_completo: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .toLowerCase(),
  
  // Cargos corrigidos conforme banco.sql
  cargo: z.enum(['admin', 'medico', 'assistente', 'recepcionista'], {
    errorMap: () => ({ message: 'Cargo inválido' })
  }),
  
  clinica_id: z.string().uuid('ID da clínica inválido').optional(),
  
  telefone: z.string()
    .regex(phoneRegex, 'Telefone deve estar no formato (XX) XXXXX-XXXX')
    .optional(),
  
  foto_url: z.string()
    .url('URL da foto inválida')
    .optional()
})

export const perfilUpdateSchema = perfilCreateSchema.partial().extend({
  id: z.string().uuid('ID do perfil inválido')
})

// Schema para Conversas
export const conversaCreateSchema = z.object({
  paciente_id: z.string().uuid('ID do paciente inválido'),
  clinica_id: z.string().uuid('ID da clínica inválido'),
  
  // Plataformas corrigidas conforme banco.sql
  plataforma: z.enum(['whatsapp', 'instagram'], {
    errorMap: () => ({ message: 'Plataforma de conversa inválida' })
  }),
  
  id_conversa_plataforma: z.string()
    .min(1, 'ID da conversa na plataforma é obrigatório')
    .max(255, 'ID da conversa deve ter no máximo 255 caracteres'),
  
  atribuida_para: z.string().uuid('ID do profissional inválido').optional(),
  
  // Status corrigido conforme banco.sql
  status: z.enum(['ativa', 'fechada', 'escalada'], {
    errorMap: () => ({ message: 'Status da conversa inválido' })
  }).default('ativa')
})

export const conversaUpdateSchema = conversaCreateSchema.partial().extend({
  id: z.string().uuid('ID da conversa inválido')
})

// Schema para Mensagens - CORRIGIDO para coincidir com banco.sql
export const mensagemCreateSchema = z.object({
  conversa_id: z.string().uuid('ID da conversa inválido'),
  
  // Tipos de remetente corrigidos conforme banco.sql
  tipo_remetente: z.enum(['paciente', 'ia', 'humano', 'sistema'], {
    errorMap: () => ({ message: 'Tipo de remetente inválido' })
  }),
  
  remetente_id: z.string().uuid('ID do remetente inválido').optional(),
  
  conteudo: z.string()
    .min(1, 'Conteúdo da mensagem é obrigatório')
    .max(4000, 'Mensagem deve ter no máximo 4000 caracteres'),
  
  // Tipos de mensagem corrigidos conforme banco.sql
  tipo_mensagem: z.enum(['texto', 'imagem', 'audio', 'documento', 'localizacao'], {
    errorMap: () => ({ message: 'Tipo de mensagem inválido' })
  }).default('texto'),
  
  metadados: z.record(z.any()).default({}),
  
  id_mensagem_plataforma: z.string().optional(),
  
  gerada_por_ia: z.boolean().default(false),
  
  confianca_ia: z.number()
    .min(0, 'Confiança deve ser maior ou igual a 0')
    .max(1, 'Confiança deve ser menor ou igual a 1')
    .optional()
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
