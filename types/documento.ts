export interface DocumentoPaciente {
  id: string
  paciente_id: string
  clinica_id: string
  nome_arquivo: string
  tipo_arquivo: string
  tamanho_arquivo: number
  url_arquivo: string
  categoria: 'exame' | 'receita' | 'atestado' | 'documento_pessoal' | 'outro'
  descricao?: string
  data_documento?: string
  criado_por?: string
  criado_em: string
  atualizado_em: string
  criado_por_perfil?: {
    nome_completo: string
  }
}

export interface NovoDocumentoPaciente {
  paciente_id: string
  nome_arquivo: string
  tipo_arquivo: string
  tamanho_arquivo: number
  url_arquivo: string
  categoria: 'exame' | 'receita' | 'atestado' | 'documento_pessoal' | 'outro'
  descricao?: string
  data_documento?: string
}

export interface UploadDocumentoResponse {
  success: boolean
  documento?: DocumentoPaciente
  error?: string
}

export const CATEGORIAS_DOCUMENTO = [
  { value: 'exame', label: 'Exame' },
  { value: 'receita', label: 'Receita' },
  { value: 'atestado', label: 'Atestado' },
  { value: 'documento_pessoal', label: 'Documento Pessoal' },
  { value: 'outro', label: 'Outro' }
] as const

export const TIPOS_ARQUIVO_ACEITOS = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
] as const

export const TAMANHO_MAXIMO_ARQUIVO = 10 * 1024 * 1024 // 10MB