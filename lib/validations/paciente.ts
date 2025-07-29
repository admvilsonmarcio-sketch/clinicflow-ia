import { z } from 'zod'

// Regex para validações brasileiras
const CPF_REGEX = /^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/
const CEP_REGEX = /^[0-9]{5}-[0-9]{3}$/
const TELEFONE_CELULAR_REGEX = /^\([0-9]{2}\) [0-9]{5}-[0-9]{4}$/
const TELEFONE_FIXO_REGEX = /^\([0-9]{2}\) [0-9]{4}-[0-9]{4}$/
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

// Função para validar CPF
function validarCPF(cpf: string): boolean {
  const cpfNumeros = cpf.replace(/[^0-9]/g, '')
  
  if (cpfNumeros.length !== 11) return false
  if (/^(.)\1{10}$/.test(cpfNumeros)) return false
  
  let soma = 0
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfNumeros[i]) * (10 - i)
  }
  
  let resto = soma % 11
  const digito1 = resto < 2 ? 0 : 11 - resto
  
  if (digito1 !== parseInt(cpfNumeros[9])) return false
  
  soma = 0
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfNumeros[i]) * (11 - i)
  }
  
  resto = soma % 11
  const digito2 = resto < 2 ? 0 : 11 - resto
  
  return digito2 === parseInt(cpfNumeros[10])
}

export const pacienteSchema = z.object({
  // DADOS PESSOAIS OBRIGATÓRIOS
  nome_completo: z.string().min(2, 'Nome completo deve ter pelo menos 2 caracteres'),
  cpf: z.string()
    .regex(CPF_REGEX, 'CPF deve estar no formato XXX.XXX.XXX-XX')
    .refine(validarCPF, 'CPF inválido'),
  data_nascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  genero: z.enum(['masculino', 'feminino', 'outro'], {
    required_error: 'Gênero é obrigatório'
  }),
  
  // DOCUMENTOS OPCIONAIS
  rg: z.string().optional().or(z.literal('')),
  orgao_emissor_rg: z.string().optional().or(z.literal('')),
  uf_rg: z.string().length(2, 'UF deve ter 2 caracteres').optional().or(z.literal('')),
  estado_civil: z.enum(['solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel']).optional(),
  profissao: z.string().optional().or(z.literal('')),
  
  // CONTATO OBRIGATÓRIO
  telefone_celular: z.string()
    .regex(TELEFONE_CELULAR_REGEX, 'Telefone celular deve estar no formato (XX) XXXXX-XXXX'),
  telefone_fixo: z.string()
    .regex(TELEFONE_FIXO_REGEX, 'Telefone fixo deve estar no formato (XX) XXXX-XXXX')
    .optional().or(z.literal('')),
  email: z.string()
    .regex(EMAIL_REGEX, 'Email inválido'),
  
  // ENDEREÇO ESTRUTURADO OBRIGATÓRIO
  cep: z.string()
    .regex(CEP_REGEX, 'CEP deve estar no formato XXXXX-XXX'),
  logradouro: z.string().min(1, 'Logradouro é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional().or(z.literal('')),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  uf: z.string().length(2, 'UF deve ter 2 caracteres'),
  
  // CONTATO DE EMERGÊNCIA OPCIONAL
  contato_emergencia_nome: z.string().optional().or(z.literal('')),
  contato_emergencia_parentesco: z.string().optional().or(z.literal('')),
  contato_emergencia_telefone: z.string()
    .regex(TELEFONE_CELULAR_REGEX, 'Telefone de emergência deve estar no formato (XX) XXXXX-XXXX')
    .optional().or(z.literal('')),
  
  // INFORMAÇÕES MÉDICAS OPCIONAIS
  convenio_medico: z.string().optional().or(z.literal('')),
  numero_carteirinha: z.string().optional().or(z.literal('')),
  historico_medico_detalhado: z.string().optional().or(z.literal('')),
  alergias_conhecidas: z.array(z.string()).optional(),
  medicamentos_uso: z.array(z.string()).optional(),
  observacoes_gerais: z.string().optional().or(z.literal('')),
  tipo_sanguineo: z.string().optional().or(z.literal('')),
  
  // INTEGRAÇÕES OPCIONAIS
  whatsapp_id: z.string().optional().or(z.literal('')),
  instagram_id: z.string().optional().or(z.literal(''))
})

export type PacienteFormData = z.infer<typeof pacienteSchema>

// Schema para criação - campos obrigatórios mínimos
export const pacienteCreateSchema = pacienteSchema.pick({
  nome_completo: true,
  cpf: true,
  data_nascimento: true,
  genero: true,
  telefone_celular: true,
  email: true,
  cep: true,
  logradouro: true,
  numero: true,
  bairro: true,
  cidade: true,
  uf: true
})

// Schema para atualização - todos os campos opcionais
export const pacienteUpdateSchema = pacienteSchema.partial()

// Schema para validação de CPF isoladamente
export const cpfSchema = z.string()
  .regex(CPF_REGEX, 'CPF deve estar no formato XXX.XXX.XXX-XX')
  .refine(validarCPF, 'CPF inválido')

// Schema para validação de CEP isoladamente
export const cepSchema = z.string()
  .regex(CEP_REGEX, 'CEP deve estar no formato XXXXX-XXX')

// Tipos para endereço ViaCEP
export interface EnderecoViaCEP {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string // cidade
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

// Tipo para dados do formulário em etapas
export interface PacienteFormSteps {
  dadosPessoais: {
    nome_completo: string
    cpf: string
    data_nascimento: string
    genero: 'masculino' | 'feminino' | 'outro'
    rg?: string
    orgao_emissor_rg?: string
    uf_rg?: string
    estado_civil?: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel'
    profissao?: string
  }
  contato: {
    telefone_celular: string
    telefone_fixo?: string
    email: string
    whatsapp_id?: string
    instagram_id?: string
  }
  endereco: {
    cep: string
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    uf: string
  }
  emergencia: {
    contato_emergencia_nome?: string
    contato_emergencia_parentesco?: string
    contato_emergencia_telefone?: string
  }
  medico: {
    convenio_medico?: string
    numero_carteirinha?: string
    historico_medico?: string
    alergias?: string
    medicamentos_uso_continuo?: string
    observacoes_medicas?: string
  }
}