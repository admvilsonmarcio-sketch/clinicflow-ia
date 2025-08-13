'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Mail, Lock, User, Shield, CheckCircle } from 'lucide-react'
import { z } from 'zod'
// Removido import direto da função - agora usa API route

const registerSchema = z.object({
  nomeCompleto: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    nomeCompleto: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar dados com Zod
      const validatedData = registerSchema.parse(formData)

      // Chamar API route em vez da função direta
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome_completo: validatedData.nomeCompleto,
          email: validatedData.email,
          password: validatedData.password
        })
      })
      
      const result = await response.json()

      if (result.success) {
        toast({
          variant: "success",
          title: "Conta criada com sucesso!",
          description: result.needsEmailConfirmation 
            ? "Verifique seu email para confirmar a conta e depois faça login."
            : "Você já pode fazer login.",
        })
        
        // Redirecionar para login após sucesso
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao criar conta",
          description: result.error || "Erro inesperado",
        })
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Mostrar primeiro erro de validação
        const firstError = err.errors[0]
        toast({
          variant: "destructive",
          title: "Dados inválidos",
          description: firstError.message,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Erro inesperado",
          description: "Tente novamente em alguns instantes.",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Nome Completo</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Seu nome completo"
              value={formData.nomeCompleto}
              onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
              className="h-12 border-gray-300 pl-11 focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="h-12 border-gray-300 pl-11 focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="h-12 border-gray-300 pl-11 focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Confirmar Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="password"
              placeholder="Digite a senha novamente"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="h-12 border-gray-300 pl-11 focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            type="submit" 
            className="h-12 w-full rounded-lg bg-green-600 font-semibold text-white transition-colors hover:bg-green-700" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-5 animate-spin" />
                Criando conta...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 size-5" />
                Criar minha conta gratuita
              </>
            )}
          </Button>
          
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-start space-x-3">
              <Mail className="mt-0.5 size-5 shrink-0 text-green-600" />
              <div className="text-sm text-green-800">
                <p className="mb-1 font-semibold">Confirmação por Email</p>
                <p className="text-green-700">Após criar sua conta, você receberá um email de confirmação. Clique no link para ativar sua conta e começar a usar o MediFlow.</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
