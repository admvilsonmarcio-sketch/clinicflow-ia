"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputWithMask } from '@/components/ui/input-mask'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase'
import { Loader2, Save, User, Phone, MapPin, Heart, FileText } from 'lucide-react'

interface PatientData {
    id?: string
    nome_completo: string
    email?: string
    telefone: string
    data_nascimento?: string
    genero?: 'masculino' | 'feminino' | 'outro'
    endereco?: string
    contato_emergencia?: string
    telefone_emergencia?: string
    historico_medico?: string
    alergias?: string
    medicamentos?: string
    observacoes?: string
}

interface PatientFormProps {
    patient?: PatientData | null
    isEditing?: boolean
}

export function PatientForm({ patient, isEditing = false }: PatientFormProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        nome_completo: patient?.nome_completo || '',
        email: patient?.email || '',
        telefone: patient?.telefone || '',
        data_nascimento: patient?.data_nascimento || '',
        genero: (patient?.genero || 'masculino') as 'masculino' | 'feminino' | 'outro',
        endereco: patient?.endereco || '',
        contato_emergencia: patient?.contato_emergencia || '',
        telefone_emergencia: patient?.telefone_emergencia || '',
        historico_medico: patient?.historico_medico || '',
        alergias: patient?.alergias || '',
        medicamentos: patient?.medicamentos || '',
        observacoes: patient?.observacoes || '',
    })

    const { toast } = useToast()
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Validações básicas
            if (!formData.nome_completo.trim()) {
                toast({
                    variant: "warning",
                    title: "Campo obrigatório",
                    description: "Nome completo é obrigatório.",
                })
                return
            }

            if (!formData.telefone.trim()) {
                toast({
                    variant: "warning",
                    title: "Campo obrigatório",
                    description: "Telefone é obrigatório.",
                })
                return
            }

            // Buscar clínica do usuário atual
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast({
                    variant: "destructive",
                    title: "Erro de autenticação",
                    description: "Usuário não encontrado. Faça login novamente.",
                })
                return
            }

            const { data: profile } = await supabase
                .from('perfis')
                .select('clinica_id')
                .eq('id', user.id)
                .single()

            if (!profile?.clinica_id) {
                toast({
                    variant: "destructive",
                    title: "Erro",
                    description: "Clínica não encontrada. Configure sua clínica primeiro.",
                })
                return
            }

            const patientData = {
                ...formData,
                clinica_id: profile.clinica_id,
                atualizado_em: new Date().toISOString(),
            }

            let result
            if (isEditing && patient?.id) {
                // Atualizar paciente existente
                result = await supabase
                    .from('pacientes')
                    .update(patientData)
                    .eq('id', patient.id)
                    .select()
                    .single()
            } else {
                // Criar novo paciente
                result = await supabase
                    .from('pacientes')
                    .insert({
                        ...patientData,
                        criado_em: new Date().toISOString(),
                    })
                    .select()
                    .single()
            }

            if (result.error) {
                toast({
                    variant: "destructive",
                    title: "Erro ao salvar",
                    description: result.error.message,
                })
            } else {
                toast({
                    variant: "success",
                    title: isEditing ? "Paciente atualizado!" : "Paciente cadastrado!",
                    description: isEditing
                        ? "As informações do paciente foram atualizadas com sucesso."
                        : "Novo paciente foi cadastrado no sistema.",
                })

                // Redirecionar para a página de detalhes do paciente
                if (isEditing && patient?.id) {
                    router.push(`/dashboard/patients/${patient.id}`)
                } else {
                    router.push(`/dashboard/patients/${result.data.id}`)
                }
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

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informações Básicas */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <User className="h-5 w-5" />
                    Informações Básicas
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium">Nome Completo *</label>
                        <Input
                            value={formData.nome_completo}
                            onChange={(e) => handleChange('nome_completo', e.target.value)}
                            placeholder="Nome completo do paciente"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="email@exemplo.com"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Telefone *</label>
                        <InputWithMask
                            mask="(99) 99999-9999"
                            value={formData.telefone}
                            onChange={(e) => handleChange('telefone', e.target.value)}
                            placeholder="(11) 99999-9999"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Data de Nascimento</label>
                        <Input
                            type="date"
                            value={formData.data_nascimento}
                            onChange={(e) => handleChange('data_nascimento', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Gênero</label>
                        <select
                            value={formData.genero}
                            onChange={(e) => handleChange('genero', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="masculino">Masculino</option>
                            <option value="feminino">Feminino</option>
                            <option value="outro">Outro</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <MapPin className="h-5 w-5" />
                    Endereço
                </div>

                <div>
                    <label className="text-sm font-medium">Endereço Completo</label>
                    <Input
                        value={formData.endereco}
                        onChange={(e) => handleChange('endereco', e.target.value)}
                        placeholder="Rua, número, bairro, cidade - UF, CEP"
                    />
                </div>
            </div>

            {/* Contato de Emergência */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Phone className="h-5 w-5" />
                    Contato de Emergência
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Nome do Contato</label>
                        <Input
                            value={formData.contato_emergencia}
                            onChange={(e) => handleChange('contato_emergencia', e.target.value)}
                            placeholder="Nome do responsável"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Telefone de Emergência</label>
                        <InputWithMask
                            mask="(99) 99999-9999"
                            value={formData.telefone_emergencia}
                            onChange={(e) => handleChange('telefone_emergencia', e.target.value)}
                            placeholder="(11) 99999-9999"
                        />
                    </div>
                </div>
            </div>

            {/* Informações Médicas */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Heart className="h-5 w-5" />
                    Informações Médicas
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Histórico Médico</label>
                        <textarea
                            value={formData.historico_medico}
                            onChange={(e) => handleChange('historico_medico', e.target.value)}
                            placeholder="Histórico médico relevante, cirurgias anteriores, etc."
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Alergias</label>
                        <Input
                            value={formData.alergias}
                            onChange={(e) => handleChange('alergias', e.target.value)}
                            placeholder="Alergias conhecidas (medicamentos, alimentos, etc.)"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Medicamentos em Uso</label>
                        <Input
                            value={formData.medicamentos}
                            onChange={(e) => handleChange('medicamentos', e.target.value)}
                            placeholder="Medicamentos que o paciente está tomando"
                        />
                    </div>
                </div>
            </div>

            {/* Observações */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <FileText className="h-5 w-5" />
                    Observações Gerais
                </div>

                <div>
                    <label className="text-sm font-medium">Observações</label>
                    <textarea
                        value={formData.observacoes}
                        onChange={(e) => handleChange('observacoes', e.target.value)}
                        placeholder="Observações gerais sobre o paciente..."
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        rows={3}
                    />
                </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-4 pt-6 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                >
                    Cancelar
                </Button>

                <Button type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isEditing ? 'Atualizando...' : 'Cadastrando...'}
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            {isEditing ? 'Atualizar Paciente' : 'Cadastrar Paciente'}
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}