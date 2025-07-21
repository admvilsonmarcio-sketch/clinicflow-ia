import { createServerClient } from '@/lib/supabase-server'
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie suas preferências e integrações do sistema</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="clinic" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Clínica
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Integrações
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            IA
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WhatsApp */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
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
                  <MessageSquare className="h-5 w-5 text-pink-600" />
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
                  <Calendar className="h-5 w-5 text-blue-600" />
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
                  <Settings className="h-5 w-5 text-purple-600" />
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
                  <p className="text-xs text-gray-500 mt-1">
                    Respostas com confiança abaixo deste valor serão escaladas para humanos
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Horário de Funcionamento da IA</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input type="time" defaultValue="08:00" />
                    <Input type="time" defaultValue="18:00" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Mensagem de Saudação</label>
                  <textarea 
                    className="w-full p-3 border rounded-md"
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Novas mensagens</h4>
                    <p className="text-sm text-gray-500">Receber notificação de novas mensagens de pacientes</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Consultas agendadas</h4>
                    <p className="text-sm text-gray-500">Lembrete de consultas próximas</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">IA escalou conversa</h4>
                    <p className="text-sm text-gray-500">Quando a IA não conseguir responder e escalar para humano</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Relatórios semanais</h4>
                    <p className="text-sm text-gray-500">Resumo semanal de atividades</p>
                  </div>
                  <input type="checkbox" className="rounded" />
                </div>
              </div>
              <div className="border-t pt-4 mt-6">
                <TestNotifications />
              </div>
              
              <div className="flex justify-end mt-6">
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
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Senha Atual</label>
                  <Input type="password" placeholder="Digite sua senha atual" />
                </div>
                <div>
                  <label className="text-sm font-medium">Nova Senha</label>
                  <Input type="password" placeholder="Digite a nova senha" />
                </div>
                <div>
                  <label className="text-sm font-medium">Confirmar Nova Senha</label>
                  <Input type="password" placeholder="Confirme a nova senha" />
                </div>
                <div className="flex justify-end">
                  <Button>Alterar Senha</Button>
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">Sessão Atual</h4>
                      <p className="text-sm text-gray-500">Windows • Chrome • Agora</p>
                    </div>
                    <Badge variant="secondary">Ativo</Badge>
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