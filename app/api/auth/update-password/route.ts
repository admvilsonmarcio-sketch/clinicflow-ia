import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updatePasswordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = updatePasswordSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { password } = validation.data
    const supabase = createServerClient()

    // Verificar se há uma sessão ativa
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      console.error('Erro ao obter sessão:', sessionError)
      return NextResponse.json(
        { error: 'Sessão inválida. Acesse novamente através do link de recuperação.' },
        { status: 401 }
      )
    }

    // Atualizar a senha do usuário
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })
    
    if (updateError) {
      console.error('Erro ao atualizar senha:', updateError)
      
      let errorMessage = 'Erro ao atualizar senha.'
      if (updateError.message?.includes('Password should be at least')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.'
      } else if (updateError.message?.includes('New password should be different')) {
        errorMessage = 'A nova senha deve ser diferente da atual.'
      } else if (updateError.message?.includes('session')) {
        errorMessage = 'Sessão inválida. Tente acessar o link novamente.'
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    // Sucesso - fazer logout para forçar novo login com a nova senha
    await supabase.auth.signOut()

    return NextResponse.json(
      { message: 'Senha atualizada com sucesso!' },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Erro inesperado na API de atualização de senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
