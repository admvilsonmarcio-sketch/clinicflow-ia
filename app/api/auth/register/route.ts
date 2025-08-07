import { NextRequest, NextResponse } from 'next/server'
import { handleUserRegistration } from '@/lib/auth/register-handler'
import { z } from 'zod'

const registerSchema = z.object({
  nome_completo: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validatedData = registerSchema.parse(body)
    
    // Chamar função de registro
    const result = await handleUserRegistration(validatedData)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        needsEmailConfirmation: result.needsEmailConfirmation
      }, { status: 201 })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Erro na API de registro:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de registro ativa'
  })
}
