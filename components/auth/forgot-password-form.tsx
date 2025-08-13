'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Mail, ArrowLeft, CheckCircle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { z } from 'zod'

const emailSchema = z.object({
  email: z.string().email('Email inválido')
})

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [canResend, setCanResend] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  // Timer para controlar reenvio de email
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  // Função para verificar se o email existe na base
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        console.error('Erro ao verificar email:', response.statusText)
        // Em caso de erro, assumimos que o email existe (fail-safe)
        return true
      }

      const { exists } = await response.json()
      return exists
    } catch (err) {
      console.error('Erro ao verificar email:', err)
      // Em caso de erro, assumimos que o email existe (fail-safe)
      return true
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar email
      const validation = emailSchema.safeParse({ email })
      if (!validation.success) {
        toast({
          variant: "destructive",
          title: "Email inválido",
          description: "Por favor, digite um email válido.",
        })
        return
      }

      // Verificar se o email existe na base
      const emailExists = await checkEmailExists(email)
      if (!emailExists) {
        toast({
          variant: "destructive",
          title: "Email não encontrado",
          description: "Este email não está cadastrado em nossa plataforma. Verifique se digitou corretamente ou crie uma nova conta.",
        })
        return
      }

      // Enviar email de recuperação
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        // Tratar diferentes tipos de erro
        let errorMessage = 'Erro ao enviar email de recuperação.'
        
        if (error.message.includes('Email rate limit exceeded')) {
          errorMessage = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.'
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Email inválido. Verifique o formato do email.'
        }

        toast({
          variant: "destructive",
          title: "Erro",
          description: errorMessage,
        })
      } else {
        setEmailSent(true)
        setCanResend(false)
        setResendTimer(60) // 1 minuto
        toast({
          variant: "default",
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada para as instruções de recuperação.",
        })
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (!canResend) return
    
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao reenviar email. Tente novamente.",
        })
      } else {
        setCanResend(false)
        setResendTimer(60) // 1 minuto
        toast({
          variant: "default",
          title: "Email reenviado!",
          description: "Verifique sua caixa de entrada novamente.",
        })
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="size-8 text-green-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Email enviado com sucesso!
          </h3>
          <p className="text-sm text-gray-600">
            Enviamos as instruções de recuperação para:
          </p>
          <p className="text-sm font-medium text-gray-900">
            {email}
          </p>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-left">
          <h4 className="mb-2 text-sm font-medium text-blue-900">
            Próximos passos:
          </h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Verifique sua caixa de entrada</li>
            <li>• Procure também na pasta de spam</li>
            <li>• Clique no link do email para redefinir sua senha</li>
            <li>• O link expira em 1 hora</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleResendEmail}
            disabled={loading || !canResend}
            variant="outline"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Reenviando...
              </>
            ) : !canResend ? (
              <>
                <Clock className="mr-2 size-4" />
                Aguarde {resendTimer}s
              </>
            ) : (
              'Reenviar email'
            )}
          </Button>

          <Link href="/auth/login">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="mr-2 size-4" />
              Voltar ao login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 border-gray-300 pl-11 focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="h-12 w-full rounded-lg bg-green-600 font-semibold text-white transition-colors hover:bg-green-700" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar instruções'
          )}
        </Button>
      </form>

      <div className="mt-6">
        <Link href="/auth/login">
          <Button variant="ghost" className="w-full">
            <ArrowLeft className="mr-2 size-4" />
            Voltar ao login
          </Button>
        </Link>
      </div>
    </div>
  )
}
