"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Heart,
    Pill,
    FileText,
    AlertTriangle,
    Clock,
    Download,
    Eye
} from 'lucide-react'
import PatientHistory from './patient-history'
import { DocumentList } from './document-list'
import { useFormatTelefone } from '@/hooks/use-viacep'

interface PatientDetailsProps {
    patient: {
        id: string
        clinica_id: string
        nome_completo: string
        email: string
        data_nascimento: string
        genero: 'masculino' | 'feminino' | 'outro'
        whatsapp_id?: string
        instagram_id?: string
        ultimo_contato?: string
        status: 'ativo' | 'inativo' | 'bloqueado'
        criado_em: string
        atualizado_em: string
        cpf?: string
        rg?: string
        orgao_emissor?: string
        uf_rg?: string
        estado_civil?: string
        profissao?: string
        telefone_celular?: string
        telefone_fixo?: string
        cep?: string
        logradouro?: string
        numero?: string
        complemento?: string
        bairro?: string
        cidade?: string
        uf?: string
        nome_emergencia?: string
        parentesco_emergencia?: string
        observacoes_emergencia?: string
        telefone_emergencia?: string
        tipo_sanguineo?: string
        alergias_conhecidas?: string[]
        medicamentos_uso?: string[]
        historico_medico_detalhado?: string
        observacoes_gerais?: string
        foto_url?: string
        qr_code?: string
        data_ultima_consulta?: string
        status_ativo?: boolean
        convenio_medico?: string
        data_rascunho?: string
        numero_carteirinha?: string
    }
}

