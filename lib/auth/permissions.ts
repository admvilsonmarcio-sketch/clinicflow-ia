import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database'

// Tipos de cargo disponíveis
export type UserRole = 'super_admin' | 'admin' | 'medico' | 'enfermeiro' | 'recepcionista' | 'assistente'

// Tipos de permissão
export type Permission = 
  | 'patients:read' | 'patients:write' | 'patients:delete'
  | 'consultas:read' | 'consultas:write' | 'consultas:delete'
  | 'clinicas:read' | 'clinicas:write' | 'clinicas:delete'
  | 'perfis:read' | 'perfis:write' | 'perfis:delete'
  | 'conversas:read' | 'conversas:write' | 'conversas:delete'
  | 'mensagens:read' | 'mensagens:write' | 'mensagens:delete'
  | 'reports:read' | 'settings:write' | 'audit:read'

// Mapeamento de permissões por cargo
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    // Todas as permissões (super administrador)
    'patients:read', 'patients:write', 'patients:delete',
    'consultas:read', 'consultas:write', 'consultas:delete',
    'clinicas:read', 'clinicas:write', 'clinicas:delete',
    'perfis:read', 'perfis:write', 'perfis:delete',
    'conversas:read', 'conversas:write', 'conversas:delete',
    'mensagens:read', 'mensagens:write', 'mensagens:delete',
    'reports:read', 'settings:write', 'audit:read'
  ],
  
  admin: [
    // Pacientes
    'patients:read', 'patients:write', 'patients:delete',
    // Consultas
    'consultas:read', 'consultas:write', 'consultas:delete',
    // Clínicas
    'clinicas:read', 'clinicas:write', 'clinicas:delete',
    // Perfis
    'perfis:read', 'perfis:write', 'perfis:delete',
    // Conversas
    'conversas:read', 'conversas:write', 'conversas:delete',
    // Mensagens
    'mensagens:read', 'mensagens:write', 'mensagens:delete',
    // Outros
    'reports:read', 'settings:write', 'audit:read'
  ],
  
  medico: [
    // Pacientes (pode ver e editar seus pacientes)
    'patients:read', 'patients:write',
    // Consultas (pode gerenciar suas consultas)
    'consultas:read', 'consultas:write',
    // Conversas (pode ver e responder conversas de seus pacientes)
    'conversas:read', 'conversas:write',
    // Mensagens (pode ler e enviar mensagens)
    'mensagens:read', 'mensagens:write',
    // Relatórios (pode ver relatórios de seus pacientes)
    'reports:read'
  ],
  
  enfermeiro: [
    // Pacientes (pode ver e editar informações básicas)
    'patients:read', 'patients:write',
    // Consultas (pode ver e atualizar status)
    'consultas:read', 'consultas:write',
    // Conversas (pode ver conversas)
    'conversas:read',
    // Mensagens (pode ler mensagens)
    'mensagens:read'
  ],
  
  recepcionista: [
    // Pacientes (pode cadastrar e editar informações básicas)
    'patients:read', 'patients:write',
    // Consultas (pode agendar e gerenciar consultas)
    'consultas:read', 'consultas:write',
    // Conversas (pode iniciar conversas)
    'conversas:read', 'conversas:write',
    // Mensagens (pode enviar mensagens administrativas)
    'mensagens:read', 'mensagens:write'
  ],
  
  assistente: [
    // Pacientes (apenas leitura)
    'patients:read',
    // Consultas (apenas leitura)
    'consultas:read',
    // Conversas (apenas leitura)
    'conversas:read',
    // Mensagens (apenas leitura)
    'mensagens:read'
  ]
}

// Interface para dados do usuário
export interface AuthenticatedUser {
  id: string
  email: string
  role: UserRole
  clinica_id: string
  nome_completo: string
  ativo: boolean
}

// Função para verificar se um usuário tem uma permissão específica
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false
}

// Função para verificar múltiplas permissões
export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission))
}

export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission))
}

