'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, User, Phone, Mail, Filter, X, Users } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'

interface Patient {
    id: string
    nome_completo: string
    email?: string
    telefone: string
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
                patient.telefone.includes(filters.search) ||
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
                    <p className="text-gray-600">Gerencie os pacientes da sua clínica</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/patients/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Paciente
                    </Link>
                </Button>
            </div>

            {/* Busca Avançada */}
            <Card>
                <CardContent className="p-6 space-y-4">
                    {/* Busca Principal */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Buscar pacientes por nome, telefone ou email..."
                                className="pl-10"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className={showFilters ? 'bg-blue-50 border-blue-200' : ''}
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filtros
                        </Button>
                        {hasActiveFilters && (
                            <Button variant="ghost" onClick={clearFilters}>
                                <X className="h-4 w-4 mr-2" />
                                Limpar
                            </Button>
                        )}
                    </div>

                    {/* Filtros Avançados */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
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
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Gênero</label>
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
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Idade Mínima</label>
                                <Input
                                    type="number"
                                    placeholder="Ex: 18"
                                    value={filters.idade_min}
                                    onChange={(e) => setFilters(prev => ({ ...prev, idade_min: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Idade Máxima</label>
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
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors space-y-3 sm:space-y-0 cursor-pointer"
                                    onDoubleClick={() => window.location.href = `/dashboard/patients/${patient.id}`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-blue-600 font-semibold">
                                                {patient.nome_completo.charAt(0).toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {patient.nome_completo}
                                            </h3>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-gray-500">
                                                {patient.telefone && (
                                                    <div className="flex items-center">
                                                        <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                                                        <span className="truncate">{patient.telefone}</span>
                                                    </div>
                                                )}
                                                {patient.email && (
                                                    <div className="flex items-center">
                                                        <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                                                        <span className="truncate">{patient.email}</span>
                                                    </div>
                                                )}
                                                {patient.data_nascimento && (
                                                    <div className="flex items-center">
                                                        <User className="h-3 w-3 mr-1 flex-shrink-0" />
                                                        <span className="truncate">{calculateAge(patient.data_nascimento)} anos</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end space-x-2">
                                        <Badge variant={patient.status === 'ativo' ? 'default' : patient.status === 'inativo' ? 'secondary' : 'destructive'}>
                                            {patient.status === 'ativo' ? 'Ativo' : patient.status === 'inativo' ? 'Inativo' : 'Bloqueado'}
                                        </Badge>

                                        <Button variant="outline" size="sm" asChild className="flex-shrink-0">
                                            <Link href={`/dashboard/patients/${patient.id}`}>
                                                <span className="hidden sm:inline">Ver Detalhes</span>
                                                <span className="sm:hidden">Ver</span>
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">
                                {filters.search || hasActiveFilters ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {filters.search || hasActiveFilters ? 'Tente ajustar os filtros de busca.' : 'Comece adicionando seu primeiro paciente.'}
                            </p>
                            <div className="mt-6">
                                {filters.search || hasActiveFilters ? (
                                    <Button variant="outline" onClick={clearFilters}>
                                        <X className="h-4 w-4 mr-2" />
                                        Limpar Filtros
                                    </Button>
                                ) : (
                                    <Button asChild>
                                        <Link href="/dashboard/patients/new">
                                            <Plus className="h-4 w-4 mr-2" />
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