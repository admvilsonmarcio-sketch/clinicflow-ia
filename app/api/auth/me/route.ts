import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'

// GET /api/auth/me - Obter informações do usuário atual
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerSupabaseClient()
    
    // Verificar sessão atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Erro ao verificar sessão:', sessionError)
      return NextResponse.json(
        { 
          error: 'Session error',
          message: 'Erro ao verificar sessão.'
        },
        { status: 500 }
      )
    }
    
    if (!session || !session.user) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Usuário não autenticado.'
        },
        { status: 401 }
      )
    }
    
    // Buscar perfil do usuário
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
        ultimo_login,
        created_at,
        clinicas(
          id,
          nome,
          ativa,
          cnpj,
          telefone,
          endereco
        )
      `)
      .eq('id', session.user.id)
      .single()
    
    if (perfilError || !perfil) {
      console.error('Erro ao buscar perfil:', perfilError)
      return NextResponse.json(
        { 
          error: 'Profile not found',
          message: 'Perfil de usuário não encontrado.'
        },
        { status: 404 }
      )
    }
    
    // Verificar se o usuário está ativo
    if (!perfil.ativo) {
      return NextResponse.json(
        { 
          error: 'Account disabled',
          message: 'Sua conta está desativada.'
        },
        { status: 403 }
      )
    }
    
    // Verificar se a clínica está ativa (se aplicável)
    if (perfil.clinica_id && perfil.clinicas && perfil.clinicas.length > 0 && !perfil.clinicas[0].ativa) {
      return NextResponse.json(
        { 
          error: 'Clinic disabled',
          message: 'A clínica associada à sua conta está desativada.'
        },
        { status: 403 }
      )
    }
    
    // Preparar dados do usuário
    const { clinicas, ...perfilSemClinicas } = perfil
    const userData = {
      ...perfilSemClinicas,
      clinica: clinicas
    }
    
    // Preparar dados da sessão
    const sessionData = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      expires_in: session.expires_in
    }
    
    return NextResponse.json({
      user: userData,
      session: sessionData,
      authenticated: true
    })
    
  } catch (error) {
    console.error('Erro inesperado ao verificar usuário:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}