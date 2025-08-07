import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  code: z.string().min(1, 'Código é obrigatório')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = resetPasswordSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { password, code } = validation.data
    const supabase = createServerClient()

    // Primeiro, trocar o código por uma sessão
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (sessionError || !sessionData?.session) {
      console.error('Erro ao processar código PKCE:', sessionError)
      
      let errorMessage = 'Código inválido ou expirado.'
      if (sessionError?.message?.includes('expired')) {
        errorMessage = 'O link de recuperação expirou. Solicite um novo.'
      } else if (sessionError?.message?.includes('invalid')) {
        errorMessage = 'Link de recuperação inválido.'
      } else if (sessionError?.message?.includes('already_used')) {
        errorMessage = 'Este link já foi utilizado. Solicite um novo.'
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    // Agora que temos uma sessão válida, atualizar a senha
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

    // Sucesso
    return NextResponse.json(
      { message: 'Senha atualizada com sucesso!' },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Erro inesperado na API de reset de senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
