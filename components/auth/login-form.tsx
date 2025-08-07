'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Mail, Lock, LogIn, Shield } from 'lucide-react'
import Link from 'next/link'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: error.message === 'Invalid login credentials' 
            ? 'Email ou senha incorretos. Verifique suas credenciais.' 
            : error.message === 'Email not confirmed'
            ? 'Email não confirmado. Verifique sua caixa de entrada.'
            : error.message,
        })
      } else {
        toast({
          variant: "success",
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
        })
        
        // Aguardar um pouco para garantir que a sessão seja sincronizada
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Usar router.refresh() para atualizar a sessão do servidor e depois navegar
        router.refresh()
        router.push('/dashboard')
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



  return (
    <div className="w-full">
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
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
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Senha</label>
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-green-600 hover:text-green-500 transition-colors"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            type="submit" 
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                Entrar na minha conta
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
