import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ProfileForm } from '@/components/settings/profile-form'
import { ClinicForm } from '@/components/settings/clinic-form'
import { TestNotifications } from '@/components/settings/test-notifications'
import {
  Settings,
  User,
  Building2,
  MessageSquare,
  Calendar,
  Brain,
  Shield,
  Bell,
  Palette,
  Database
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Buscar dados do perfil e clínica
  const { data: profile } = await supabase
    .from('perfis')
    .select('*, clinicas(*)')
    .eq('id', session?.user.id)
    .single()

  // Buscar integrações ativas
  const { data: integrations } = await supabase
    .from('integracoes')
    .select('*')
    .eq('clinica_id', profile?.clinica_id)

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Configurações</h1>
        <p className="text-sm text-gray-600 md:text-base">Gerencie suas preferências e integrações do sistema</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center gap-1 text-xs md:gap-2 md:text-sm">
            <User className="size-3 md:size-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="clinic" className="flex items-center gap-1 text-xs md:gap-2 md:text-sm">
            <Building2 className="size-3 md:size-4" />
            <span className="hidden sm:inline">Clínica</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-1 text-xs md:gap-2 md:text-sm">
            <MessageSquare className="size-3 md:size-4" />
            <span className="hidden sm:inline">Integrações</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-1 text-xs md:gap-2 md:text-sm">
            <Brain className="size-3 md:size-4" />
            <span className="hidden sm:inline">IA</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1 text-xs md:gap-2 md:text-sm">
            <Bell className="size-3 md:size-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1 text-xs md:gap-2 md:text-sm">
            <Shield className="size-3 md:size-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
        </TabsList>

        {/* Aba Perfil */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações de perfil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm profile={profile} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Clínica */}
        <TabsContent value="clinic">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Clínica</CardTitle>
              <CardDescription>
                Informações do seu consultório ou clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClinicForm
                clinic={profile?.clinicas}
                clinicId={profile?.clinica_id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Integrações */}
        <TabsContent value="integrations">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-2">
            {/* WhatsApp */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="size-5 text-green-600" />
                  WhatsApp Business
                </CardTitle>
                <CardDescription>
                  Conecte sua conta do WhatsApp para atendimento automatizado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge variant="destructive">Desconectado</Badge>
                  </div>
                  <Button className="w-full">Conectar WhatsApp</Button>
                </div>
              </CardContent>
            </Card>

            {/* Instagram */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="size-5 text-pink-600" />
                  Instagram
                </CardTitle>
                <CardDescription>
                  Conecte seu Instagram para receber mensagens diretas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge variant="destructive">Desconectado</Badge>
                  </div>
                  <Button className="w-full">Conectar Instagram</Button>
                </div>
              </CardContent>
            </Card>

            {/* Google Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="size-5 text-blue-600" />
                  Google Calendar
                </CardTitle>
                <CardDescription>
                  Sincronize seus agendamentos com o Google Calendar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge variant="destructive">Desconectado</Badge>
                  </div>
                  <Button className="w-full">Conectar Google Calendar</Button>
                </div>
              </CardContent>
            </Card>

            {/* N8N */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="size-5 text-purple-600" />
                  N8N Automação
                </CardTitle>
                <CardDescription>
                  Configure workflows de automação avançados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge variant="destructive">Desconectado</Badge>
                  </div>
                  <Button className="w-full">Configurar N8N</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba IA */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de IA</CardTitle>
              <CardDescription>
                Configure o comportamento da inteligência artificial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Modelo de IA</label>
                  <div className="mt-2">
                    <Badge>GPT-4o (OpenAI)</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Nível de Confiança Mínimo</label>
                  <Input
                    type="number"
                    defaultValue="0.8"
                    min="0"
                    max="1"
                    step="0.1"
                    placeholder="0.8"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Respostas com confiança abaixo deste valor serão escaladas para humanos
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Horário de Funcionamento da IA</label>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Input type="time" defaultValue="08:00" />
                    <Input type="time" defaultValue="18:00" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Mensagem de Saudação</label>
                  <textarea
                    className="w-full rounded-md border p-3"
                    rows={3}
                    defaultValue="Olá! Sou a assistente virtual da clínica. Como posso ajudá-lo hoje?"
                    placeholder="Digite a mensagem de saudação..."
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Salvar Configurações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Notificações */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>
                Configure como e quando receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium sm:text-base">Novas mensagens</h4>
                    <p className="text-xs text-gray-500 sm:text-sm">Receber notificação de novas mensagens de pacientes</p>
                  </div>
                  <input type="checkbox" defaultChecked className="self-start rounded sm:self-center" />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium sm:text-base">Consultas agendadas</h4>
                    <p className="text-xs text-gray-500 sm:text-sm">Lembrete de consultas próximas</p>
                  </div>
                  <input type="checkbox" defaultChecked className="self-start rounded sm:self-center" />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium sm:text-base">IA escalou conversa</h4>
                    <p className="text-xs text-gray-500 sm:text-sm">Quando a IA não conseguir responder e escalar para humano</p>
                  </div>
                  <input type="checkbox" defaultChecked className="self-start rounded sm:self-center" />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium sm:text-base">Relatórios semanais</h4>
                    <p className="text-xs text-gray-500 sm:text-sm">Resumo semanal de atividades</p>
                  </div>
                  <input type="checkbox" className="self-start rounded sm:self-center" />
                </div>
              </div>
              <div className="mt-6 border-t pt-4">
                <TestNotifications />
              </div>

              <div className="mt-6 flex justify-end">
                <Button>Salvar Preferências</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Segurança */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Mantenha sua conta segura com uma senha forte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-sm font-medium">Senha Atual</label>
                  <Input type="password" placeholder="Digite sua senha atual" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Nova Senha</label>
                  <Input type="password" placeholder="Digite a nova senha" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Confirmar Nova Senha</label>
                  <Input type="password" placeholder="Confirme a nova senha" className="mt-1" />
                </div>
                <div className="flex justify-end pt-2">
                  <Button className="w-full sm:w-auto">Alterar Senha</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sessões Ativas</CardTitle>
                <CardDescription>
                  Gerencie onde você está logado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col gap-2 rounded border p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium sm:text-base">Sessão Atual</h4>
                      <p className="text-xs text-gray-500 sm:text-sm">Windows • Chrome • Agora</p>
                    </div>
                    <Badge variant="secondary" className="self-start sm:self-center">Ativo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
