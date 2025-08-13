'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, User, Phone, Mail, Filter, X, Users, Trash2, MoreVertical } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from '@/components/ui/use-toast'

export const dynamic = 'force-dynamic'

interface Patient {
    id: string
    nome_completo: string
    email?: string
    telefone_celular?: string
    data_nascimento?: string
    genero?: 'masculino' | 'feminino' | 'outro'
    status: 'ativo' | 'inativo' | 'bloqueado'
    criado_em: string
}

interface SearchFilters {
    search: string
    status: string
    genero: string
    idade_min: string
    idade_max: string
}

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([])
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState<SearchFilters>({
        search: '',
        status: 'todos',
        genero: 'todos',
        idade_min: '',
        idade_max: ''
    })

    const supabase = createClientComponentClient()
    const { toast } = useToast()

    useEffect(() => {
        fetchPatients()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [patients, filters])

    const fetchPatients = async () => {
        try {
            const { data, error } = await supabase
                .from('pacientes')
                .select('*')
                .order('criado_em', { ascending: false })

            if (error) throw error
            setPatients(data || [])
        } catch (error) {
            console.error('Erro ao buscar pacientes:', error)
        } finally {
            setLoading(false)
        }
    }

    const deletePatient = async (patientId: string, patientName: string) => {
        try {
            // Primeiro, buscar todos os documentos do paciente
            const { data: documentos, error: docError } = await supabase
                .from('documentos_pacientes')
                .select('url_arquivo')
                .eq('paciente_id', patientId)

            if (docError) {
                console.error('Erro ao buscar documentos do paciente:', docError)
            }

            // Deletar os arquivos do storage
            if (documentos && documentos.length > 0) {
                const { deleteDocument } = await import('@/lib/supabase/storage')
                
                for (const doc of documentos) {
                    try {
                        // Extrair o caminho do arquivo da URL
                        const filePath = doc.url_arquivo.split('/').pop()
                        if (filePath) {
                            await deleteDocument(`documents/${filePath}`)
                        }
                    } catch (storageError) {
                        console.error('Erro ao deletar arquivo do storage:', storageError)
                        // Continua mesmo se houver erro ao deletar um arquivo específico
                    }
                }
            }

            // Deletar os registros de documentos do banco
            const { error: deleteDocsError } = await supabase
                .from('documentos_pacientes')
                .delete()
                .eq('paciente_id', patientId)

            if (deleteDocsError) {
                console.error('Erro ao deletar documentos do banco:', deleteDocsError)
            }

            // Deletar o paciente
            const { error } = await supabase
                .from('pacientes')
                .delete()
                .eq('id', patientId)

            if (error) {
                console.error('Erro ao excluir paciente:', error)
                toast({
                    title: "Erro ao excluir paciente",
                    description: error.message,
                    variant: "destructive"
                })
                return
            }

            // Atualizar a lista removendo o paciente excluído
            setPatients(prev => prev.filter(p => p.id !== patientId))

            toast({
                title: "Paciente excluído com sucesso!",
                description: `${patientName} foi removido do sistema junto com todos os seus documentos.`,
                variant: "default",
                className: "border-green-500 bg-green-50 text-green-900"
            })
        } catch (error) {
            console.error('Erro ao excluir paciente:', error)
            toast({
                title: "Erro ao excluir paciente",
                description: "Ocorreu um erro inesperado. Tente novamente.",
                variant: "destructive"
            })
        }
    }

    const calculateAge = (birthDate: string) => {
        const today = new Date()
        const birth = new Date(birthDate)
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--
        }

        return age
    }

    const applyFilters = () => {
        let filtered = patients

        // Filtro de busca por texto
        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            filtered = filtered.filter(patient =>
                patient.nome_completo.toLowerCase().includes(searchLower) ||
                (patient.telefone_celular && patient.telefone_celular.includes(filters.search)) ||
                (patient.email && patient.email.toLowerCase().includes(searchLower))
            )
        }

        // Filtro por status
        if (filters.status !== 'todos') {
            filtered = filtered.filter(patient => patient.status === filters.status)
        }

        // Filtro por gênero
        if (filters.genero !== 'todos') {
            filtered = filtered.filter(patient => patient.genero === filters.genero)
        }

        // Filtro por idade
        if (filters.idade_min || filters.idade_max) {
            filtered = filtered.filter(patient => {
                if (!patient.data_nascimento) return false
                const age = calculateAge(patient.data_nascimento)
                const minAge = filters.idade_min ? parseInt(filters.idade_min) : 0
                const maxAge = filters.idade_max ? parseInt(filters.idade_max) : 150
                return age >= minAge && age <= maxAge
            })
        }

        setFilteredPatients(filtered)
    }

    const clearFilters = () => {
        setFilters({
            search: '',
            status: 'todos',
            genero: 'todos',
            idade_min: '',
            idade_max: ''
        })
    }

    const hasActiveFilters = filters.status !== 'todos' || filters.genero !== 'todos' || filters.idade_min || filters.idade_max

    if (loading) {
        return <div>Carregando...</div>
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
                    <p className="text-gray-600">Gerencie os pacientes da sua clínica</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/patients/new">
                        <Plus className="mr-2 size-4" />
                        Novo Paciente
                    </Link>
                </Button>
            </div>

            {/* Busca Avançada */}
            <Card>
                <CardContent className="space-y-4 p-6">
                    {/* Busca Principal */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Buscar pacientes por nome, telefone celular ou email..."
                                className="pl-10"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className={showFilters ? 'border-blue-200 bg-blue-50' : ''}
                        >
                            <Filter className="mr-2 size-4" />
                            Filtros
                        </Button>
                        {hasActiveFilters && (
                            <Button variant="ghost" onClick={clearFilters}>
                                <X className="mr-2 size-4" />
                                Limpar
                            </Button>
                        )}
                    </div>

                    {/* Filtros Avançados */}
                    {showFilters && (
                        <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos</SelectItem>
                                        <SelectItem value="ativo">Ativo</SelectItem>
                                        <SelectItem value="inativo">Inativo</SelectItem>
                                        <SelectItem value="bloqueado">Bloqueado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Gênero</label>
                                <Select value={filters.genero} onValueChange={(value) => setFilters(prev => ({ ...prev, genero: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos</SelectItem>
                                        <SelectItem value="masculino">Masculino</SelectItem>
                                        <SelectItem value="feminino">Feminino</SelectItem>
                                        <SelectItem value="outro">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Idade Mínima</label>
                                <Input
                                    type="number"
                                    placeholder="Ex: 18"
                                    value={filters.idade_min}
                                    onChange={(e) => setFilters(prev => ({ ...prev, idade_min: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Idade Máxima</label>
                                <Input
                                    type="number"
                                    placeholder="Ex: 65"
                                    value={filters.idade_max}
                                    onChange={(e) => setFilters(prev => ({ ...prev, idade_max: e.target.value }))}
                                />
                            </div>
                        </div>
                    )}

                    {/* Resultados */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{filteredPatients.length} paciente(s) encontrado(s)</span>
                        {hasActiveFilters && (
                            <span className="text-blue-600">Filtros ativos</span>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Pacientes */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Lista de Pacientes</CardTitle>
                    <CardDescription>
                        {filteredPatients.length} paciente(s) encontrado(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredPatients && filteredPatients.length > 0 ? (
                        <div className="space-y-4">
                            {filteredPatients.map((patient: any) => (
                                <div
                                    key={patient.id}
                                    className="flex cursor-pointer flex-col space-y-3 rounded-lg border p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
                                    onDoubleClick={() => window.location.href = `/dashboard/patients/${patient.id}`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                                            <span className="font-semibold text-blue-600">
                                                {patient.nome_completo.charAt(0).toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate font-semibold text-gray-900">
                                                {patient.nome_completo}
                                            </h3>
                                            <div className="flex flex-col space-y-1 text-sm text-gray-500 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                                                {patient.telefone_celular && (
                                                    <div className="flex items-center">
                                                        <Phone className="mr-1 size-3 shrink-0" />
                                                        <span className="truncate">{patient.telefone_celular}</span>
                                                    </div>
                                                )}
                                                {patient.email && (
                                                    <div className="flex items-center">
                                                        <Mail className="mr-1 size-3 shrink-0" />
                                                        <span className="truncate">{patient.email}</span>
                                                    </div>
                                                )}
                                                {patient.data_nascimento && (
                                                    <div className="flex items-center">
                                                        <User className="mr-1 size-3 shrink-0" />
                                                        <span className="truncate">{calculateAge(patient.data_nascimento)} anos</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between space-x-2 sm:justify-end">
                                        <Badge variant={patient.status === 'ativo' ? 'default' : patient.status === 'inativo' ? 'secondary' : 'destructive'}>
                                            {patient.status === 'ativo' ? 'Ativo' : patient.status === 'inativo' ? 'Inativo' : 'Bloqueado'}
                                        </Badge>

                                        <div className="flex items-center space-x-2">
                                            <Button variant="outline" size="sm" asChild className="shrink-0">
                                                <Link href={`/dashboard/patients/${patient.id}`}>
                                                    <span className="hidden sm:inline">Ver Detalhes</span>
                                                    <span className="sm:hidden">Ver</span>
                                                </Link>
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm" className="shrink-0">
                                                        <MoreVertical className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                                <Trash2 className="mr-2 size-4" />
                                                                Excluir Paciente
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Tem certeza que deseja excluir o paciente <strong>{patient.nome_completo}</strong>?
                                                                    Esta ação não pode ser desfeita e todos os dados relacionados serão permanentemente removidos.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => deletePatient(patient.id, patient.nome_completo)}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Excluir
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <Users className="mx-auto size-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">
                                {filters.search || hasActiveFilters ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {filters.search || hasActiveFilters ? 'Tente ajustar os filtros de busca.' : 'Comece adicionando seu primeiro paciente.'}
                            </p>
                            <div className="mt-6">
                                {filters.search || hasActiveFilters ? (
                                    <Button variant="outline" onClick={clearFilters}>
                                        <X className="mr-2 size-4" />
                                        Limpar Filtros
                                    </Button>
                                ) : (
                                    <Button asChild>
                                        <Link href="/dashboard/patients/new">
                                            <Plus className="mr-2 size-4" />
                                            Novo Paciente
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