// Middleware de autenticação médica
export async function withMedicalAuth(
  request: NextRequest,
  requiredPermissions: Permission[] = []
): Promise<{ user: AuthenticatedUser; error?: never } | { user?: never; error: NextResponse }> {
  try {
    const supabase = createRouteHandlerSupabaseClient()
    
    // Verificar sessão
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return {
        error: NextResponse.json(
          { 
            error: 'Unauthorized',
            message: 'Acesso negado. Faça login para continuar.',
            code: 'AUTH_REQUIRED'
          },
          { status: 401 }
        )
      }
    }
    
    // Buscar dados do perfil do usuário
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('id, email, cargo, clinica_id, nome_completo, ativo')
      .eq('id', session.user.id)
      .single()
    
    if (perfilError || !perfil) {
      return {
        error: NextResponse.json(
          { 
            error: 'Profile not found',
            message: 'Perfil de usuário não encontrado.',
            code: 'PROFILE_NOT_FOUND'
          },
          { status: 404 }
        )
      }
    }
    
    // Verificar se o usuário está ativo
    if (!perfil.ativo) {
      return {
        error: NextResponse.json(
          { 
            error: 'Account disabled',
            message: 'Conta desativada. Entre em contato com o administrador.',
            code: 'ACCOUNT_DISABLED'
          },
          { status: 403 }
        )
      }
    }
    
    const user: AuthenticatedUser = {
      id: perfil.id,
      email: perfil.email,
      role: perfil.cargo as UserRole,
      clinica_id: perfil.clinica_id,
      nome_completo: perfil.nome_completo,
      ativo: perfil.ativo
    }
    
    // Verificar permissões se especificadas
    if (requiredPermissions.length > 0) {
      const hasRequiredPermissions = hasAllPermissions(user.role, requiredPermissions)
      
      if (!hasRequiredPermissions) {
        return {
          error: NextResponse.json(
            { 
              error: 'Insufficient permissions',
              message: 'Você não tem permissão para realizar esta ação.',
              code: 'INSUFFICIENT_PERMISSIONS',
              required: requiredPermissions,
              userRole: user.role
            },
            { status: 403 }
          )
        }
      }
    }
    
    return { user }
    
  } catch (error) {
    console.error('Erro na autenticação médica:', error)
    return {
      error: NextResponse.json(
        { 
          error: 'Internal server error',
          message: 'Erro interno do servidor.',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      )
    }
  }
}

// Função para verificar se o usuário pode acessar recursos de uma clínica específica
export function canAccessClinica(user: AuthenticatedUser, clinicaId: string): boolean {
  // Admins podem acessar qualquer clínica
  if (user.role === 'admin') {
    return true
  }
  
  // Outros usuários só podem acessar recursos da própria clínica
  return user.clinica_id === clinicaId
}

// Função para verificar se o usuário pode acessar dados de um paciente específico
export async function canAccessPatient(
  user: AuthenticatedUser, 
  patientId: string
): Promise<boolean> {
  try {
    const supabase = createRouteHandlerSupabaseClient()
    
    // Buscar a clínica do paciente
    const { data: patient, error } = await supabase
      .from('pacientes')
      .select('clinica_id')
      .eq('id', patientId)
      .single()
    
    if (error || !patient) {
      return false
    }
    
    return canAccessClinica(user, patient.clinica_id)
    
  } catch (error) {
    console.error('Erro ao verificar acesso ao paciente:', error)
    return false
  }
}

// Função para verificar se o usuário pode acessar uma consulta específica
export async function canAccessConsulta(
  user: AuthenticatedUser, 
  consultaId: string
): Promise<boolean> {
  try {
    const supabase = createRouteHandlerSupabaseClient()
    
    // Buscar dados da consulta
    const { data: consulta, error } = await supabase
      .from('consultas')
      .select('clinica_id, medico_id')
      .eq('id', consultaId)
      .single()
    
    if (error || !consulta) {
      return false
    }
    
    // Verificar acesso à clínica
    if (!canAccessClinica(user, consulta.clinica_id)) {
      return false
    }
    
    // Médicos só podem acessar suas próprias consultas (exceto admins)
    if (user.role === 'medico' && consulta.medico_id !== user.id) {
      return false
    }
    
    return true
    
  } catch (error) {
    console.error('Erro ao verificar acesso à consulta:', error)
    return false
  }
}

// Helper para criar resposta de erro de permissão
export function createPermissionError(message: string = 'Acesso negado'): NextResponse {
  return NextResponse.json(
    { 
      error: 'Forbidden',
      message,
      code: 'ACCESS_DENIED'
    },
    { status: 403 }
  )
}