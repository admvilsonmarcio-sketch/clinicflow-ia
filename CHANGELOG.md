# 📋 Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Não Lançado]

### 🔄 Em Desenvolvimento
- Melhorias no sistema de cadastro de pacientes
- Otimizações de performance

---

## [0.7.0-beta] - 2025-08-13

### 🎯 Novo
- **Sistema de Responsividade Completo:** Implementação de baseline de responsividade
  - ESLint + Tailwind CSS Plugin para detecção de problemas de responsividade
  - Stylelint configurado para validação de CSS customizado
  - Playwright configurado com testes visuais em 6 breakpoints (375px a 1920px)
  - Lighthouse configurado para auditoria de performance, acessibilidade e best practices
  - GitHub Actions CI/CD para testes automáticos de responsividade
  - Scripts npm para execução local e CI (`test:responsive`, `lighthouse`, `audit:full`)

### 🔧 Melhorado
- **Linting Avançado:** Configuração completa de linters para responsividade
  - Detecção automática de classes Tailwind conflitantes
  - Correção automática de ordem de classes CSS
  - Migração automática Tailwind v2 → v3 (flex-shrink-0 → shrink-0)
  - Enforcement de shorthands (h-4 w-4 → size-4)
  - Validação de CSS com suporte a sintaxe Tailwind

### 📊 Adicionado
- **Testes Visuais Automatizados:** Playwright configurado para responsividade
  - Screenshots automáticos em 6 breakpoints para todas as páginas principais
  - Detecção automática de overflow horizontal
  - Verificação de usabilidade em dispositivos móveis
  - Testes de legibilidade de texto (≥ 12px)
  - Relatórios HTML interativos com resultados detalhados

### 🚀 Infraestrutura
- **CI/CD Responsividade:** GitHub Actions configurado
  - Execução automática em push e pull requests
  - Comentários automáticos em PRs com resultados
  - Artifacts salvos por 30 dias (screenshots, relatórios)
  - Critérios de aceite: Performance ≥ 80, Best Practices ≥ 90, Accessibility ≥ 90

### 📚 Documentação
- **Guias Completos:** Documentação detalhada do sistema de responsividade
  - `docs/responsividade.md`: Guia completo de uso
  - `docs/demo-responsividade.md`: Demonstração da implementação
  - Exemplos de boas práticas mobile-first
  - Troubleshooting para problemas comuns

---

## [0.6.1-beta] - 2025-08-13

### 🔧 Melhorado
- **Sistema de Autenticação:** Otimização completa das rotas de autenticação
  - Correção de propriedades duplicadas (`id` e `email`) em `userData` objects
  - Estruturas de dados consistentes em `/api/auth/login`, `/api/auth/refresh`, `/api/auth/me`
  - Validação robusta com Zod schemas
  - Gerenciamento de sessão aprimorado
  - Sanitização de dados de resposta
  - Tratamento de erros padronizado

