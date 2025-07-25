import { createServerClient } from '@/lib/supabase-server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search, Phone, Mail, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PatientsPage() {
  const supabase = createServerClient()

  // Buscar pacientes
  const { data: patients, error } = await supabase
    .from('pacientes')
    .select('*')
    .order('criado_em', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-sm sm:text-base text-gray-600">Gerencie seus pacientes e histórico médico</p>
        </div>

        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/patients/new">
            <Plus className="h-4 w-4 mr-2" />
            <span className="sm:inline">Novo Paciente</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <CardTitle className="text-lg sm:text-xl">Lista de Pacientes</CardTitle>
              <CardDescription>
                {patients?.length || 0} pacientes cadastrados
              </CardDescription>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar pacientes..."
                  className="pl-10 w-full"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {patients && patients.length > 0 ? (
            <div className="space-y-4">
              {patients.map((patient: any) => (
                <div
                  key={patient.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors space-y-3 sm:space-y-0"
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
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${patient.status === 'ativo'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}>
                      {patient.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>

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
                Nenhum paciente cadastrado
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece adicionando seu primeiro paciente.
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/dashboard/patients/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Paciente
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}