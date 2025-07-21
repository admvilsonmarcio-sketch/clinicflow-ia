# 🚀 Setup do MediFlow

Guia completo para configurar o projeto MediFlow em seu ambiente local.

## 📋 Pré-requisitos

### Obrigatórios
- **Node.js** 18.0.0 ou superior
- **npm** 9.0.0 ou superior (ou yarn)
- **Git** para controle de versão
- **Conta no Supabase** (gratuita)

### Opcionais (para funcionalidades avançadas)
- **Conta OpenAI** (para IA)
- **Google Cloud Console** (para Calendar)
- **Meta Developer** (para WhatsApp/Instagram)
- **N8N** (para automações)

## 🔧 Instalação

### 1. Clone o Repositório
```bash
git clone https://github.com/SEU_USUARIO/mediflow.git
cd mediflow
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Configure o Supabase

#### 3.1 Criar Projeto
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Escolha organização e nome do projeto
4. Defina senha do banco de dados
5. Selecione região (preferencialmente São Paulo)

#### 3.2 Executar Schema
1. No dashboard do Supabase, vá em **SQL Editor**
2. Copie todo o conteúdo do arquivo `database-schema.sql`
3. Cole no editor e execute (RUN)
4. Verifique se todas as tabelas foram criadas

#### 3.3 Configurar RLS (Row Level Security)
- As políticas já estão no schema
- Verifique se RLS está habilitado em todas as tabelas

### 4. Configure Variáveis de Ambiente

#### 4.1 Copie o arquivo de exemplo
```bash
cp .env.local.example .env.local
```

#### 4.2 Obtenha as credenciais do Supabase
1. No dashboard: **Settings** → **API**
2. Copie:
   - **Project URL**
   - **anon public key** (NÃO a service_role!)

#### 4.3 Edite o .env.local
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (sua chave anon)

# Outras configurações (opcional por enquanto)
OPENAI_API_KEY=sk-... (quando implementar IA)
```

### 5. Inicie o Projeto
```bash
npm run dev
```

Acesse: http://localhost:3000

## ✅ Verificação da Instalação

### Teste Básico
1. **Página inicial** deve carregar sem erros
2. **Criar conta** deve funcionar
3. **Login** deve redirecionar para dashboard
4. **Navegação** entre páginas deve funcionar

### Teste do Banco
1. Crie uma conta de teste
2. Verifique se o perfil foi criado na tabela `perfis`
3. Teste navegação entre páginas do dashboard

### Solução de Problemas Comuns

#### Erro: "Module not found"
```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

#### Erro: "Forbidden use of secret API key"
- Verifique se está usando a chave **anon** (não service_role)
- A chave anon começa com `eyJ...`

#### Erro: Tailwind não carrega
```bash
# Limpe cache do Next.js
rm -rf .next
npm run dev
```

#### Erro: Banco de dados
- Verifique se executou o schema completo
- Confirme se RLS está habilitado
- Teste conexão no SQL Editor

## 🔧 Configurações Avançadas

### Desenvolvimento com HTTPS Local
```bash
# Instale mkcert
npm install -g mkcert

# Crie certificados
mkcert localhost

# Configure Next.js para HTTPS
# (adicione configuração no next.config.js)
```

### Configurar Prettier/ESLint
```bash
# Instalar dependências de desenvolvimento
npm install -D prettier eslint-config-prettier

# Criar .prettierrc
echo '{"semi": false, "singleQuote": true}' > .prettierrc
```

### Configurar Husky (Git Hooks)
```bash
# Instalar husky
npm install -D husky

# Configurar pre-commit
npx husky add .husky/pre-commit "npm run lint"
```

## 📊 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa linting

# Banco de dados
npm run db:types     # Gera tipos TypeScript do Supabase
npm run db:reset     # Reseta banco (cuidado!)

# Testes (quando implementados)
npm run test         # Executa testes
npm run test:watch   # Testes em modo watch
```

## 🌐 Deploy

### Vercel (Recomendado)
1. Conecte repositório GitHub à Vercel
2. Configure variáveis de ambiente
3. Deploy automático a cada push

### Outras Plataformas
- **Netlify**: Suporte completo ao Next.js
- **Railway**: Boa para full-stack
- **Heroku**: Configuração manual necessária

## 📚 Próximos Passos

Após setup básico:

1. **Leia a documentação**: `STATUS-PROJETO.md`
2. **Configure integrações**: WhatsApp, Google Calendar
3. **Personalize**: Cores, logo, textos
4. **Contribua**: Veja `CONTRIBUTING.md`

## 🆘 Suporte

### Documentação
- `README.md` - Visão geral
- `STATUS-PROJETO.md` - Status atual
- `TROUBLESHOOTING.md` - Problemas comuns
- `CONTRIBUTING.md` - Como contribuir

### Comunidade
- **Issues**: Para bugs e features
- **Discussions**: Para dúvidas
- **Discord**: [Em breve]

### Contato Direto
- Email: suporte@mediflow.com
- WhatsApp: [Em breve]

---

**🎉 Parabéns! Seu MediFlow está pronto para uso!**