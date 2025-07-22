"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Building2, CheckCircle } from 'lucide-react'

interface ClinicSetupProps {
    onComplete: () => void
}

export function ClinicSetup({ onComplete }: ClinicSetupProps) {
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(true)
    const [needsSetup, setNeedsSetup] = useState(false)
    const [clinicName, setClinicName] = useState('')
    const { toast } = useToast()
    const supabase = createClient()

    useEffect(() => {
        checkUserSetup()
    }, [])

    const checkUserSetup = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('perfis')
                .select('*, clinicas(*)')
                .eq('id', user.id)
                .single()

            if (!profile) {
                // Criar perfil se não existir
                await createUserProfile(user)
            } else if (!profile.clinica_id || !profile.clinicas) {
                // Precisa criar clínica
                setNeedsSetup(true)
                setClinicName(profile.nome_completo + ' - Clínica')
            } else {
                // Tudo OK
                onComplete()
            }
        } catch (error) {
            console.error('Erro ao verificar setup:', error)
            setNeedsSetup(true)
        } finally {
            setChecking(false)
        }
    }

    const createUserProfile = async (user: any) => {
        try {
            // Criar clínica primeiro
            const { data: clinic, error: clinicError } = await supabase
                .from('clinicas')
                .insert({
                    nome: user.user_metadata?.nome_completo + ' - Clínica' || 'Minha Clínica',
                    descricao: 'Clínica criada automaticamente',
                    criado_em: new Date().toISOString(),
                    atualizado_em: new Date().toISOString(),
                })
                .select()
                .single()

            if (clinicError) throw clinicError

            // Criar perfil vinculado à clínica
            const { error: profileError } = await supabase
                .from('perfis')
                .insert({
                    id: user.id,
                    email: user.email,
                    nome_completo: user.user_metadata?.nome_completo || user.email.split('@')[0],
                    clinica_id: clinic.id,
                    cargo: 'medico',
                    criado_em: new Date().toISOString(),
                    atualizado_em: new Date().toISOString(),
                })

            if (profileError) throw profileError

            toast({
                variant: "success",
                title: "Setup concluído!",
                description: "Seu perfil e clínica foram criados com sucesso.",
            })

            onComplete()
        } catch (error: any) {
            console.error('Erro ao criar perfil:', error)
            setNeedsSetup(true)
            setClinicName(user.user_metadata?.nome_completo + ' - Clínica' || 'Minha Clínica')
        }
    }

    const handleCreateClinic = async () => {
        if (!clinicName.trim()) {
            toast({
                variant: "warning",
                title: "Nome obrigatório",
                description: "Digite o nome da sua clínica.",
            })
            return
        }

        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Usuário não encontrado')

            // Criar clínica
            const { data: clinic, error: clinicError } = await supabase
                .from('clinicas')
                .insert({
                    nome: clinicName,
                    descricao: 'Clínica principal',
                    criado_em: new Date().toISOString(),
                    atualizado_em: new Date().toISOString(),
                })
                .select()
                .single()

            if (clinicError) throw clinicError

            // Atualizar perfil com a clínica
            const { error: updateError } = await supabase
                .from('perfis')
                .update({
                    clinica_id: clinic.id,
                    atualizado_em: new Date().toISOString(),
                })
                .eq('id', user.id)

            if (updateError) throw updateError

            toast({
                variant: "success",
                title: "Clínica criada!",
                description: "Sua clínica foi configurada com sucesso.",
            })

            onComplete()
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao criar clínica",
                description: error.message,
            })
        } finally {
            setLoading(false)
        }
    }

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Verificando configuração...</p>
                </div>
            </div>
        )
    }

    if (!needsSetup) {
        return null
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                    <CardTitle>Configuração Inicial</CardTitle>
                    <CardDescription>
                        Vamos configurar sua clínica para começar a usar o MediFlow
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Nome da Clínica</label>
                        <Input
                            value={clinicName}
                            onChange={(e) => setClinicName(e.target.value)}
                            placeholder="Digite o nome da sua clínica"
                            disabled={loading}
                        />
                    </div>

                    <Button
                        onClick={handleCreateClinic}
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Criando...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Criar Clínica
                            </>
                        )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                        Você poderá alterar essas informações depois nas configurações
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}