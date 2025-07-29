<div align="center">
  <img src="./public/logo.svg" alt="MediFlow Logo" width="200" height="80" />
  
  <h1>MediFlow</h1>
  <p><strong>Sistema de Gestão Médica Inteligente</strong></p>
  <p>Atendimento automatizado • IA contextual • Agendamentos integrados • Compliance LGPD</p>

  <div>
    <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js 14" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge&logo=supabase" alt="Supabase" />
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
  </div>
  
  <div style="margin-top: 10px;">
    <img src="https://img.shields.io/badge/Versão-0.4.0-blue?style=flat-square" alt="Versão" />
    <img src="https://img.shields.io/badge/Status-Fases%201--3%20Completas-success?style=flat-square" alt="Status" />
    <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License" />
    <img src="https://img.shields.io/badge/LGPD-Compliant-purple?style=flat-square" alt="LGPD" />
  </div>

  <div style="margin-top: 20px;">
    <a href="#-funcionalidades"><strong>Funcionalidades</strong></a> •
    <a href="#-instalação"><strong>Instalação</strong></a> •
    <a href="#-tecnologias"><strong>Tecnologias</strong></a> •
    <a href="#-contribuição"><strong>Contribuição</strong></a> •
    <a href="#-documentação"><strong>Documentação</strong></a>
  </div>
</div>

---

## 🎯 Sobre o Projeto

O **MediFlow** é uma plataforma completa de gestão médica que combina automação inteligente, compliance rigoroso e experiência de usuário excepcional. Desenvolvido especificamente para profissionais de saúde brasileiros, oferece todas as ferramentas necessárias para modernizar e otimizar o atendimento médico.

### 🏆 Diferenciais

- **🤖 IA Contextual**: Atendimento automatizado via WhatsApp com base de conhecimento personalizada
- **🔒 Compliance Total**: LGPD/HIPAA compliant com auditoria completa
- **⚡ Performance**: Next.js 14 + Supabase para máxima velocidade
- **📱 Mobile-First**: Interface responsiva e otimizada para todos os dispositivos
- **🔐 Segurança**: Row Level Security (RLS) e sanitização de dados sensíveis

## 🚀 Funcionalidades

### ✅ **Implementado** (v0.4.0)

<table>
<tr>
<td width="50%">

**🔐 Autenticação & Segurança**
- Login seguro com Supabase Auth
- Row Level Security (RLS)
- Sanitização de dados sensíveis
- Compliance LGPD/HIPAA

**👥 Gestão de Pacientes**
- CRUD completo com validação
- Busca avançada com filtros múltiplos
- Histórico médico com timeline
- Navegação por duplo clique
- Documentos anexados

</td>
<td width="50%">

**📄 Sistema de Documentos**
- Upload seguro de arquivos
- Categorização automática
- Download e visualização
- Controle de acesso por RLS
- Suporte a múltiplos formatos

**🏥 Gestão de Clínicas**
- Configuração completa
- Múltiplos profissionais
- Perfis personalizados
- Logs de auditoria

</td>
</tr>
</table>

### 🔄 **Em Desenvolvimento** (v0.5.0) - Melhorias no Cadastro

- **Campos obrigatórios** com validação de CPF, RG e telefone
- **Integração ViaCEP** para preenchimento automático de endereço
- **Formulário wizard** dividido em etapas lógicas
- **Validações em tempo real** com feedback imediato
- **Máscaras brasileiras** para CPF, telefone e CEP
- **Verificação de duplicatas** por CPF
- **Upload de foto** do paciente
- **Salvamento automático** de rascunho

### 📋 **Roadmap**

- **v0.6.0** - Sistema de Agendamentos com calendário interativo
- **v0.7.0** - Integração WhatsApp via EvolutionAPI
- **v0.8.0** - IA Médica com assistente inteligente OpenAI
- **v0.9.0** - Relatórios avançados e dashboard de métricas
- **v1.0.0** - Telemedicina e consultas online integradas

## 🚀 Instalação

### Pré-requisitos

- **Node.js** 18+ 
- **npm** ou **yarn**
- **Conta Supabase** (gratuita)

### Quick Start

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/mediflow.git
cd mediflow

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# 4. Configure o banco de dados
# Execute database-schema.sql no Supabase SQL Editor

# 5. Configure o Supabase Storage
npm run init-storage

