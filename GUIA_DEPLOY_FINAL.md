# Guia de Deploy Final - ClinicFlow

Este guia detalha os passos para fazer o deploy do sistema ClinicFlow na sua VPS utilizando o Coolify.

## 1. Preparação do Repositório

O repositório já está preparado com todas as personalizações, incluindo:

- Renomeação de Mediflow para ClinicFlow.
- Novos logos e identidade visual.
- Integração com o backend Node.js.
- Dockerfile e Docker Compose configurados.

## 2. Deploy no Coolify

1.  **Acesse o Coolify**: `https://159.203.102.50:8000`
2.  **Crie um novo projeto** a partir de um repositório Git.
3.  **Conecte seu GitHub** e selecione o repositório `admvilsonmarcio-sketch/mediflow`.
4.  **Configure o build**: O Coolify deve detectar automaticamente que é um projeto Docker Compose e usar o `docker-compose.yml` na raiz do projeto.
5.  **Configure as variáveis de ambiente**:

    ```env
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=https://vxgavovjuyqmfqztheul.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4Z2F2b3ZqdXlxbWZxenRoZXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMzg2MTUsImV4cCI6MjA3NDkxNDYxNX0.yesbXrC6op0kT_pOkQf0WF2JcnYMvtW0nmYSuwJuaog
    SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4Z2F2b3ZqdXlxbWZxenRoZXVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTMzODYxNSwiZXhwIjoyMDc0OTE0NjE1fQ.ukcyeV9r-8zy3l6WF0dLTKCzOln3B1biEAHKvUkGZv4

    # Next.js
    NEXTAUTH_URL=http://clinicflow.casadf.com.br
    NEXTAUTH_SECRET=clinicflow-2025-production-secret-key-xyz123

    # Gemini AI
    GEMINI_API_KEY=AIzaSyDFfpB_HnrTKNgQq5j_ZU-V481qij9kSOo

    # N8N
    N8N_WEBHOOK_URL=https://n8n.casadf.com.br/webhook

    # Database Direct Connection
    DB_HOST=aws-0-sa-east-1.pooler.supabase.com
    DB_PORT=6543
    DB_DATABASE=postgres
    DB_USER=postgres.vxgavovjuyqmfqztheul
    DB_PASSWORD=Marcelle@040410db
    JWT_SECRET=clinicflow-2025-production-secret-key-xyz123
    ```

6.  **Faça o deploy** e aguarde a conclusão.

## 3. Configuração do Domínio

1.  No Coolify, vá para a aplicação `clinicflow-frontend`.
2.  Adicione o domínio `clinicflow.casadf.com.br` e aponte para a porta `3000`.
3.  Se desejar, adicione um domínio para a API (`api.clinicflow.casadf.com.br`) e aponte para a porta `3031`.

## 4. Integração com a Lara (N8n)

1.  **Adicione a credencial do PostgreSQL** no N8n, conforme detalhado no guia anterior.
2.  **Atualize o workflow da Lara** para:
    *   Buscar dados do cliente na view `vw_cliente_completo`.
    *   Enviar webhooks para `http://clinicflow-api:3031/api/webhooks/lead` para criar/atualizar leads.
    *   Enviar webhooks para `http://clinicflow-api:3031/api/webhooks/interaction` para registrar interações.

## 5. Teste e Validação

1.  **Acesse o sistema** em `http://clinicflow.casadf.com.br` e tente fazer login com um usuário de teste.
2.  **Envie uma mensagem para a Lara** e verifique se o lead é criado no ClinicFlow.
3.  **Navegue pelo dashboard** e verifique se os dados estão sendo exibidos corretamente.

Com estes passos, o sistema ClinicFlow estará totalmente funcional e integrado na sua VPS.

