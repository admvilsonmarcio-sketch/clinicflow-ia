# 🏥 MediFlow

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</div>

<div align="center">
  <img src="https://img.shields.io/github/license/SEU_USUARIO/mediflow?style=flat-square" />
  <img src="https://img.shields.io/github/stars/SEU_USUARIO/mediflow?style=flat-square" />
  <img src="https://img.shields.io/github/forks/SEU_USUARIO/mediflow?style=flat-square" />
  <img src="https://img.shields.io/github/issues/SEU_USUARIO/mediflow?style=flat-square" />
</div>

<p align="center">
  <strong>Sistema CRM completo para médicos e clínicas</strong><br>
  Atendimento automatizado via WhatsApp/Instagram • IA contextual • Agendamentos integrados
</p>

<p align="center">
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#-tecnologias">Tecnologias</a> •
  <a href="#-instalação">Instalação</a> •
  <a href="#-contribuição">Contribuição</a> •
  <a href="#-licença">Licença</a>
</p>

## 🏗️ Arquitetura Técnica

### Stack Principal
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth, Database, Functions, Vector Store)
- **Mensageria**: N8N + EvolutionAPI
- **IA**: OpenAI GPT-4o + Embeddings
- **Automação**: N8N workflows

### Módulos do Sistema

#### 1. Autenticação e Usuários
- Login/registro de profissionais
- Perfis de clínicas/consultórios
- Controle de acesso por roles

#### 2. Gestão de Pacientes
- Cadastro completo de pacientes
- Histórico médico e consultas
- Documentos e anexos

#### 3. Atendimento Automatizado
- Integração WhatsApp/Instagram via EvolutionAPI
- IA contextual com embeddings
- Fluxos de conversa automatizados
- Escalação para humanos

#### 4. Agenda e Agendamentos
- Integração Google Calendar
- Disponibilidade de horários
- Confirmações automáticas
- Lembretes via WhatsApp

#### 5. Dashboard e Relatórios
- Métricas de atendimento
- Performance da IA
- Relatórios de pacientes

## 🔄 Fluxos Principais

### Fluxo de Atendimento
```
Mensagem WhatsApp/Instagram → N8N → IA (contexto + embeddings) → Resposta → Paciente
                                ↓
                         Salvar no Supabase
```

### Fluxo de Agendamento
```
Solicitação → IA verifica disponibilidade → Google Calendar → Confirmação → WhatsApp
```

## 📁 Estrutura do Projeto

```
mediflow/
├── apps/
│   ├── web/                 # Next.js frontend
│   └── n8n-workflows/       # Workflows N8N
├── packages/
│   ├── database/           # Schema Supabase
│   ├── ui/                 # Componentes shadcn/ui
│   └── types/              # TypeScript types
├── docs/                   # Documentação
└── scripts/               # Scripts de setup
```

## 📊 Status do Projeto

**Para acompanhar o progresso detalhado do projeto, consulte:**
👉 **[STATUS-PROJETO.md](./STATUS-PROJETO.md)** - Documento sempre atualizado

### 🚀 Resumo Atual
- ✅ **Base do projeto** configurada (Next.js + Supabase + Tailwind)
- ✅ **Autenticação** funcionando
- ✅ **Banco de dados** completo
- 🔄 **CRUD de pacientes** em desenvolvimento
- 📋 **Sistema de agendamentos** planejado
- 🤖 **IA e automação** em roadmap