# 6. Inicie o projeto
npm run dev
```

🎉 **Pronto!** Acesse [http://localhost:3000](http://localhost:3000)

### Configuração Detalhada

<details>
<summary><strong>📋 Configuração do Supabase</strong></summary>

1. **Crie um projeto** no [Supabase](https://supabase.com)
2. **Configure as variáveis** em `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
   ```
3. **Execute o schema** no SQL Editor:
   - Copie o conteúdo de `database-schema.sql`
   - Cole no SQL Editor do Supabase
   - Execute o script

4. **Configure o Storage**:
   - Crie bucket `documents`
   - Configure políticas RLS
   - Defina acesso público para leitura

</details>

## 🛠️ Tecnologias

### Stack Principal

<table>
<tr>
<td><strong>Frontend</strong></td>
<td>Next.js 14, TypeScript, Tailwind CSS, shadcn/ui</td>
</tr>
<tr>
<td><strong>Backend</strong></td>
<td>Supabase (Auth, Database, Storage, Functions)</td>
</tr>
<tr>
<td><strong>Database</strong></td>
<td>PostgreSQL com Row Level Security (RLS)</td>
</tr>
<tr>
<td><strong>Validação</strong></td>
<td>Zod + React Hook Form</td>
</tr>
<tr>
<td><strong>Estado</strong></td>
<td>Context API + React Hooks</td>
</tr>
<tr>
<td><strong>Estilização</strong></td>
<td>Tailwind CSS + shadcn/ui</td>
</tr>
</table>

### Futuras Integrações

- **🤖 IA**: OpenAI GPT-4o + Embeddings
- **📱 Mensageria**: N8N + EvolutionAPI
- **🔄 Automação**: N8N workflows
- **📅 Calendário**: Google Calendar API

## 📊 Scripts Disponíveis

```bash
npm run dev              # 🚀 Servidor de desenvolvimento
npm run build            # 📦 Build para produção
npm run start            # ▶️  Servidor de produção
npm run lint             # 🔍 Executa ESLint
npm run lint:fix         # 🔧 Corrige problemas automaticamente
npm run type-check       # ✅ Verifica tipos TypeScript
npm run db:types         # 🗄️  Gera tipos do Supabase
npm run validate-schema  # ✅ Valida schema do banco
npm run init-storage     # ☁️  Inicializa Supabase Storage
npm test                 # 🧪 Executa testes (Fase 4)
```

## 🤝 Contribuição

Contribuições são **muito bem-vindas**! Este projeto segue as melhores práticas para sistemas médicos.

### Como Contribuir

1. **🍴 Fork** o projeto
2. **🌿 Crie uma branch** (`git checkout -b feature/nova-funcionalidade`)
3. **💾 Commit** suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. **📤 Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. **🔄 Abra um Pull Request**

### 📋 Padrões do Projeto

- **📝 Commits**: [Conventional Commits](./docs/COMMIT-CONVENTIONS.md)
- **💻 Código**: TypeScript + ESLint + Prettier
- **🧪 Testes**: Jest + Testing Library (Fase 4)
- **📚 Docs**: Sempre atualizar documentação relevante

### 🎯 Áreas que Precisam de Ajuda

- 🧪 **Testes automatizados**
- 🔐 **API Routes** com validação server-side
- 📅 **Sistema de agendamentos**
- 🤖 **Atendimento automatizado** via WhatsApp
- 📊 **Dashboard analytics**

## 📚 Documentação

### 📋 Documentos Essenciais

- 📊 **[STATUS-PROJETO.md](./STATUS-PROJETO.md)** - Status detalhado e métricas
- 🛠️ **[technical-roadmap.md](./docs/technical-roadmap.md)** - Roadmap técnico completo
- 🔧 **[TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)** - Soluções para problemas
- 📝 **[CONTRIBUTING.md](./docs/CONTRIBUTING.md)** - Guia de contribuição
- ⚙️ **[GITHUB-SETUP.md](./docs/GITHUB-SETUP.md)** - Configuração do GitHub
- 📝 **[COMMIT-CONVENTIONS.md](./docs/COMMIT-CONVENTIONS.md)** - Convenções de commit

### 📁 Estrutura do Projeto

```
mediflow/
├── 📱 app/                    # Next.js App Router
│   ├── 🏠 dashboard/         # Páginas do dashboard
│   ├── 🔌 api/              # API Routes (Fase 4)
│   └── 🔐 auth/             # Autenticação
├── 🧩 components/            # Componentes React
│   ├── 🎨 ui/               # Componentes base (shadcn/ui)
│   ├── 👥 patients/         # Gestão de pacientes
│   ├── 📄 documents/        # Sistema de documentos
│   └── ⚙️  settings/        # Configurações
├── 🛠️ lib/                  # Utilitários e configurações
│   ├── ✅ validations/      # Schemas Zod
│   ├── 📝 logging/          # Sistema de logging médico
│   ├── 🚨 errors/           # Tratamento de erros
│   └── 🗄️  supabase.ts       # Cliente Supabase
├── 📝 types/                # Tipos TypeScript
├── 📚 docs/                 # Documentação essencial
└── 🗄️  database-schema.sql   # Schema do banco
```

## 🏥 Para Profissionais de Saúde

O **MediFlow** foi desenvolvido com foco total na **segurança** e **compliance** necessários para a área médica:

### ✅ Compliance e Segurança

- **🔒 LGPD Compliant** - Proteção total de dados pessoais
- **🧹 Logs Sanitizados** - Informações sensíveis nunca expostas
- **🔍 Auditoria Completa** - Rastreabilidade de todas as ações
- **✅ Validação Robusta** - Prevenção de erros críticos
- **⚕️ Preparado para CFM** - Seguindo diretrizes médicas brasileiras

### 📊 Métricas do Projeto

<table>
<tr>
<td><strong>Versão</strong></td>
<td>0.3.0 - Sistema de Documentos Completo</td>
</tr>
<tr>
<td><strong>Arquivos</strong></td>
<td>40+ arquivos criados</td>
</tr>
<tr>
<td><strong>Código</strong></td>
<td>~4.200+ linhas</td>
</tr>
<tr>
<td><strong>Componentes</strong></td>
<td>14+ componentes funcionais</td>
</tr>
<tr>
<td><strong>Páginas</strong></td>
<td>8 páginas completas</td>
</tr>
<tr>
<td><strong>Banco</strong></td>
<td>11 tabelas principais</td>
</tr>
<tr>
<td><strong>Desenvolvimento</strong></td>
<td>~16 horas</td>
</tr>
</table>

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

<div align="center">
  <img src="./public/logo.svg" alt="MediFlow Logo" width="100" height="40" />
  
  <p><strong>Desenvolvido com ❤️ para profissionais de saúde</strong></p>
  <p>MediFlow v0.3.0 - Transformando o atendimento médico com tecnologia</p>
  
  <div style="margin-top: 20px;">
    <a href="https://github.com/seu-usuario/mediflow/issues">🐛 Reportar Bug</a> •
    <a href="https://github.com/seu-usuario/mediflow/discussions">💬 Discussões</a> •
    <a href="mailto:contato@mediflow.com">📧 Contato</a>
  </div>
</div>