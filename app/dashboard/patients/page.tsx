import { createServerClient } from '@/lib/supabase-server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search, Phone, Mail, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default async function PatientsPage() {
  const supabase = createServerClient()
  
  // Buscar pacientes
  const { data: patients, error } = await supabase
    .from('pacientes')
    .select('*')
    .order('criado_em', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-600">Gerencie seus pacientes e histórico médico</p>
        </div>
        
        <Button asChild>
          <Link href="/dashboard/patients/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Paciente
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Pacientes</CardTitle>
              <CardDescription>
                {patients?.length || 0} pacientes cadastrados
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar pacientes..."
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {patients && patients.length > 0 ? (
            <div className="space-y-4">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {patient.nome_completo.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {patient.nome_completo}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {patient.telefone && (
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {patient.telefone}
                          </div>
                        )}
                        {patient.email && (
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {patient.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      patient.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {patient.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                    
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/patients/${patient.id}`}>
                        Ver Detalhes
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