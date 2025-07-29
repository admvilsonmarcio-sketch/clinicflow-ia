import { createServerClient } from '@/lib/supabase-server'
import { PatientFormWizard } from '@/components/patients/patient-form-wizard'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface EditPatientPageProps {
    params: {
        id: string
    }
}

export default async function EditPatientPage({ params }: EditPatientPageProps) {
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

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/patients/${params.id}`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Editar Paciente</h1>
                    <p className="text-gray-600">Atualize as informações de {patient.nome_completo}</p>
                </div>
            </div>

            <PatientFormWizard 
                initialData={patient} 
                mode="edit" 
            />
        </div>
    )
}