### 🐛 Corrigido
- **Erros de TypeScript:** Resolução de 6 erros críticos de tipo
  - Correção de acessos incorretos a propriedades de arrays (`conversas.consulta_id` → `conversas[0].consulta_id`)
  - Remoção de propriedades duplicadas em objetos `userData`
  - Adição de `consulta_id` ao `conversaCreateSchema`
  - Build limpo sem erros de tipo
  - Código DRY (Don't Repeat Yourself) implementado

### ⚡ Performance
- **Otimização de APIs:** Melhor performance nas rotas de autenticação
- **Manutenibilidade:** Código mais limpo e fácil de manter
- **Segurança:** Validação aprimorada e sanitização de dados
- **Experiência do Usuário:** Respostas mais rápidas e consistentes

---

## [0.6.0-beta] - 2025-08-07

### ✨ Adicionado
- **Recuperação de senha:** Funcionalidade completa de "Esqueceu a senha" com Supabase Auth
  - Página `/auth/forgot-password` para solicitar recuperação
  - Página `/auth/reset-password` para redefinir senha
  - Componentes `ForgotPasswordForm` e `ResetPasswordForm`
  - Validação de email e senha com Zod
  - Estados de loading e feedback visual
  - Tratamento de erros específicos
  - Interface responsiva e acessível
  - Indicador de força da senha
  - Template de email personalizado no Supabase
  - Documentação completa em `docs/FORGOT-PASSWORD-SETUP.md`

### 🔧 Melhorado
- **Estrutura de pastas do Supabase:** Reorganização completa para melhor manutenibilidade
  - Movido `lib/supabase.ts` → `lib/supabase/client.ts`
  - Movido `lib/supabase-server.ts` → `lib/supabase/server.ts`
  - Movido `lib/storage/supabase-storage.ts` → `lib/supabase/storage.ts`
  - Adicionado `createRouteHandlerSupabaseClient` para route handlers
  - Atualização de 75+ arquivos com novos caminhos de importação

### 🐛 Corrigido
- **Erro 401 na recuperação de senha:** Corrigido problema de sessão entre rotas
- **Gerenciamento de sessão:** Melhorado usando `createRouteHandlerClient`
- **Fluxo de autenticação:** Corrigido conflito na validação de sessão

### 🐛 Bugs Identificados - Prioridade Alta
- **Layout inconsistente:** Telas de cadastrar/editar paciente devem seguir o mesmo padrão do formulário de configuração
- **Botões não funcionais:** Botões "Salvar" e "Editar" não estão respondendo adequadamente
- **Navegação travada:** Menus na edição devem permitir navegação livre entre as etapas
- **Informações médicas:** Reorganizar layout da página de detalhes para melhor apresentação
- **UX de navegação:** Usuário deve poder navegar pelos menus na ordem que desejar

### Planejado para v0.5.0 - Melhorias no Cadastro de Pacientes
- **Campos obrigatórios:** CPF, RG, telefone celular, email
- **Validações avançadas:** CPF brasileiro, email, telefone
- **Estrutura de endereço completa** com integração ViaCEP API
- **Formulário multi-step (wizard)** dividido em 4 etapas
- **Preenchimento automático** de endereço via CEP
- **Verificação de duplicatas** por CPF
- **Upload de foto** do paciente (opcional)
- **Máscaras brasileiras** para CPF, telefone e CEP
- **Salvamento automático** de rascunho
- **Responsividade aprimorada** para mobile

### Planejado para versões futuras
- Sistema de agendamentos com calendário interativo
- Integração com WhatsApp Business API
- Dashboard de analytics avançado
- Exportação de dados em PDF
- Integração Google Calendar

---

## [0.4.1] - 2025-08-05

### 🔧 Corrigido
- **Campos de emergência:** Corrigidos nomes dos campos `contato_emergencia_*` para `*_emergencia` no formulário wizard
- **Schema do banco:** Alinhamento com migração v2 para campos de contato de emergência
- **Botão "Salvar Rascunho":** Removida condição que impedia funcionamento no modo de edição
- **Upload de documentos:** Implementado refresh automático da lista após upload
- **Limpeza do projeto:** Removidos arquivos não utilizados (pasta supabase/, schemas duplicados, documentação obsoleta)

### 🗑️ Removido
- Pasta `supabase/` com migrações automáticas não utilizadas
- Arquivos de schema duplicados (`database-schema.sql`, `database-schema-v2.sql`)
- Documentação obsoleta sobre migrações (`APLICAR-MIGRACAO.md`, `STATUS-PROJETO.md`, `MIGRATION-GUIDE.md`)
- Scripts de migração não utilizados (`docs/database-setup.sql`, `docs/migration-v2.sql`)

---

## [0.4.0] - 2025-08-04

### ✨ Adicionado
- **🔍 Busca avançada de pacientes** com filtros múltiplos
- **📊 Filtros por nome, status, gênero e idade** com contadores em tempo real
- **📋 Histórico médico completo** com timeline e paginação
- **🖱️ Navegação por duplo clique** nos cards de pacientes
- **⚡ Debounce na busca** para otimização de performance
- **📈 Componente PatientHistory** reutilizável
- **🔄 Integração Supabase** com ordenação e paginação automática

### 🎨 Melhorado
- **Interface de busca** mais intuitiva e responsiva
- **Cards de pacientes** com melhor feedback visual
- **Performance da listagem** com filtros otimizados
- **UX de navegação** com duplo clique para acesso rápido
- **Organização do código** com componentes modulares

### 🔧 Corrigido
- **Import do DocumentList** corrigido para named export
- **Erro de TypeScript** na importação de componentes
- **Navegação entre páginas** otimizada
- **Filtros de busca** funcionando corretamente

### 🛠️ Técnico
- **Hook useDebounce** para otimização de busca
- **Componente AdvancedFilters** para filtros múltiplos
- **Componente PatientHistory** com paginação
- **Queries Supabase** otimizadas com índices
- **TypeScript** melhorado com tipos mais específicos

---

## [0.3.0] - 2025-08-03

### ✨ Adicionado
- **📁 Sistema completo de documentos** para pacientes
- **🔐 Supabase Storage** configurado com bucket 'documentos-pacientes'
- **📤 Upload de documentos** com validação de tipo e tamanho (máx 10MB)
- **📂 Categorização de documentos** (Exame, Receita, Laudo, Atestado, Outros)
- **👁️ Visualização de documentos** em nova aba do navegador
- **💾 Download de arquivos** mantendo nome original
- **🗑️ Exclusão segura** de documentos com confirmação
- **📋 Tabela documentos_pacientes** no banco de dados
- **🔒 Row Level Security (RLS)** para isolamento por clínica
- **📝 Campo de descrição opcional** para documentos
- **📅 Data do documento** configurável

### 🎨 Melhorado
- **UX otimizada** - usuário permanece na tela de edição durante trabalho com documentos
- **Navegação inteligente** - redirecionamento apenas após salvar paciente
- **Interface de upload** com drag & drop e preview
- **Lista de documentos** com informações detalhadas (categoria, tamanho, data)
- **Ícones contextuais** para diferentes tipos de documentos

### 🔧 Corrigido
- **Bug de navegação** - botões de documentos não submetem mais o formulário
- **Atributo type="button"** adicionado em todos os botões de ação
- **Submit inesperado** do formulário ao interagir com documentos
- **Mensagens de sucesso** incorretas durante operações com documentos

### 🛠️ Técnico
- **Componente DocumentUpload** para upload de arquivos
- **Componente DocumentList** para listagem e gerenciamento
- **Integração com Supabase Storage** para armazenamento seguro
- **Políticas RLS** implementadas para segurança
- **Validação de tipos** de arquivo (PDF, imagens, documentos)
- **Tratamento de erros** robusto em operações de arquivo

---

## [0.2.1] - 2025-08-02

### ✨ Adicionado
- **Sistema de notificações modernizado** com ícones visuais intuitivos
- **Ícones contextuais** para diferentes tipos de notificação:
  - ✅ CheckCircle para sucessos (verde)
  - ❌ AlertCircle para erros (vermelho)
  - ⚠️ AlertTriangle para avisos (amarelo)
  - ℹ️ Info para informações (azul)
- **Efeito glassmorphism** nas notificações para visual moderno
- **Duração aumentada** das notificações para 6 segundos

### 🎨 Melhorado
- **UX/UI das notificações** com design mais profissional e consistente
- **Layout das notificações** com melhor espaçamento e tipografia
- **Botão de fechar** redesenhado com hover states suaves
- **Cores e variantes** refinadas para melhor acessibilidade
- **Consistência visual** removendo emojis dos formulários de login e registro

### 🔧 Corrigido
- **Erro de sintaxe** no componente Toast que quebrava o login
- **Propriedade variant** corretamente passada para componentes
- **Renderização de ícones** funcionando corretamente em todas as variantes

### 📚 Documentação
- Atualizado `STATUS-PROJETO.md` com melhorias implementadas
- Criado `CHANGELOG.md` para rastreamento de versões

---

## [0.2.0] - 2025-07-30

### ✨ Adicionado
- **Sistema completo de autenticação** com Supabase Auth
- **CRUD completo de pacientes** (criar, visualizar, editar)
- **Gestão de clínicas** com configuração completa
- **Sistema de logging médico** com sanitização de dados sensíveis
- **Validação Zod robusta** em todos os formulários
- **Tratamento de erros** específico para área médica
- **Context API** para estado global
- **Máscaras de input** para campos brasileiros (CPF, CNPJ, telefone)
- **Compliance LGPD/HIPAA** com proteção de dados sensíveis

### 🎨 Interface
- **Dashboard principal** com estatísticas em tempo real
- **Sidebar responsiva** com navegação otimizada
- **Página de configurações** com 6 abas funcionais
- **Formulários responsivos** com validação em tempo real
- **Componentes UI modernos** com shadcn/ui
- **Design system** consistente com Tailwind CSS

### 🔐 Segurança
- **Row Level Security (RLS)** implementado
- **Isolamento por clínica** garantindo privacidade
- **Logs sanitizados** sem exposição de dados sensíveis
- **Validação server-side** em todas as operações

### 🗄️ Banco de Dados
- **Schema completo** com tabelas otimizadas
- **Índices de performance** para consultas rápidas
- **Triggers automáticos** para timestamps
- **Políticas de segurança** por clínica

---

## [0.1.0] - 2025-07-25

### ✨ Inicial
- **Configuração inicial** do projeto Next.js 14
- **Integração Supabase** configurada
- **Estrutura base** de componentes
- **Configuração Tailwind CSS** com shadcn/ui
- **Schema inicial** do banco de dados

---

## Tipos de Mudanças

- `✨ Adicionado` para novas funcionalidades
- `🎨 Melhorado` para mudanças em funcionalidades existentes
- `🔧 Corrigido` para correção de bugs
- `🔐 Segurança` para vulnerabilidades corrigidas
- `📚 Documentação` para mudanças na documentação
- `🗄️ Banco de Dados` para mudanças no schema
- `⚡ Performance` para melhorias de performance
- `🧪 Testes` para adição ou correção de testes

---

**Convenções de Commit:** Este projeto segue [Conventional Commits](./COMMIT-CONVENTIONS.md)

**Versionamento:** [Semantic Versioning](https://semver.org/lang/pt-BR/)

**Documentação:** Veja [STATUS-PROJETO.md](./STATUS-PROJETO.md) para status detalhado