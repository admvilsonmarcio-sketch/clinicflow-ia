<div align="center">
  <img src="./public/logo.svg" alt="MediFlow Logo" width="300" height="90" />
  <h1>Sistema CRM completo para médicos e clínicas</h1>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Version-0.2.1-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Status-Fase%201%20Completa-green?style=flat-square" />
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

### ✅ Implementado (Fase 1)
- **🔐 Sistema de Autenticação** - Login seguro com Supabase Auth
- **👥 Gestão de Pacientes** - CRUD completo com validação robusta
- **🏥 Gestão de Clínicas** - Configuração completa de dados da clínica
- **👤 Perfis de Usuário** - Gestão de perfis médicos
- **📝 Validação Zod** - Validação robusta em todos os formulários
- **🔍 Logging Médico** - Auditoria completa com sanitização de dados
- **🚨 Tratamento de Erros** - Específico para área médica
- **🔒 Compliance LGPD/HIPAA** - Dados sensíveis protegidos

### 🔄 Em Desenvolvimento (Fase 2)
- **🔐 API Routes** - Validação server-side
- **🧪 Testes Automatizados** - Cobertura completa
- **📊 Sistema de Auditoria** - Dashboard de logs

### 📋 Planejado (Fase 3)
- **📅 Sistema de Agendamentos** - Integração Google Calendar
- **💬 Atendimento Automatizado** - WhatsApp/Instagram + IA
- **🤖 IA Contextual** - OpenAI GPT-4o + Embeddings
- **📊 Dashboard Analytics** - Métricas e relatórios

## 🛠️ Tecnologias

### Stack Principal
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth, Database, Functions, Vector Store)
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
│   ├── settings/         # Componentes de configurações
│   └── dashboard/        # Componentes do dashboard
├── lib/                  # Utilitários e configurações
│   ├── validations/      # Schemas Zod
│   ├── logging/          # Sistema de logging médico
│   ├── errors/           # Tratamento de erros
│   └── supabase.ts       # Cliente Supabase
├── types/                # Tipos TypeScript
├── docs/                 # Documentação completa
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

5. **Inicie o projeto**
```bash
npm run dev
```

6. **Acesse a aplicação**
- Abra http://localhost:3000
- Faça seu cadastro
- Configure sua clínica

### Scripts Disponíveis
```bash
npm run dev          # Inicia em desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia em produção
npm run lint         # Executa ESLint
npm run type-check   # Verifica tipos TypeScript
npm run validate-schema  # Valida schema vs types
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
- **Commits**: Seguir [Conventional Commits](./COMMIT-CONVENTIONS.md)
- **Código**: TypeScript + ESLint + Prettier
- **Testes**: Jest + Testing Library (Fase 2)
- **Documentação**: Sempre atualizar docs relevantes

### Áreas que Precisam de Ajuda
- 🧪 Testes automatizados
- 📱 Responsividade mobile
- 🌐 Internacionalização
- 📊 Dashboard analytics
- 🤖 Integração com IA

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
  <p><strong>MediFlow v0.2.1</strong> - Fase 1 Completa + Melhorias UX</p>
</div>

## 🎉 Status do Projeto - Fase 1 Completa!

**Versão:** 0.2.1 | **Data:** 29/12/2024 | **Status:** ✅ Fase 1 Completa + Melhorias UX

### 🚀 O que está PRONTO:
- ✅ **Sistema robusto e seguro** para profissionais de saúde
- ✅ **Validação Zod completa** em todos os formulários
- ✅ **Logging médico seguro** com sanitização de dados (LGPD/HIPAA)
- ✅ **CRUD completo de pacientes** (criar, visualizar, editar)
- ✅ **Tratamento de erros médicos** específico para área da saúde
- ✅ **Context API** para estado global
- ✅ **Schema 100% sincronizado** com banco de dados
- ✅ **Compliance médico** preparado para CFM/LGPD

### 📋 Documentação Completa:
- 👉 **[STATUS-PROJETO.md](./STATUS-PROJETO.md)** - Status detalhado sempre atualizado
- 📊 **[FASE1-RESUMO-IMPLEMENTACAO.md](./docs/FASE1-RESUMO-IMPLEMENTACAO.md)** - Resumo completo da Fase 1
- 🛠️ **[PLANO-MELHORIAS-CRITICAS.md](./docs/PLANO-MELHORIAS-CRITICAS.md)** - Plano técnico detalhado
- ✅ **[CHECKLIST-EXECUCAO.md](./docs/CHECKLIST-EXECUCAO.md)** - Checklist de implementação

### 🔄 Próximos Passos - Fase 2:
- 🔐 **API Routes** com validação server-side
- 🏥 **Sistema de auditoria** completa
- 🧪 **Testes automatizados**
- 📅 **Sistema de agendamentos**