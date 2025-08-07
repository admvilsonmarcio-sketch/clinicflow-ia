import { createServerClient } from '@/lib/supabase/server'
import { PatientFormWizard } from '@/components/patients/patient-form-wizard'
import { ArrowLeft, User, Edit } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
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
        <div className="container mx-auto py-6 space-y-6">
            {/* Breadcrumb Navigation */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard">Dashboard</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard/patients">Pacientes</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={`/dashboard/patients/${patient.id}`}>{patient.nome_completo}</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Editar</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Edit className="h-5 w-5" />
                                    Editar Paciente
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Atualize as informações do paciente {patient.nome_completo}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard/patients">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar para Lista
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
            </Card>
            
            {/* Form Section */}
            <PatientFormWizard 
                initialData={patient} 
                mode="edit" 
            />
        </div>
    )
}