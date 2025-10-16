## Plano Detalhado de Personalização do Sistema ClinicFlow para ClinicFlow

Este documento detalha as etapas necessárias para transformar o sistema `mediflow` em `ClinicFlow`, integrando-o com as ferramentas e infraestrutura do usuário (Supabase, Gemini, Lara) e preparando-o para deploy na VPS via Coolify.

### 1. Configuração do Ambiente e Credenciais

**Objetivo**: Garantir que o sistema utilize as credenciais e configurações corretas para Supabase e Gemini.

*   **Supabase**: Utilizar as credenciais fornecidas:
    *   `DB_HOST`: `aws-0-sa-east-1.pooler.supabase.com`
    *   `DB_PORT`: `6543`
    *   `DB_DATABASE`: `postgres`
    *   `DB_USER`: `postgres.vxgavovjuyqmfqztheul`
    *   `DB_PASSWORD`: `Marcelle@040410db`
*   **Gemini**: Utilizar a chave API fornecida:
    *   `GEMINI_API_KEY`: `AIzaSyDFfpB_HnrTKNgQq5j_ZU-V481qij9kSOo`
*   **JWT Secret**: Gerar uma chave segura para `JWT_SECRET`.

### 2. Renomeação e Identidade Visual

**Objetivo**: Substituir todas as referências a 'ClinicFlow' por 'ClinicFlow' e aplicar a nova identidade visual.

*   **Código-fonte**: Renomear o projeto de `mediflow` para `clinicflow` em `package.json` e em quaisquer outros arquivos de configuração ou texto visível na interface.
*   **Logos**: Substituir o logo existente pelos logos `clinicflow-logo-primary.png`, `clinicflow-logo-icon.png` e `clinicflow-logo-horizontal.png` gerados anteriormente.
*   **Cores e Estilos**: Ajustar o `tailwind.config.js` e outros arquivos CSS/SCSS para refletir a paleta de cores do ClinicFlow (Azul: #0066CC, Verde: #00CC88, Cinza: #2D3748).

### 3. Correção do Problema de Login

**Objetivo**: Diagnosticar e resolver o problema de login reportado pelo usuário.

*   **Verificação de Configuração**: Assegurar que `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no `.env` do Next.js estejam corretamente configurados para o Supabase do usuário.
*   **Autenticação**: Revisar o código de autenticação (`@supabase/auth-helpers-nextjs`, `@supabase/auth-helpers-react`) para garantir que esteja de acordo com as melhores práticas do Supabase e que não haja erros de implementação.
*   **Usuário de Teste**: Criar um script ou instrução para criar um usuário administrador no Supabase para testes iniciais.

### 4. Integração com o Backend Node.js (API de Automações)

**Objetivo**: Conectar o frontend Next.js com a API de automações Node.js (que já foi desenvolvida) para funcionalidades de Leads, CRM e IA.

*   **Endpoints**: Adaptar o frontend para consumir os endpoints da API Node.js (`/api/webhooks/lead`, `/api/leads`, `/api/cliente/:telefone`, etc.).
*   **Contexto de Dados**: Implementar a exibição dos dados de leads, interações e agendamentos no dashboard e nas páginas de detalhe do cliente.
*   **IA Gemini**: Integrar a funcionalidade de qualificação de leads via Gemini no frontend, se aplicável, ou garantir que o backend Node.js a utilize corretamente.

### 5. Adaptação do Banco de Dados e Views

**Objetivo**: Unificar o schema do banco de dados do ClinicFlow com as tabelas existentes da Lara e as novas tabelas do ClinicFlow.

*   **Schema**: Assegurar que as tabelas `n8n_dados_clientes`, `n8n_chat_histories`, `n8n_status_atendimento` sejam reconhecidas e utilizadas pelo sistema.
*   **Views**: Utilizar as views `vw_cliente_completo` e `vw_historico_conversas` para um acesso consolidado aos dados do cliente e histórico de conversas, enriquecendo o atendimento humanizado da Lara.
*   **Migrações**: Se necessário, criar scripts de migração para adaptar o schema do ClinicFlow ao schema integrado do ClinicFlow.

### 6. Dockerização e Deploy para Coolify

**Objetivo**: Criar um `Dockerfile` e `docker-compose.yml` robustos para o deploy simplificado no Coolify.

*   **Dockerfile (Next.js)**: Criar um `Dockerfile` otimizado para a aplicação Next.js, garantindo um build eficiente e um container leve.
*   **Docker Compose**: Desenvolver um `docker-compose.yml` que orquestre:
    *   O frontend Next.js (ClinicFlow).
    *   O backend Node.js (API de Automações).
    *   Conexão ao Supabase (banco de dados externo).
    *   Configuração de variáveis de ambiente para Coolify.
*   **Nginx**: Configurar o Nginx para servir o frontend e rotear as requisições `/api` para o backend Node.js.

### 7. Documentação e Testes

**Objetivo**: Fornecer documentação clara e realizar testes para garantir a funcionalidade.

*   **README.md**: Atualizar o `README.md` com instruções de instalação, configuração e uso do ClinicFlow.
*   **Guia de Deploy**: Criar um guia detalhado para o deploy no Coolify, incluindo a configuração de domínios e variáveis de ambiente.
*   **Testes**: Realizar testes de ponta a ponta para verificar o login, a integração com a Lara, a funcionalidade do CRM e a exibição de dados.

Este plano será executado iterativamente, com validações em cada etapa para garantir a qualidade e a conformidade com os requisitos do usuário.