export function PatientDetails({ patient }: PatientDetailsProps) {
    const { formatTelefone } = useFormatTelefone()
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR')
    }

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR')
    }

    const formatEnderecoCompleto = () => {
        const partes = []
        if (patient.logradouro) partes.push(patient.logradouro)
        if (patient.numero) partes.push(patient.numero)
        if (patient.complemento) partes.push(patient.complemento)
        if (patient.bairro) partes.push(patient.bairro)
        if (patient.cidade) partes.push(patient.cidade)
        if (patient.uf) partes.push(patient.uf)
        if (patient.cep) partes.push(`CEP: ${patient.cep}`)
        return partes.length > 0 ? partes.join(', ') : 'Não informado'
    }

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
            {/* Coluna Principal */}
            <div className="space-y-4 lg:col-span-2 lg:space-y-6">
                {/* Informações Básicas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <User className="size-4 sm:size-5" />
                            Informações Básicas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 lg:space-y-4">
                        <div className="space-y-3 sm:space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500 sm:text-sm">
                                    <Phone className="size-3 sm:size-4 flex-shrink-0" />
                                    Telefone
                                </div>
                                <p className="break-words text-sm font-medium sm:text-base">{patient.telefone_celular ? formatTelefone(patient.telefone_celular, 'celular') : 'Não informado'}</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500 sm:text-sm">
                                    <Mail className="size-3 sm:size-4 flex-shrink-0" />
                                    Email
                                </div>
                                <p className="break-words text-sm font-medium sm:text-base">{patient.email || 'Não informado'}</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500 sm:text-sm">
                                    <Calendar className="size-3 sm:size-4 flex-shrink-0" />
                                    Data de Nascimento
                                </div>
                                <p className="text-sm font-medium sm:text-base">{patient.data_nascimento ? formatDate(patient.data_nascimento) : 'Não informado'}</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500 sm:text-sm">
                                    <User className="size-3 sm:size-4 flex-shrink-0" />
                                    Gênero
                                </div>
                                <p className="text-sm font-medium sm:text-base">
                                    {patient.genero === 'masculino' ? 'Masculino' :
                                        patient.genero === 'feminino' ? 'Feminino' : 'Outro'}
                                </p>
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500 sm:text-sm">
                                    <MapPin className="size-3 sm:size-4 flex-shrink-0" />
                                    Endereço
                                </div>
                                <p className="break-words text-sm font-medium sm:text-base">{formatEnderecoCompleto()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contato de Emergência */}
                {(patient.nome_emergencia || patient.parentesco_emergencia || patient.telefone_emergencia || patient.observacoes_emergencia) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="size-5" />
                                Contato de Emergência
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 lg:space-y-4">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4">
                                {patient.nome_emergencia && (
                                    <div className="space-y-2">
                                        <div className="text-xs text-gray-500 sm:text-sm">Nome</div>
                                        <p className="break-words text-sm font-medium sm:text-base">{patient.nome_emergencia}</p>
                                    </div>
                                )}

                                {patient.parentesco_emergencia && (
                                    <div className="space-y-2">
                                        <div className="text-xs text-gray-500 sm:text-sm">Parentesco</div>
                                        <p className="break-words text-sm font-medium sm:text-base">{patient.parentesco_emergencia}</p>
                                    </div>
                                )}

                                {patient.telefone_emergencia && (
                                    <div className="space-y-2">
                                        <div className="text-xs text-gray-500 sm:text-sm">Telefone</div>
                                        <p className="break-words text-sm font-medium sm:text-base">{formatTelefone(patient.telefone_emergencia, 'celular')}</p>
                                    </div>
                                )}
                            </div>

                            {patient.observacoes_emergencia && (
                                <div className="space-y-2 border-t pt-2">
                                    <div className="text-xs text-gray-500 sm:text-sm">Observações</div>
                                    <p className="break-words text-sm font-medium sm:text-base">{patient.observacoes_emergencia}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Informações Médicas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="size-5" />
                            Informações Médicas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 lg:space-y-6">
                        {patient.alergias_conhecidas && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500 sm:text-sm">
                                    <AlertTriangle className="size-3 text-red-500 sm:size-4" />
                                    Alergias Conhecidas
                                </div>
                                <div className="rounded-md border border-red-200 bg-red-50 p-2 sm:p-3">
                                    <p className="break-words text-sm text-red-800 sm:text-base">
                                        {Array.isArray(patient.alergias_conhecidas)
                                            ? patient.alergias_conhecidas.join(', ')
                                            : patient.alergias_conhecidas}
                                    </p>
                                </div>
                            </div>
                        )}

                        {patient.medicamentos_uso && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500 sm:text-sm">
                                    <Pill className="size-3 sm:size-4" />
                                    Medicamentos em Uso
                                </div>
                                <div className="rounded-md border border-blue-200 bg-blue-50 p-2 sm:p-3">
                                    <p className="break-words text-sm text-blue-800 sm:text-base">
                                        {Array.isArray(patient.medicamentos_uso)
                                            ? patient.medicamentos_uso.join(', ')
                                            : patient.medicamentos_uso}
                                    </p>
                                </div>
                            </div>
                        )}

                        {patient.historico_medico_detalhado && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500 sm:text-sm">
                                    <FileText className="size-3 sm:size-4" />
                                    Histórico Médico Detalhado
                                </div>
                                <div className="rounded-md border border-gray-200 bg-gray-50 p-2 sm:p-3">
                                    <p className="whitespace-pre-wrap break-words text-sm text-gray-800 sm:text-base">{patient.historico_medico_detalhado}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Observações */}
                {patient.observacoes_gerais && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="size-5" />
                                Observações Gerais
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-2 sm:p-3">
                                <p className="whitespace-pre-wrap break-words text-sm text-yellow-800 sm:text-base">{patient.observacoes_gerais}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4 lg:space-y-6">
                {/* Status e Informações Rápidas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Status do Paciente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 lg:space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 sm:text-sm">Status</span>
                            <Badge variant={patient.status === 'ativo' ? 'default' : 'secondary'}>
                                {patient.status === 'ativo' ? 'Ativo' : 'Inativo'}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 sm:text-sm">Cadastrado em</span>
                            <span className="text-xs font-medium sm:text-sm">{formatDate(patient.criado_em)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 sm:text-sm">Última atualização</span>
                            <span className="text-xs font-medium sm:text-sm">{formatDateTime(patient.atualizado_em)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Documentos do Paciente */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="size-5" />
                            Documentos
                        </CardTitle>
                        <CardDescription>
                            Documentos e arquivos do paciente
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DocumentList
                            patientId={patient.id}
                            showUpload={false}
                            showDownload={true}
                            compact={false}
                        />
                    </CardContent>
                </Card>

                {/* Histórico Médico */}
                <PatientHistory patientId={patient.id} />
            </div>
        </div>
    )
}
