import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, MessageCircle, Activity } from 'lucide-react'
import { getDashboardStats, getLeads } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const supabase = createServerClient()

  // Buscar estatísticas básicas do Supabase
  const { count: patientsCount } = await supabase
    .from('pacientes')
    .select('id', { count: 'exact' })
    .throwOnError()

  const { count: appointmentsToday } = await supabase
    .from('consultas')
    .select('id', { count: 'exact' })
    .gte('data_consulta', new Date().toISOString().split('T')[0])
    .lt('data_consulta', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .throwOnError()

  const { count: activeConversations } = await supabase
    .from('conversas')
    .select('id', { count: 'exact' })
    .eq('status', 'ativa')
    .throwOnError()

  // Buscar estatísticas do novo backend Node.js
  const clinicFlowStats = await getDashboardStats();
  const clinicFlowLeads = await getLeads();

  const combinedStats = [
    {
      title: 'Total de Pacientes (Supabase)',
      value: patientsCount || 0,
      icon: Users,
      description: 'Pacientes cadastrados no Supabase'
    },
    {
      title: 'Consultas Hoje (Supabase)',
      value: appointmentsToday || 0,
      icon: Calendar,
      description: 'Agendamentos para hoje no Supabase'
    },
    {
      title: 'Conversas Ativas (Supabase)',
      value: activeConversations || 0,
      icon: MessageCircle,
      description: 'Conversas ativas no Supabase'
    },
    {
      title: 'Total de Leads (ClinicFlow)',
      value: clinicFlowStats.data.total_leads || 0,
      icon: Users,
      description: 'Leads gerenciados pelo ClinicFlow API'
    },
    {
      title: 'Leads Qualificados (ClinicFlow)',
      value: clinicFlowStats.data.leads_qualificados || 0,
      icon: Activity,
      description: 'Leads qualificados pela IA do ClinicFlow'
    },
    {
      title: 'Agendamentos Pendentes (ClinicFlow)',
      value: clinicFlowStats.data.agendamentos_pendentes || 0,
      icon: Calendar,
      description: 'Agendamentos futuros pelo ClinicFlow API'
    },
    {
      title: 'Mensagens (24h ClinicFlow)',
      value: clinicFlowStats.data.mensagens_24h || 0,
      icon: MessageCircle,
      description: 'Mensagens processadas pelo ClinicFlow API nas últimas 24h'
    },
    {
      title: 'IA Ativa (Supabase)',
      value: '98%',
      icon: Activity,
      description: 'Taxa de resposta automática do Supabase'
    }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Dashboard ClinicFlow</h1>
        <p className="text-sm text-gray-600 sm:text-base">Visão geral integrada do seu consultório e automações</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {combinedStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium sm:text-sm">
                  {stat.title}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold sm:text-2xl">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leads Recentes (ClinicFlow API)</CardTitle>
          <CardDescription>
            Últimos leads capturados e processados pela API de automações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Última Interação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinicFlowLeads.data.map((lead: any) => (
                <TableRow key={lead.id}>
                  <TableCell>{lead.nome}</TableCell>
                  <TableCell>{lead.telefone}</TableCell>
                  <TableCell>{lead.status}</TableCell>
                  <TableCell>{lead.score}</TableCell>
                  <TableCell>{new Date(lead.ultima_interacao).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Consultas (Supabase)</CardTitle>
            <CardDescription>
              Agendamentos para as próximas horas no Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center text-gray-500">
              Nenhuma consulta agendada para hoje
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente (Supabase)</CardTitle>
            <CardDescription>
              Últimas interações e mensagens no Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center text-gray-500">
              Nenhuma atividade recente
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
