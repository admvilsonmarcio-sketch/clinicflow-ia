import { createClient } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase-server'
import { medicalLogger } from '@/lib/logging/medical-logger'
import { MedicalAction } from '@/lib/logging/types'

interface RegisterData {
  nome_completo: string
  email: string
  password: string
}

interface RegisterResult {
  success: boolean
  error?: string
  needsEmailConfirmation?: boolean
}

export async function handleUserRegistration(data: RegisterData): Promise<RegisterResult> {
  // Usar cliente administrativo para signup (requer permissões elevadas)
  const adminSupabase = createAdminClient()
  const clientSupabase = createClient()

  try {
    // 1. Criar conta no Supabase Auth usando cliente normal (melhor prática)
    const { data: authData, error: authError } = await clientSupabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          nome_completo: data.nome_completo,
        }
      }
    })

    if (authError) {
      // Log do erro de autenticação usando cliente normal
      await medicalLogger.logError(
        MedicalAction.SYSTEM_ERROR,
        new Error(`Auth signup failed: ${authError.message}`),
        medicalLogger.createBrowserContext()
      )

      // Retornar erro tratado
      let errorMessage = authError.message
      
      if (authError.message.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login.'
      } else if (authError.message.includes('Password should be at least')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.'
      } else if (authError.message.includes('Invalid email')) {
        errorMessage = 'Email inválido. Verifique o formato.'
      } else if (authError.message.includes('Signup is disabled')) {
        errorMessage = 'Cadastro temporariamente desabilitado. Tente novamente mais tarde.'
      }

      return {
        success: false,
        error: errorMessage
      }
    }

    // 2. Se o usuário foi criado com sucesso
    if (authData.user) {
      // O perfil será criado automaticamente pelo trigger do banco de dados
      // quando as políticas RLS forem corrigidas

      // Log do sucesso do registro usando cliente normal
      await medicalLogger.logProfileAction(
        MedicalAction.UPDATE_PROFILE,
        authData.user.id,
        medicalLogger.createBrowserContext(authData.user.id),
        {
          operation: 'USER_SIGNUP',
          email: data.email,
          hasName: !!data.nome_completo,
          emailConfirmationRequired: true // Email precisa ser confirmado
        },
        true
      )

      return {
        success: true,
        needsEmailConfirmation: true // Email precisa ser confirmado
      }
    }

    return {
      success: false,
      error: 'Erro inesperado durante o cadastro.'
    }

  } catch (error) {
    // Log do erro geral usando cliente normal
    try {
      await medicalLogger.logError(
        MedicalAction.SYSTEM_ERROR,
        error instanceof Error ? error : new Error('Unknown registration error'),
        medicalLogger.createBrowserContext()
      )
    } catch (logError) {
      console.error('Erro ao fazer log:', logError)
    }

    return {
      success: false,
      error: 'Erro inesperado. Tente novamente em alguns instantes.'
    }
  }
}

// Nota: O perfil é criado automaticamente pelo trigger do banco de dados
// quando um usuário é registrado no auth.users