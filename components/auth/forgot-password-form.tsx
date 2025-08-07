'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { z } from 'zod'

const emailSchema = z.object({
  email: z.string().email('Email inválido')
})

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

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

      // Enviar email de recuperação
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        // Tratar diferentes tipos de erro
        let errorMessage = 'Erro ao enviar email de recuperação.'
        
        if (error.message.includes('Email not found')) {
          errorMessage = 'Email não encontrado. Verifique se o email está correto.'
        } else if (error.message.includes('Email rate limit exceeded')) {
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
      <div className="w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Próximos passos:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Verifique sua caixa de entrada</li>
            <li>• Procure também na pasta de spam</li>
            <li>• Clique no link do email para redefinir sua senha</li>
            <li>• O link expira em 1 hora</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleResendEmail}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reenviando...
              </>
            ) : (
              'Reenviar email'
            )}
          </Button>

          <Link href="/auth/login">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
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
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-11 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao login
          </Button>
        </Link>
      </div>
    </div>
  )
}