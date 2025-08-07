import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerSupabaseClient()

    // Verifica se o email existe na tabela auth.users
    // Usamos o admin client para acessar dados de autenticação
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error('Erro ao verificar email:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    // Verifica se o email existe na lista de usuários
    const emailExists = users.some(user => user.email === email)

    return NextResponse.json({ exists: emailExists })
  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}