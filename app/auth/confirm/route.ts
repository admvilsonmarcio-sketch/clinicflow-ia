import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = createServerClient()

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error && data.session) {
      // Se for um reset de senha, redirecionar para a página de redefinição
      if (type === 'recovery') {
        redirect('/auth/reset-password?verified=true')
      }
      // Para outros tipos (email confirmation), redirecionar para o próximo destino
      redirect(next)
    }
  }

  // Se houver erro ou parâmetros inválidos, redirecionar para página de erro
  redirect('/auth/reset-password?error=invalid_link&error_description=Link de recuperação inválido ou expirado')
}
