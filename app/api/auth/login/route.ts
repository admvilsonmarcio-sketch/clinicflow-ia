import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema de validação para login
const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
})

// POST /api/auth/login - Fazer login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          message: 'Dados inválidos.',
          details: validation.error.errors
        },
        { status: 400 }
      )
    }
    
    const { email, password } = validation.data
    const supabase = createRouteHandlerSupabaseClient()
    
    // Tentar fazer login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (authError) {
      console.error('Erro de autenticação:', authError)
      
      // Mapear erros específicos do Supabase
      let errorMessage = 'Erro ao fazer login.'
      
      if (authError.message.includes('Invalid login credentials')) {
        errorMessage = 'E-mail ou senha incorretos.'
      } else if (authError.message.includes('Email not confirmed')) {
        errorMessage = 'E-mail não confirmado. Verifique sua caixa de entrada.'
      } else if (authError.message.includes('Too many requests')) {
        errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.'
      }
      
      return NextResponse.json(
        { 
          error: 'Authentication error',
          message: errorMessage
        },
        { status: 401 }
      )
    }
    
    if (!authData.user) {
      return NextResponse.json(
        { 
          error: 'Authentication error',
          message: 'Falha na autenticação.'
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
        telefone_celular,
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
    
    // Verificar se o usuário está ativo
    if (!perfil.ativo) {
      // Fazer logout se usuário inativo
      await supabase.auth.signOut()
      
      return NextResponse.json(
        { 
          error: 'Account disabled',
          message: 'Sua conta está desativada. Entre em contato com o administrador.'
        },
        { status: 403 }
      )
    }
    
    // Verificar se a clínica está ativa (se aplicável)
    if (perfil.clinica_id && perfil.clinicas && perfil.clinicas.length > 0 && !perfil.clinicas[0].ativa) {
      // Fazer logout se clínica inativa
      await supabase.auth.signOut()
      
      return NextResponse.json(
        { 
          error: 'Clinic disabled',
          message: 'A clínica associada à sua conta está desativada.'
        },
        { status: 403 }
      )
    }
    
    // Atualizar último login
    const { error: updateError } = await supabase
      .from('perfis')
      .update({ ultimo_login: new Date().toISOString() })
      .eq('id', authData.user.id)
    
    if (updateError) {
      console.error('Erro ao atualizar último login:', updateError)
      // Não retornar erro, pois o login foi bem-sucedido
    }
    
    // Remover dados sensíveis do perfil
    const { clinicas, ...perfilSemClinicas } = perfil
    const perfilPublico = {
      ...perfilSemClinicas,
      clinica: clinicas
    }
    
    return NextResponse.json({
      message: 'Login realizado com sucesso.',
      user: {
        ...perfilPublico
      },
      session: {
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
        expires_at: authData.session?.expires_at
      }
    })
    
  } catch (error) {
    console.error('Erro inesperado no login:', error)
    
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