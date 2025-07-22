import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PatientForm } from '@/components/patients/patient-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default function NewPatientPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/patients">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Novo Paciente</h1>
                    <p className="text-gray-600">Cadastre um novo paciente no sistema</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informações do Paciente</CardTitle>
                    <CardDescription>
                        Preencha os dados do paciente. Campos marcados com * são obrigatórios.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PatientForm />
                </CardContent>
            </Card>
        </div>
    )
}