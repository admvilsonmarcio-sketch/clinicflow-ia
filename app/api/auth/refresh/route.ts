import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema de validação para refresh token
const refreshSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token é obrigatório')
})

// POST /api/auth/refresh - Renovar token de acesso
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = refreshSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          message: 'Refresh token inválido.',
          details: validation.error.errors
        },
        { status: 400 }
      )
    }
    
    const { refresh_token } = validation.data
    const supabase = createRouteHandlerSupabaseClient()
    
    // Tentar renovar a sessão
    const { data: authData, error: refreshError } = await supabase.auth.refreshSession({
      refresh_token
    })
    
    if (refreshError) {
      console.error('Erro ao renovar token:', refreshError)
      
      // Mapear erros específicos do Supabase
      let errorMessage = 'Erro ao renovar token.'
      
      if (refreshError.message.includes('Invalid refresh token')) {
        errorMessage = 'Token de renovação inválido.'
      } else if (refreshError.message.includes('refresh_token_not_found')) {
        errorMessage = 'Token de renovação não encontrado.'
      } else if (refreshError.message.includes('Token has expired')) {
        errorMessage = 'Token de renovação expirado.'
      }
      
      return NextResponse.json(
        { 
          error: 'Refresh error',
          message: errorMessage
        },
        { status: 401 }
      )
    }
    
    if (!authData.session || !authData.user) {
      return NextResponse.json(
        { 
          error: 'Refresh error',
          message: 'Falha na renovação do token.'
        },
        { status: 401 }
      )
    }
    
    // Buscar perfil do usuário para verificar se ainda está ativo
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select(`
        id,
        nome,
        email,
        role,
        clinica_id,
        ativo,
        crm,
        especialidade,
        telefone,
        clinicas(
          id,
          nome,
          ativa
        )
      `)
      .eq('id', authData.user.id)
      .single()
    
    if (perfilError || !perfil) {
      console.error('Erro ao buscar perfil:', perfilError)
      
      // Fazer logout se não conseguir buscar o perfil
      await supabase.auth.signOut()
      
      return NextResponse.json(
        { 
          error: 'Profile error',
          message: 'Perfil de usuário não encontrado.'
        },
        { status: 404 }
      )
    }
    
    // Verificar se o usuário ainda está ativo
    if (!perfil.ativo) {
      // Fazer logout se usuário inativo
      await supabase.auth.signOut()
      
      return NextResponse.json(
        { 
          error: 'Account disabled',
          message: 'Sua conta foi desativada.'
        },
        { status: 403 }
      )
    }
    
    // Verificar se a clínica ainda está ativa (se aplicável)
    if (perfil.clinica_id && perfil.clinicas && perfil.clinicas.length > 0 && !perfil.clinicas[0].ativa) {
      // Fazer logout se clínica inativa
      await supabase.auth.signOut()
      
      return NextResponse.json(
        { 
          error: 'Clinic disabled',
          message: 'A clínica associada à sua conta foi desativada.'
        },
        { status: 403 }
      )
    }
    
    // Preparar dados de resposta
    const { clinicas, ...perfilSemClinicas } = perfil
    const userData = {
      ...perfilSemClinicas,
      clinica: clinicas
    }
    
    const sessionData = {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      expires_at: authData.session.expires_at,
      expires_in: authData.session.expires_in
    }
    
    return NextResponse.json({
      message: 'Token renovado com sucesso.',
      user: userData,
      session: sessionData
    })
    
  } catch (error) {
    console.error('Erro inesperado na renovação de token:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          message: 'Dados inválidos.',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}