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
import DocumentList from './document-list'

interface PatientDetailsProps {
    patient: {
        id: string
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
        status: 'ativo' | 'inativo' | 'bloqueado'
        criado_em: string
        atualizado_em: string
    }
}

export function PatientDetails({ patient }: PatientDetailsProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR')
    }

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR')
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Coluna Principal */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                {/* Informações Básicas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Informações Básicas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 lg:space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                                    <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                                    Telefone
                                </div>
                                <p className="font-medium text-sm sm:text-base break-all">{patient.telefone}</p>
                            </div>

                            {patient.email && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                                        <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                                        Email
                                    </div>
                                    <p className="font-medium text-sm sm:text-base break-all">{patient.email}</p>
                                </div>
                            )}

                            {patient.data_nascimento && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                        Data de Nascimento
                                    </div>
                                    <p className="font-medium text-sm sm:text-base">{formatDate(patient.data_nascimento)}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                                    Gênero
                                </div>
                                <p className="font-medium text-sm sm:text-base">
                                    {patient.genero === 'masculino' ? 'Masculino' :
                                        patient.genero === 'feminino' ? 'Feminino' : 'Outro'}
                                </p>
                            </div>
                        </div>

                        {patient.endereco && (
                            <div className="space-y-2 pt-3 lg:pt-4 border-t">
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                                    Endereço
                                </div>
                                <p className="font-medium text-sm sm:text-base break-words">{patient.endereco}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Contato de Emergência */}
                {(patient.contato_emergencia || patient.telefone_emergencia) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                Contato de Emergência
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 lg:space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                                {patient.contato_emergencia && (
                                    <div className="space-y-2">
                                        <div className="text-xs sm:text-sm text-gray-500">Nome</div>
                                        <p className="font-medium text-sm sm:text-base break-words">{patient.contato_emergencia}</p>
                                    </div>
                                )}

                                {patient.telefone_emergencia && (
                                    <div className="space-y-2">
                                        <div className="text-xs sm:text-sm text-gray-500">Telefone</div>
                                        <p className="font-medium text-sm sm:text-base break-all">{patient.telefone_emergencia}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Informações Médicas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="h-5 w-5" />
                            Informações Médicas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 lg:space-y-6">
                        {patient.alergias && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                                    <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                                    Alergias
                                </div>
                                <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-red-800 text-sm sm:text-base break-words">{patient.alergias}</p>
                                </div>
                            </div>
                        )}

                        {patient.medicamentos && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                                    <Pill className="h-3 w-3 sm:h-4 sm:w-4" />
                                    Medicamentos em Uso
                                </div>
                                <div className="p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <p className="text-blue-800 text-sm sm:text-base break-words">{patient.medicamentos}</p>
                                </div>
                            </div>
                        )}

                        {patient.historico_medico && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                                    <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                                    Histórico Médico
                                </div>
                                <div className="p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-md">
                                    <p className="text-gray-800 text-sm sm:text-base whitespace-pre-wrap break-words">{patient.historico_medico}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Observações */}
                {patient.observacoes && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Observações Gerais
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                <p className="text-yellow-800 text-sm sm:text-base whitespace-pre-wrap break-words">{patient.observacoes}</p>
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
                            <span className="text-xs sm:text-sm text-gray-500">Status</span>
                            <Badge variant={patient.status === 'ativo' ? 'default' : 'secondary'}>
                                {patient.status === 'ativo' ? 'Ativo' : 'Inativo'}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-gray-500">Cadastrado em</span>
                            <span className="text-xs sm:text-sm font-medium">{formatDate(patient.criado_em)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-gray-500">Última atualização</span>
                            <span className="text-xs sm:text-sm font-medium">{formatDateTime(patient.atualizado_em)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Documentos do Paciente */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
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
                            compact={true}
                        />
                    </CardContent>
                </Card>

                {/* Histórico Médico */}
                <PatientHistory patientId={patient.id} />
            </div>
        </div>
    )
}