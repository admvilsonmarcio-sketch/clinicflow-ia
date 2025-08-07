# Configuração da Funcionalidade "Esqueceu a Senha"

## 📋 Visão Geral

Este documento explica como configurar e usar a funcionalidade de recuperação de senha no MediFlow, que utiliza o Supabase Auth para envio de emails de recuperação.

## 🚀 Funcionalidades Implementadas

### ✅ Páginas Criadas
- `/auth/forgot-password` - Página para solicitar recuperação de senha
- `/auth/reset-password` - Página para redefinir a senha

### ✅ Componentes Criados
- `ForgotPasswordForm` - Formulário para solicitar recuperação
- `ResetPasswordForm` - Formulário para redefinir senha

### ✅ Recursos Implementados
- Validação de email com Zod
- Envio de email de recuperação via Supabase
- Verificação de código de recuperação
- Redefinição segura de senha
- Estados de loading e feedback visual
- Tratamento de erros específicos
- Interface responsiva e acessível

## ⚙️ Configuração do Supabase

### 1. Configuração de Email Templates

No painel do Supabase (https://app.supabase.com):

1. Vá para **Authentication > Email Templates**
2. Selecione **Reset Password**
3. Configure o template:

```html
<h2>Redefinir sua senha do MediFlow</h2>

<p>Olá,</p>

<p>Você solicitou a redefinição da sua senha no MediFlow.</p>

<p>Clique no link abaixo para redefinir sua senha:</p>

<p><a href="{{ .SiteURL }}/auth/reset-password?code={{ .TokenHash }}">Redefinir Senha</a></p>

<p>Se você não solicitou esta alteração, pode ignorar este email com segurança.</p>

<p>Este link expira em 1 hora.</p>

<p>Atenciosamente,<br>Equipe MediFlow</p>
```

### 2. Configuração de Site URL

1. Vá para **Authentication > URL Configuration**
2. Configure:
   - **Site URL**: `http://localhost:3000` (desenvolvimento) ou sua URL de produção
   - **Redirect URLs**: Adicione:
     - `http://localhost:3001/auth/reset-password`
     - `https://seudominio.com/auth/reset-password` (produção)

### 3. Configuração de SMTP (Opcional)

Para produção, configure um provedor SMTP:

1. Vá para **Authentication > Settings**
2. Em **SMTP Settings**, configure:
   - **Enable custom SMTP**: Ativado
   - **SMTP Host**: seu provedor (ex: smtp.gmail.com)
   - **SMTP Port**: 587 ou 465
   - **SMTP User**: seu email
   - **SMTP Pass**: sua senha de app
   - **SMTP Sender Name**: MediFlow
   - **SMTP Sender Email**: noreply@seudominio.com

## 🔧 Variáveis de Ambiente

Certifique-se de que as seguintes variáveis estão configuradas:

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
```

## 🧪 Como Testar

### 1. Teste Local

1. Inicie o servidor: `npm run dev`
2. Acesse: `http://localhost:3001/auth/login`
3. Clique em "Esqueceu a senha?"
4. Digite um email válido cadastrado
5. Verifique o email recebido
6. Clique no link do email
7. Defina uma nova senha

### 2. Fluxo Completo

```mermaid
graph TD
    A[Usuário clica "Esqueceu a senha?"] --> B[Página /auth/forgot-password]
    B --> C[Usuário digita email]
    C --> D[Supabase envia email]
    D --> E[Usuário recebe email]
    E --> F[Usuário clica no link]
    F --> G[Página /auth/reset-password]
    G --> H[Usuário define nova senha]
    H --> I[Redirecionamento para dashboard]
```

## 🛡️ Segurança Implementada

### ✅ Validações
- Validação de formato de email
- Validação de força da senha (mínimo 6 caracteres)
- Confirmação de senha obrigatória
- Verificação de código de recuperação

### ✅ Proteções
- Rate limiting automático do Supabase
- Links de recuperação com expiração (1 hora)
- Códigos únicos e seguros
- Sanitização de inputs
- Tratamento de erros sem exposição de dados

### ✅ UX/UI
- Estados de loading claros
- Mensagens de erro específicas
- Feedback visual de sucesso
- Interface responsiva
- Indicador de força da senha
- Botão para mostrar/ocultar senha

## 🐛 Troubleshooting

### Problema: Email não chega

**Possíveis causas:**
- Email está na pasta de spam
- SMTP não configurado corretamente
- Email não existe no sistema
- Rate limit atingido

**Soluções:**
1. Verificar pasta de spam
2. Configurar SMTP personalizado
3. Verificar logs do Supabase
4. Aguardar alguns minutos antes de tentar novamente

### Problema: Link inválido ou expirado

**Possíveis causas:**
- Link usado mais de uma vez
- Link expirou (1 hora)
- URL de redirecionamento incorreta

**Soluções:**
1. Solicitar novo link de recuperação
2. Verificar configuração de Redirect URLs
3. Verificar Site URL no Supabase

### Problema: Erro ao redefinir senha

**Possíveis causas:**
- Senha muito fraca
- Sessão expirada
- Erro de conectividade

**Soluções:**
1. Usar senha mais forte (8+ caracteres, maiúsculas, números)
2. Tentar novamente com novo link
3. Verificar conexão com internet

## 📝 Logs e Monitoramento

Para monitorar a funcionalidade:

1. **Supabase Dashboard**: Vá para Authentication > Users para ver tentativas
2. **Logs do Aplicativo**: Verifique console do navegador
3. **Logs do Servidor**: Verifique terminal do Next.js

## 🔄 Próximos Passos

- [ ] Implementar rate limiting personalizado
- [ ] Adicionar analytics de recuperação de senha
- [ ] Criar template de email personalizado
- [ ] Implementar notificação de mudança de senha
- [ ] Adicionar autenticação de dois fatores

## 📞 Suporte

Se encontrar problemas:

1. Verifique este documento
2. Consulte a documentação do Supabase Auth
3. Verifique os logs de erro
4. Teste em ambiente local primeiro

---

**Funcionalidade implementada com sucesso! ✅**

A recuperação de senha está totalmente funcional e segura, seguindo as melhores práticas de segurança e UX.