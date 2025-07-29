"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputWithMask } from '@/components/ui/input-mask'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase'
import { pacienteSchema } from '@/lib/validations/paciente'
import { z } from 'zod'
import { medicalLogger } from '@/lib/logging/medical-logger'
import { MedicalAction } from '@/lib/logging/types'
import { Loader2, Save, User, Phone, MapPin, Heart, FileText, Upload } from 'lucide-react'
import { DocumentUpload } from './document-upload'
import { DocumentList } from './document-list'

interface PatientData {
    id?: string
    nome_completo: string
    email?: string
    telefone_celular: string
    telefone_fixo?: string
    data_nascimento?: string
    genero?: 'masculino' | 'feminino' | 'outro'
    cep?: string
    logradouro?: string
    numero?: string
    complemento?: string
    bairro?: string
    cidade?: string
    uf?: string
    contato_emergencia_nome?: string
    contato_emergencia_telefone?: string
    contato_emergencia_parentesco?: string
    historico_medico?: string
    alergias?: string
    medicamentos_uso_continuo?: string
    observacoes_medicas?: string
}

interface PatientFormProps {
    patient?: PatientData | null
    isEditing?: boolean
}

export function PatientForm({ patient, isEditing = false }: PatientFormProps) {
    const [loading, setLoading] = useState(false)
    const [documentRefresh, setDocumentRefresh] = useState(0)
    const [formData, setFormData] = useState({
        nome_completo: patient?.nome_completo || '',
        email: patient?.email || '',
        telefone_celular: patient?.telefone_celular || '',
        telefone_fixo: patient?.telefone_fixo || '',
        data_nascimento: patient?.data_nascimento || '',
        genero: (patient?.genero || 'masculino') as 'masculino' | 'feminino' | 'outro',
        cep: patient?.cep || '',
        logradouro: patient?.logradouro || '',
        numero: patient?.numero || '',
        complemento: patient?.complemento || '',
        bairro: patient?.bairro || '',
        cidade: patient?.cidade || '',
        uf: patient?.uf || '',
        contato_emergencia_nome: patient?.contato_emergencia_nome || '',
        contato_emergencia_telefone: patient?.contato_emergencia_telefone || '',
        contato_emergencia_parentesco: patient?.contato_emergencia_parentesco || '',
        historico_medico: patient?.historico_medico || '',
        alergias: patient?.alergias || '',
        medicamentos_uso_continuo: patient?.medicamentos_uso_continuo || '',
        observacoes_medicas: patient?.observacoes_medicas || '',
    })

    const { toast } = useToast()
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // 🔥 VALIDAÇÃO ZOD PRIMEIRO
            const validatedData = pacienteSchema.parse(formData)

            // 🔥 LIMPAR DADOS PARA BANCO (converter strings vazias em null)
            const cleanedData = {
                ...validatedData,
                data_nascimento: validatedData.data_nascimento || null,
                email: validatedData.email || null,
                cep: validatedData.cep || null,
                logradouro: validatedData.logradouro || null,
                numero: validatedData.numero || null,
                complemento: validatedData.complemento || null,
                bairro: validatedData.bairro || null,
                cidade: validatedData.cidade || null,
                uf: validatedData.uf || null,
                contato_emergencia_nome: validatedData.contato_emergencia_nome || null,
                contato_emergencia_parentesco: validatedData.contato_emergencia_parentesco || null,
                contato_emergencia_telefone: validatedData.contato_emergencia_telefone || null,
                historico_medico_detalhado: validatedData.historico_medico_detalhado || null,
                alergias_conhecidas: validatedData.alergias_conhecidas || null,
                medicamentos_uso: validatedData.medicamentos_uso || null,
                observacoes_gerais: validatedData.observacoes_gerais || null,
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
                ...cleanedData,
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

                // 🔥 LOG DA AÇÃO DE ATUALIZAÇÃO (DADOS SANITIZADOS)
                if (!result.error) {
                    await medicalLogger.logPatientAction(
                        MedicalAction.UPDATE_PATIENT,
                        patient.id,
                        medicalLogger.createBrowserContext(user.id, profile.clinica_id),
                        {
                            operation: 'UPDATE_PATIENT',
                            hasChanges: Object.keys(getChangedFields(patient, validatedData)).length > 0,
                            changedFieldsCount: Object.keys(getChangedFields(patient, validatedData)).length,
                            // NÃO LOGAR DADOS REAIS - apenas metadados
                        }
                    )
                }
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

                // 🔥 LOG DA AÇÃO DE CRIAÇÃO (DADOS SANITIZADOS)
                if (!result.error) {
                    await medicalLogger.logPatientAction(
                        MedicalAction.CREATE_PATIENT,
                        result.data.id,
                        medicalLogger.createBrowserContext(user.id, profile.clinica_id),
                        {
                            operation: 'CREATE_PATIENT',
                            fieldsProvided: Object.keys(validatedData).filter(key => validatedData[key as keyof typeof validatedData]).length,
                            // NÃO LOGAR DADOS REAIS - apenas metadados
                        }
                    )
                }
            }

            if (result.error) {
                // 🔥 LOG DO ERRO (SANITIZADO)
                await medicalLogger.logPatientAction(
                    isEditing ? MedicalAction.UPDATE_PATIENT : MedicalAction.CREATE_PATIENT,
                    patient?.id || 'new',
                    medicalLogger.createBrowserContext(user.id, profile.clinica_id),
                    {
                        operation: isEditing ? 'UPDATE_PATIENT' : 'CREATE_PATIENT',
                        errorOccurred: true,
                        // NÃO LOGAR DADOS REAIS - apenas que houve erro
                    },
                    false,
                    'Database operation failed' // Mensagem genérica
                )

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
        } catch (error) {
            // 🔥 TRATAMENTO DE ERROS ZOD
            if (error instanceof z.ZodError) {
                // Mostrar primeiro erro de validação
                const firstError = error.errors[0]
                toast({
                    variant: "destructive",
                    title: "Erro de validação",
                    description: `${firstError.path.join('.')}: ${firstError.message}`
                })
                return
            }

            // Outros erros
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

    // Helper para detectar campos alterados
    const getChangedFields = (oldData: any, newData: any) => {
        const changes: Record<string, { old: any, new: any }> = {}

        Object.keys(newData).forEach(key => {
            if (oldData[key] !== newData[key]) {
                changes[key] = {
                    old: oldData[key],
                    new: newData[key]
                }
            }
        })

        return changes
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {/* Informações Básicas */}
            <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-900">
                    <User className="h-4 w-4 md:h-5 md:w-5" />
                    Informações Básicas
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="md:col-span-2">
                        <label className="text-xs md:text-sm font-medium">Nome Completo *</label>
                        <Input
                            value={formData.nome_completo}
                            onChange={(e) => handleChange('nome_completo', e.target.value)}
                            placeholder="Nome completo do paciente"
                            required
                            className="text-sm md:text-base"
                        />
                    </div>

                    <div>
                        <label className="text-xs md:text-sm font-medium">Email</label>
                        <Input
                            type="text"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="email@exemplo.com"
                            className="text-sm md:text-base"
                        />
                    </div>

                    <div>
                        <label className="text-xs md:text-sm font-medium">Telefone *</label>
                        <InputWithMask
                            mask="(99) 99999-9999"
                            value={formData.telefone_celular}
                            onChange={(e) => handleChange('telefone_celular', e.target.value)}
                            placeholder="(11) 99999-9999"
                            required
                            className="text-sm md:text-base"
                        />
                    </div>

                    <div>
                        <label className="text-xs md:text-sm font-medium">Data de Nascimento</label>
                        <Input
                            type="date"
                            value={formData.data_nascimento}
                            onChange={(e) => handleChange('data_nascimento', e.target.value)}
                            className="text-sm md:text-base"
                        />
                    </div>

                    <div>
                        <label className="text-xs md:text-sm font-medium">Gênero</label>
                        <select
                            value={formData.genero}
                            onChange={(e) => handleChange('genero', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="masculino">Masculino</option>
                            <option value="feminino">Feminino</option>
                            <option value="outro">Outro</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Endereço */}
            <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-900">
                    <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                    Endereço
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                        <label className="text-xs md:text-sm font-medium">CEP</label>
                        <Input
                            value={formData.cep}
                            onChange={(e) => handleChange('cep', e.target.value)}
                            placeholder="00000-000"
                            className="text-sm md:text-base"
                        />
                    </div>
                    <div>
                        <label className="text-xs md:text-sm font-medium">Logradouro</label>
                        <Input
                            value={formData.logradouro}
                            onChange={(e) => handleChange('logradouro', e.target.value)}
                            placeholder="Rua, Avenida, etc."
                            className="text-sm md:text-base"
                        />
                    </div>
                    <div>
                        <label className="text-xs md:text-sm font-medium">Número</label>
                        <Input
                            value={formData.numero}
                            onChange={(e) => handleChange('numero', e.target.value)}
                            placeholder="123"
                            className="text-sm md:text-base"
                        />
                    </div>
                    <div>
                        <label className="text-xs md:text-sm font-medium">Complemento</label>
                        <Input
                            value={formData.complemento}
                            onChange={(e) => handleChange('complemento', e.target.value)}
                            placeholder="Apto, Bloco, etc."
                            className="text-sm md:text-base"
                        />
                    </div>
                    <div>
                        <label className="text-xs md:text-sm font-medium">Bairro</label>
                        <Input
                            value={formData.bairro}
                            onChange={(e) => handleChange('bairro', e.target.value)}
                            placeholder="Nome do bairro"
                            className="text-sm md:text-base"
                        />
                    </div>
                    <div>
                        <label className="text-xs md:text-sm font-medium">Cidade</label>
                        <Input
                            value={formData.cidade}
                            onChange={(e) => handleChange('cidade', e.target.value)}
                            placeholder="Nome da cidade"
                            className="text-sm md:text-base"
                        />
                    </div>
                </div>
            </div>

            {/* Contato de Emergência */}
            <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-900">
                    <Phone className="h-4 w-4 md:h-5 md:w-5" />
                    Contato de Emergência
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                        <label className="text-xs md:text-sm font-medium">Nome do Contato</label>
                        <Input
                            value={formData.contato_emergencia_nome}
                            onChange={(e) => handleChange('contato_emergencia_nome', e.target.value)}
                            placeholder="Nome do responsável"
                            className="text-sm md:text-base"
                        />
                    </div>

                    <div>
                        <label className="text-xs md:text-sm font-medium">Telefone de Emergência</label>
                        <InputWithMask
                            mask="(99) 99999-9999"
                            value={formData.contato_emergencia_telefone}
                            onChange={(e) => handleChange('contato_emergencia_telefone', e.target.value)}
                            placeholder="(11) 99999-9999"
                            className="text-sm md:text-base"
                        />
                    </div>
                </div>
            </div>

            {/* Informações Médicas */}
            <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-900">
                    <Heart className="h-4 w-4 md:h-5 md:w-5" />
                    Informações Médicas
                </div>

                <div className="space-y-3 md:space-y-4">
                    <div>
                        <label className="text-xs md:text-sm font-medium">Histórico Médico</label>
                        <textarea
                            value={formData.historico_medico}
                            onChange={(e) => handleChange('historico_medico', e.target.value)}
                            placeholder="Histórico médico relevante, cirurgias anteriores, etc."
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="text-xs md:text-sm font-medium">Alergias</label>
                        <Input
                            value={formData.alergias}
                            onChange={(e) => handleChange('alergias', e.target.value)}
                            placeholder="Alergias conhecidas (medicamentos, alimentos, etc.)"
                            className="text-sm md:text-base"
                        />
                    </div>

                    <div>
                        <label className="text-xs md:text-sm font-medium">Medicamentos em Uso</label>
                        <Input
                            value={formData.medicamentos_uso_continuo}
                            onChange={(e) => handleChange('medicamentos_uso_continuo', e.target.value)}
                            placeholder="Medicamentos que o paciente está tomando"
                            className="text-sm md:text-base"
                        />
                    </div>
                </div>
            </div>

            {/* Observações */}
            <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-900">
                    <FileText className="h-4 w-4 md:h-5 md:w-5" />
                    Observações Gerais
                </div>

                <div>
                    <label className="text-xs md:text-sm font-medium">Observações</label>
                    <textarea
                        value={formData.observacoes_medicas}
                        onChange={(e) => handleChange('observacoes_medicas', e.target.value)}
                        placeholder="Observações gerais sobre o paciente..."
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        rows={3}
                    />
                </div>
            </div>

            {/* Documentos - Apenas para pacientes existentes */}
            {isEditing && patient?.id && (
                <div className="space-y-4 md:space-y-6">
                    <div className="border-t pt-4 md:pt-6">
                        <DocumentUpload 
                            pacienteId={patient.id}
                            onDocumentUploaded={() => setDocumentRefresh(prev => prev + 1)}
                        />
                    </div>
                    
                    <div>
                        <DocumentList 
                            pacienteId={patient.id}
                            refreshTrigger={documentRefresh}
                        />
                    </div>
                </div>
            )}

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 md:pt-6 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="w-full sm:w-auto text-sm md:text-base"
                >
                    Cancelar
                </Button>

                <Button type="submit" disabled={loading} className="w-full sm:w-auto text-sm md:text-base">
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                            {isEditing ? 'Atualizando...' : 'Cadastrando...'}
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                            {isEditing ? 'Atualizar Paciente' : 'Cadastrar Paciente'}
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}