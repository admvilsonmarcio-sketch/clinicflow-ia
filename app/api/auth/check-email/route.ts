import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Verifica se o cliente admin foi criado corretamente
    if (!supabase) {
      console.error('Cliente admin do Supabase não disponível')
      return NextResponse.json(
        { error: 'Serviço temporariamente indisponível' },
        { status: 503 }
      )
    }

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
    const emailExists = users.some((user: any) => user.email === email)

    return NextResponse.json({ exists: emailExists })
  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}