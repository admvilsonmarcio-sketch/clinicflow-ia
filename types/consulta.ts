
// Tipos compartilhados para consultas - CORRIGIDOS para coincidir com banco.sql

export interface Paciente {
  id: string
  nome_completo: string
  email?: string
  telefone_celular?: string
}

export interface Medico {
  id: string
  nome_completo: string
  email?: string
  cargo: string
  clinica_id?: string
  telefone?: string
  foto_url?: string
}

export interface Clinica {
  id: string
  nome: string
}

// Status possíveis para consultas - CORRIGIDO conforme banco.sql
export type StatusConsulta = 'agendada' | 'confirmada' | 'realizada' | 'cancelada' | 'faltou'

// Interface base para consulta - CORRIGIDA conforme banco.sql
export interface ConsultaBase {
  id: string
  titulo: string
  descricao?: string
  data_consulta: string
  duracao_minutos: number
  status: StatusConsulta
  observacoes?: string
  google_calendar_event_id?: string
  lembrete_enviado: boolean
  paciente_id: string
  medico_id: string
  clinica_id?: string
}

// Interface para consulta com relacionamentos populados (estrutura do Supabase)
export interface Consulta extends ConsultaBase {
  pacientes: { id: string; nome_completo: string; email: string; telefone_celular: string }[]
  perfis: { id: string; nome_completo: string; cargo: string }[]
  clinicas?: { id: string; nome: string }[]
}

// Tipo para consultas com dados detalhados (usado na página de agendamentos)
export interface ConsultaDetalhada extends Consulta {
  pacientes: { id: string; nome_completo: string; email: string; telefone_celular: string }[]
  perfis: { id: string; nome_completo: string; cargo: string }[]
  clinicas: { id: string; nome: string }[]
}

// Interface para consulta existente (usada em validações)
export interface ConsultaExistente {
  id: string
  data_consulta: string
  duracao_minutos: number
  medico_id: string
  perfis: { nome_completo: string }[]
  pacientes: { nome_completo: string }[]
}

// Interface para dados do formulário
export interface ConsultaFormData {
  titulo: string
  descricao?: string
  paciente_id: string
  medico_id: string
  data_consulta: Date
  hora_consulta: string
  duracao_minutos: number
  status: StatusConsulta
  observacoes?: string
}

// Interface para criação de consulta
export interface CreateConsultaData {
  titulo: string
  descricao?: string
  paciente_id: string
  medico_id: string
  data_consulta: string
  duracao_minutos: number
  status: StatusConsulta
  observacoes?: string
  google_calendar_event_id?: string
  lembrete_enviado?: boolean
  clinica_id?: string
}

// Interface para atualização de consulta
export interface UpdateConsultaData extends Partial<CreateConsultaData> {
  id: string
}

// Interface para conflitos de horário
export interface ConflitosHorario {
  tipo: 'horario_funcionamento' | 'final_semana' | 'duracao_invalida' | 'duracao_minima' | 'duracao_maxima'
  mensagem: string
  pacientes?: { nome_completo: string }[]
  perfis?: { nome_completo: string }[]
}

// Tipo união para conflitos
export type ConflitosUnion = ConsultaExistente | ConflitosHorario

// Cores para status - CORRIGIDAS
export const statusColors: Record<StatusConsulta, string> = {
  agendada: 'bg-blue-100 text-blue-800',
  confirmada: 'bg-green-100 text-green-800',
  realizada: 'bg-gray-100 text-gray-800',
  cancelada: 'bg-red-100 text-red-800',
  faltou: 'bg-orange-100 text-orange-800',
}

// Labels para status - CORRIGIDAS
export const statusLabels: Record<StatusConsulta, string> = {
  agendada: 'Agendada',
  confirmada: 'Confirmada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
  faltou: 'Faltou',
}
