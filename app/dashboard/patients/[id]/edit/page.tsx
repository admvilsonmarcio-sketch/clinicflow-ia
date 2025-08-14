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
        <div className="container mx-auto space-y-6 py-6">
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
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                                <User className="size-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Edit className="size-5" />
                                    Editar Paciente
                                </CardTitle>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Atualize as informações do paciente {patient.nome_completo}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full lg:w-auto px-3 py-2 text-sm" asChild>
                            <Link href="/dashboard/patients">
                                <ArrowLeft className="mr-2 size-4" />
                                <span className="block sm:hidden">Voltar</span>
                                <span className="hidden sm:block">Voltar para Lista</span>
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