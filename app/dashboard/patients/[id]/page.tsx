import { createServerClient } from '@/lib/supabase-server'
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
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{patient.nome_completo}</h1>
                        <div className="flex items-center gap-4 mt-1">
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

                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Conversar
                    </Button>
                    <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Agendar
                    </Button>
                    <Button size="sm" asChild>
                        <Link href={`/dashboard/patients/${patient.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
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