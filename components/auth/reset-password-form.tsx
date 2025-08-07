'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

interface ResetPasswordFormProps {
  code: string
}

export function ResetPasswordForm({ code }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

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

      // Atualizar a senha (a sessão já foi estabelecida no servidor)
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

        toast({
          variant: "destructive",
          title: "Erro",
          description: errorMessage,
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
      
      // Redirecionar para o dashboard após 2 segundos
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
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

  if (success) {
    return (
      <div className="w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Senha redefinida com sucesso!
          </h3>
          <p className="text-sm text-gray-600">
            Você será redirecionado para o dashboard em instantes...
          </p>
        </div>

        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
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
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 pr-11 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Confirmar nova senha
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-11 pr-11 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
          className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Redefinindo...
            </>
          ) : (
            'Redefinir senha'
          )}
        </Button>
      </form>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Dicas para uma senha segura:
        </h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Use pelo menos 8 caracteres</li>
          <li>• Inclua letras maiúsculas e minúsculas</li>
          <li>• Adicione números e símbolos</li>
          <li>• Evite informações pessoais</li>
        </ul>
      </div>
    </div>
  )
}