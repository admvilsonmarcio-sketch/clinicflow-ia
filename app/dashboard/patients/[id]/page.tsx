import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PatientDetails } from '@/components/patients/patient-details'
import { ArrowLeft, Edit, Calendar, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PatientPageProps {
    params: {
        id: string
    }
}

export default async function PatientPage({ params }: PatientPageProps) {
    const supabase = createServerClient()

    if (!supabase) {
        return <div>Carregando...</div>
    }

    // Buscar dados do paciente
    const { data: patient, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', params.id)
        .single()

    if (error || !patient) {
        notFound()
    }

    // Calcular idade se tiver data de nascimento
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/patients">
                            <ArrowLeft className="mr-2 size-4" />
                            Voltar
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{patient.nome_completo}</h1>
                        <div className="mt-1 flex items-center gap-4">
                            <p className="text-gray-600">
                                {patient.data_nascimento && `${calculateAge(patient.data_nascimento)} anos`}
                                {patient.genero && ` • ${patient.genero === 'masculino' ? 'Masculino' : patient.genero === 'feminino' ? 'Feminino' : 'Outro'}`}
                            </p>
                            <Badge variant={patient.status === 'ativo' ? 'default' : 'secondary'}>
                                {patient.status === 'ativo' ? 'Ativo' : 'Inativo'}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Botões de ação - Layout responsivo */}
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button 
                        size="sm"
                        className="w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
                    >
                        <MessageCircle className="mr-2 size-4" />
                        Conversar
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full border-green-600 text-green-600 hover:bg-green-50 sm:w-auto"
                    >
                        <Calendar className="mr-2 size-4" />
                        Agendar
                    </Button>
                    <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full border-gray-300 hover:border-blue-400 sm:w-auto"
                        asChild
                    >
                        <Link href={`/dashboard/patients/${patient.id}/edit`}>
                            <Edit className="mr-2 size-4" />
                            Editar
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Detalhes do Paciente */}
            <PatientDetails patient={patient} />
        </div>
    )
}