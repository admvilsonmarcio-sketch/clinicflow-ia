import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'

// POST /api/auth/logout - Fazer logout
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerSupabaseClient()
    
    // Verificar se há uma sessão ativa
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
    
    // Se não há sessão ativa, considerar logout bem-sucedido
    if (!session) {
      return NextResponse.json({
        message: 'Logout realizado com sucesso.'
      })
    }
    
    // Fazer logout
    const { error: logoutError } = await supabase.auth.signOut()
    
    if (logoutError) {
      console.error('Erro ao fazer logout:', logoutError)
      return NextResponse.json(
        { 
          error: 'Logout error',
          message: 'Erro ao fazer logout.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Logout realizado com sucesso.'
    })
    
  } catch (error) {
    console.error('Erro inesperado no logout:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}

// GET /api/auth/logout - Fazer logout via GET (para compatibilidade)
export async function GET(request: NextRequest) {
  return POST(request)
}