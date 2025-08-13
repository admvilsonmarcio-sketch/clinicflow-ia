'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

interface ResetPasswordFormProps {}

export function ResetPasswordForm({}: ResetPasswordFormProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar dados
      const validation = resetPasswordSchema.safeParse({ password, confirmPassword })
      if (!validation.success) {
        const firstError = validation.error.errors[0]
        toast({
          variant: "destructive",
          title: "Dados inválidos",
          description: firstError.message,
        })
        return
      }

      // Chamar a API para atualizar a senha
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: data.error || 'Erro ao atualizar senha.',
        })
        return
      }

      // Se chegou até aqui, a senha foi atualizada com sucesso
      setSuccess(true)
      toast({
        variant: "default",
        title: "Senha atualizada!",
        description: "Sua senha foi redefinida com sucesso.",
      })
      
      // Redirecionar para o login após 2 segundos
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (err) {
      console.error('Erro ao redefinir senha:', err)
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="size-8 text-green-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Senha redefinida com sucesso!
          </h3>
          <p className="text-sm text-gray-600">
            Você será redirecionado para o login em instantes...
          </p>
        </div>

        <div className="flex justify-center">
          <Loader2 className="size-6 animate-spin text-green-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Nova senha
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 border-gray-300 px-11 focus:border-green-500 focus:ring-green-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Confirmar nova senha
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 border-gray-300 px-11 focus:border-green-500 focus:ring-green-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </div>

        {/* Indicador de força da senha */}
        {password && (
          <div className="space-y-2">
            <div className="text-xs text-gray-600">Força da senha:</div>
            <div className="flex space-x-1">
              <div className={`h-1 flex-1 rounded ${
                password.length >= 6 ? 'bg-green-500' : 'bg-gray-200'
              }`} />
              <div className={`h-1 flex-1 rounded ${
                password.length >= 8 && /[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-200'
              }`} />
              <div className={`h-1 flex-1 rounded ${
                password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            </div>
            <div className="text-xs text-gray-500">
              Use pelo menos 6 caracteres. Recomendamos incluir letras maiúsculas e números.
            </div>
          </div>
        )}

        <Button 
          type="submit" 
          className="h-12 w-full rounded-lg bg-green-600 font-semibold text-white transition-colors hover:bg-green-700" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              Redefinindo...
            </>
          ) : (
            'Redefinir senha'
          )}
        </Button>
      </form>

      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="mb-2 text-sm font-medium text-blue-900">
          Dicas para uma senha segura:
        </h4>
        <ul className="space-y-1 text-xs text-blue-800">
          <li>• Use pelo menos 8 caracteres</li>
          <li>• Inclua letras maiúsculas e minúsculas</li>
          <li>• Adicione números e símbolos</li>
          <li>• Evite informações pessoais</li>
        </ul>
      </div>
    </div>
  )
}
