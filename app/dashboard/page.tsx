import { createServerClient } from '@/lib/supabase-server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, MessageCircle, Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const supabase = createServerClient()

  // Buscar estatísticas básicas
  const { data: patientsCount } = await supabase
    .from('pacientes')
    .select('id', { count: 'exact' })

  const { data: appointmentsToday } = await supabase
    .from('consultas')
    .select('id', { count: 'exact' })
    .gte('data_consulta', new Date().toISOString().split('T')[0])
    .lt('data_consulta', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])

  const { data: activeConversations } = await supabase
    .from('conversas')
    .select('id', { count: 'exact' })
    .eq('status', 'ativa')

  const stats = [
    {
      title: 'Total de Pacientes',
      value: patientsCount?.length || 0,
      icon: Users,
      description: 'Pacientes cadastrados'
    },
    {
      title: 'Consultas Hoje',
      value: appointmentsToday?.length || 0,
      icon: Calendar,
      description: 'Agendamentos para hoje'
    },
    {
      title: 'Conversas Ativas',
      value: activeConversations?.length || 0,
      icon: MessageCircle,
      description: 'WhatsApp e Instagram'
    },
    {
      title: 'IA Ativa',
      value: '98%',
      icon: Activity,
      description: 'Taxa de resposta automática'
    }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Visão geral do seu consultório</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Consultas</CardTitle>
            <CardDescription>
              Agendamentos para as próximas horas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Nenhuma consulta agendada para hoje
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas interações e mensagens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Nenhuma atividade recente
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}