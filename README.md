# 🏥 MediFlow - CRM Médico Completo

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Status-Fases_1--3_Completas-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Versão-0.3.0-blue?style=for-the-badge" alt="Versão" />
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Version-0.3.0-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Status-Sistema%20de%20Documentos%20Completo-green?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" />
  <img src="https://img.shields.io/badge/LGPD-Compliant-purple?style=flat-square" />
</div>

<p align="center">
  <strong>Atendimento automatizado via WhatsApp/Instagram • IA contextual • Agendamentos integrados</strong>
</p>

<p align="center">
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#-tecnologias">Tecnologias</a> •
  <a href="#-instalação">Instalação</a> •
  <a href="#-contribuição">Contribuição</a> •
  <a href="#-licença">Licença</a>
</p>

## 🚀 Funcionalidades

### ✅ Implementado (Fases 1-3)
- **🔐 Sistema de Autenticação** - Login seguro com Supabase Auth
- **👥 Gestão de Pacientes** - CRUD completo com validação robusta
- **📄 Sistema de Documentos** - Upload, categorização e gerenciamento de arquivos
- **☁️ Supabase Storage** - Armazenamento seguro com RLS
- **🏥 Gestão de Clínicas** - Configuração completa de dados da clínica
- **👤 Perfis de Usuário** - Gestão de perfis médicos
- **📝 Validação Zod** - Validação robusta em todos os formulários
- **🔍 Logging Médico** - Auditoria completa com sanitização de dados
- **🚨 Tratamento de Erros** - Específico para área médica
- **🔒 Compliance LGPD/HIPAA** - Dados sensíveis protegidos

### 🔄 Em Desenvolvimento (Fase 4)
- **🔐 API Routes** - Validação server-side com Zod
- **📅 Sistema de Agendamentos** - Calendário interativo
- **🤖 Atendimento Automatizado** - IA contextual via WhatsApp
- **🧪 Testes Automatizados** - Cobertura completa
- **🔍 Sistema de Auditoria** - Rastreabilidade completa

### 📋 Planejado (Fase 5)
- **🔗 Integração Google Calendar** - Sincronização de agendamentos
- **🤖 N8N Workflows** - Automação avançada
- **🧠 IA Avançada** - Base de conhecimento personalizada
- **📊 Relatórios e Analytics** - Dashboard de métricas

## 🛠️ Tecnologias

### Stack Principal
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage, Functions)
- **Armazenamento**: Supabase Storage + Row Level Security
- **Validação**: Zod + React Hook Form
- **Estado**: Context API + React Hooks
- **Estilização**: Tailwind CSS + shadcn/ui
- **Banco de Dados**: PostgreSQL (Supabase)

### Futuras Integrações
- **Mensageria**: N8N + EvolutionAPI
- **IA**: OpenAI GPT-4o + Embeddings
- **Automação**: N8N workflows
- **Calendário**: Google Calendar API

## 📁 Estrutura do Projeto

```
mediflow/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Páginas do dashboard
│   ├── api/              # API Routes (Fase 2)
│   └── auth/             # Páginas de autenticação
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── patients/         # Componentes de pacientes
│   ├── documents/        # Sistema de documentos
│   ├── settings/         # Componentes de configurações
│   └── dashboard/        # Componentes do dashboard
├── lib/                  # Utilitários e configurações
│   ├── validations/      # Schemas Zod
│   ├── logging/          # Sistema de logging médico
│   ├── errors/           # Tratamento de erros
│   └── supabase.ts       # Cliente Supabase
├── types/                # Tipos TypeScript
├── docs/                 # Documentação essencial
│   ├── technical-roadmap.md    # Roadmap técnico
│   ├── database-setup.sql      # Schema do banco
│   ├── TROUBLESHOOTING.md      # Soluções para problemas
│   ├── GITHUB-SETUP.md         # Setup do GitHub
│   ├── COMMIT-CONVENTIONS.md   # Convenções de commit
│   └── CONTRIBUTING.md         # Guia de contribuição
├── scripts/              # Scripts de validação
└── database-schema.sql   # Schema do banco
```

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/mediflow.git
cd mediflow
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

