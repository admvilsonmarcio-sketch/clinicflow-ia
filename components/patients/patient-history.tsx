'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
    Calendar, 
    Clock, 
    FileText, 
    Stethoscope, 
    MessageSquare, 
    Activity,
    ChevronRight,
    Plus,
    Filter
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

interface Consultation {
    id: string
    data_consulta: string
    tipo: 'consulta' | 'retorno' | 'emergencia'
    status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada'
    motivo: string
    observacoes?: string
    diagnostico?: string
    prescricao?: string
    criado_em: string
}

interface Conversation {
    id: string
    titulo: string
    status: 'ativa' | 'arquivada' | 'resolvida'
    plataforma: 'whatsapp' | 'telegram' | 'sistema'
    criado_em: string
    ultima_mensagem?: string
    mensagens_count?: number
}

interface PatientHistoryProps {
    patientId: string
}

export default function PatientHistory({ patientId }: PatientHistoryProps) {
    const [consultations, setConsultations] = useState<Consultation[]>([])
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('consultas')

    const supabase = createClientComponentClient()

    useEffect(() => {
        fetchHistory()
    }, [patientId])

    const fetchHistory = async () => {
        try {
            setLoading(true)

            // Buscar consultas
            const { data: consultationsData, error: consultationsError } = await supabase
                .from('consultas')
                .select('*')
                .eq('paciente_id', patientId)
                .order('data_consulta', { ascending: false })
                .limit(10)

            if (consultationsError) {
                console.error('Erro ao buscar consultas:', consultationsError)
            } else {
                setConsultations(consultationsData || [])
            }

            // Buscar conversas
            const { data: conversationsData, error: conversationsError } = await supabase
                .from('conversas')
                .select(`
                    *,
                    mensagens(count)
                `)
                .eq('paciente_id', patientId)
                .order('criado_em', { ascending: false })
                .limit(10)

            if (conversationsError) {
                console.error('Erro ao buscar conversas:', conversationsError)
            } else {
                setConversations(conversationsData || [])
            }
        } catch (error) {
            console.error('Erro ao buscar histórico:', error)
        } finally {
            setLoading(false)
        }
    }

    const getConsultationStatusColor = (status: string) => {
        switch (status) {
            case 'agendada': return 'bg-blue-100 text-blue-800'
            case 'em_andamento': return 'bg-yellow-100 text-yellow-800'
            case 'concluida': return 'bg-green-100 text-green-800'
            case 'cancelada': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getConsultationTypeIcon = (tipo: string) => {
        switch (tipo) {
            case 'consulta': return <Stethoscope className="h-4 w-4" />
            case 'retorno': return <Activity className="h-4 w-4" />
            case 'emergencia': return <Clock className="h-4 w-4" />
            default: return <FileText className="h-4 w-4" />
        }
    }

    const getConversationStatusColor = (status: string) => {
        switch (status) {
            case 'ativa': return 'bg-green-100 text-green-800'
            case 'arquivada': return 'bg-gray-100 text-gray-800'
            case 'resolvida': return 'bg-blue-100 text-blue-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const formatDate = (dateString: string) => {
        return formatDistanceToNow(new Date(dateString), {
            addSuffix: true,
            locale: ptBR
        })
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Histórico Médico
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Carregando histórico...</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Histórico Médico
                </CardTitle>
                <CardDescription>
                    Consultas, conversas e atividades do paciente
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="consultas" className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4" />
                            Consultas ({consultations.length})
                        </TabsTrigger>
                        <TabsTrigger value="conversas" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Conversas ({conversations.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="consultas" className="space-y-4 mt-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-medium text-gray-700">
                                Últimas Consultas
                            </h3>
                            <Button size="sm" variant="outline" asChild>
                                <Link href={`/dashboard/consultations/new?patient=${patientId}`}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nova Consulta
                                </Link>
                            </Button>
                        </div>

                        {consultations.length > 0 ? (
                            <div className="space-y-3">
                                {consultations.map((consultation) => (
                                    <div
                                        key={consultation.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                {getConsultationTypeIcon(consultation.tipo)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium text-sm">
                                                        {consultation.motivo || 'Consulta médica'}
                                                    </h4>
                                                    <Badge 
                                                        variant="secondary" 
                                                        className={getConsultationStatusColor(consultation.status)}
                                                    >
                                                        {consultation.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(consultation.data_consulta).toLocaleDateString('pt-BR')}
                                                    </span>
                                                    <span>{formatDate(consultation.criado_em)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="ghost" asChild>
                                            <Link href={`/dashboard/consultations/${consultation.id}`}>
                                                <ChevronRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Stethoscope className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 mb-4">
                                    Nenhuma consulta registrada
                                </p>
                                <Button size="sm" asChild>
                                    <Link href={`/dashboard/consultations/new?patient=${patientId}`}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Agendar Primeira Consulta
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="conversas" className="space-y-4 mt-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-medium text-gray-700">
                                Conversas Recentes
                            </h3>
                            <Button size="sm" variant="outline" asChild>
                                <Link href={`/dashboard/conversations/new?patient=${patientId}`}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nova Conversa
                                </Link>
                            </Button>
                        </div>

                        {conversations.length > 0 ? (
                            <div className="space-y-3">
                                {conversations.map((conversation) => (
                                    <div
                                        key={conversation.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <MessageSquare className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium text-sm">
                                                        {conversation.titulo}
                                                    </h4>
                                                    <Badge 
                                                        variant="secondary" 
                                                        className={getConversationStatusColor(conversation.status)}
                                                    >
                                                        {conversation.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                                    <span className="capitalize">
                                                        {conversation.plataforma}
                                                    </span>
                                                    <span>{formatDate(conversation.criado_em)}</span>
                                                    {conversation.mensagens_count && (
                                                        <span>{conversation.mensagens_count} mensagens</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="ghost" asChild>
                                            <Link href={`/dashboard/conversations/${conversation.id}`}>
                                                <ChevronRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 mb-4">
                                    Nenhuma conversa registrada
                                </p>
                                <Button size="sm" asChild>
                                    <Link href={`/dashboard/conversations/new?patient=${patientId}`}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Iniciar Conversa
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}