4. **Configure o banco de dados**
- Acesse seu projeto no Supabase
- Vá para SQL Editor
- Execute o conteúdo de `database-schema.sql`

5. **Configure o Supabase Storage**
- Crie um bucket chamado `documents` no Supabase Storage
- Configure as políticas de RLS para o bucket
- Verifique se o bucket está público para leitura

6. **Inicie o projeto**
```bash
npm run dev
```

7. **Acesse a aplicação**
- Abra http://localhost:3000
- Faça seu cadastro
- Configure sua clínica

### Scripts Disponíveis
```bash
npm run dev              # Inicia servidor de desenvolvimento
npm run build            # Build para produção
npm run start            # Inicia servidor de produção
npm run lint             # Executa ESLint
npm run lint:fix         # Corrige problemas do ESLint automaticamente
npm run type-check       # Verifica tipos TypeScript
npm run db:types         # Gera tipos do Supabase
npm run validate-schema  # Valida schema do banco
npm run init-storage     # Inicializa Supabase Storage
npm test                 # Executa testes (Fase 4)
```

## 🤝 Contribuição

Contribuições são bem-vindas! Este projeto segue as melhores práticas para sistemas médicos.

### Como Contribuir

1. **Fork o projeto**
2. **Crie uma branch** (`git checkout -b feature/nova-funcionalidade`)
3. **Commit suas mudanças** (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. **Push para a branch** (`git push origin feature/nova-funcionalidade`)
5. **Abra um Pull Request**

### Padrões do Projeto
- **Commits**: Seguir [Conventional Commits](./docs/COMMIT-CONVENTIONS.md)
- **Código**: TypeScript + ESLint + Prettier
- **Testes**: Jest + Testing Library (Fase 4)
- **Documentação**: Sempre atualizar docs relevantes

### Áreas que Precisam de Ajuda
- 🧪 Testes automatizados
- 🔐 API Routes com validação server-side
- 📅 Sistema de agendamentos
- 🤖 Atendimento automatizado via WhatsApp
- 📊 Dashboard analytics

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

## 🏥 Para Profissionais de Saúde

O MediFlow foi desenvolvido pensando na segurança e compliance necessários para a área médica:

- ✅ **LGPD Compliant** - Dados pessoais protegidos
- ✅ **Logs Sanitizados** - Informações sensíveis nunca expostas
- ✅ **Auditoria Completa** - Rastreabilidade de todas as ações
- ✅ **Validação Robusta** - Prevenção de erros críticos
- ✅ **Preparado para CFM** - Seguindo diretrizes médicas

---

<div align="center">
  <p>Desenvolvido com ❤️ para profissionais de saúde</p>
  <p><strong>MediFlow v0.3.0</strong> - Sistema de Documentos Completo</p>
</div>

## 📊 Métricas do Projeto

### 🎯 Status Atual
- **Versão:** 0.3.0
- **Arquivos criados:** 40+
- **Linhas de código:** ~4.200+
- **Componentes UI:** 14+ componentes funcionais
- **Páginas funcionais:** 8 páginas completas
- **Tabelas no banco:** 11 tabelas principais
- **Tempo de desenvolvimento:** ~16 horas

### 📋 Documentação
- 📊 **[STATUS-PROJETO.md](./STATUS-PROJETO.md)** - Status detalhado sempre atualizado
- 🛠️ **[technical-roadmap.md](./docs/technical-roadmap.md)** - Roadmap técnico completo
- 🔧 **[TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)** - Soluções para problemas
- 📝 **[CONTRIBUTING.md](./docs/CONTRIBUTING.md)** - Guia de contribuição