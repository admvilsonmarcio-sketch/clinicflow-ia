# API Routes - MediFlow

Este documento descreve todas as rotas da API do sistema MediFlow, incluindo autenticação, validação e controle de permissões.

## Autenticação

Todas as rotas (exceto as de autenticação) requerem um token de acesso válido no header `Authorization: Bearer <token>`.

### Rotas de Autenticação

#### POST /api/auth/login
Realiza login no sistema.

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Login realizado com sucesso.",
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "nome": "Nome do Usuário",
    "role": "medico",
    "clinica_id": "uuid",
    "ativo": true,
    "clinica": {
      "id": "uuid",
      "nome": "Nome da Clínica",
      "ativa": true
    }
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_at": 1234567890
  }
}
```

#### POST /api/auth/logout
Realiza logout do sistema.

**Resposta de Sucesso (200):**
```json
{
  "message": "Logout realizado com sucesso."
}
```

#### GET /api/auth/me
Retorna informações do usuário autenticado.

**Resposta de Sucesso (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "nome": "Nome do Usuário",
    "role": "medico",
    "clinica_id": "uuid",
    "ativo": true,
    "clinica": {
      "id": "uuid",
      "nome": "Nome da Clínica",
      "ativa": true
    }
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_at": 1234567890
  },
  "authenticated": true
}
```

#### POST /api/auth/refresh
Renova o token de acesso.

**Body:**
```json
{
  "refresh_token": "refresh_token"
}
```

## Pacientes

#### GET /api/patients
Lista pacientes com paginação e filtros.

**Query Parameters:**
- `page` (number): Página (padrão: 1)
- `limit` (number): Itens por página (padrão: 10, máx: 100)
- `search` (string): Busca por nome, email ou CPF
- `sort` (string): Campo para ordenação (padrão: created_at)
- `order` (asc|desc): Ordem da classificação (padrão: desc)
- `clinica_id` (uuid): Filtrar por clínica

**Permissões:** `patients:read`

#### POST /api/patients
Cria um novo paciente.

**Body:**
```json
{
  "nome": "Nome do Paciente",
  "email": "paciente@exemplo.com",
  "cpf": "12345678901",
  "telefone": "11999999999",
  "data_nascimento": "1990-01-01",
  "endereco": "Endereço completo",
  "clinica_id": "uuid"
}
```

**Permissões:** `patients:write`

#### GET /api/patients/[id]
Busca um paciente por ID.

**Permissões:** `patients:read`

#### PUT /api/patients/[id]
Atualiza um paciente.

**Permissões:** `patients:write`

#### DELETE /api/patients/[id]
Deleta um paciente (se não tiver consultas ou conversas).

**Permissões:** `patients:delete`

## Consultas

#### GET /api/consultas
Lista consultas com paginação e filtros.

**Query Parameters:**
- `page`, `limit`, `search`, `sort`, `order`: Parâmetros padrão
- `clinica_id` (uuid): Filtrar por clínica
- `medico_id` (uuid): Filtrar por médico
- `paciente_id` (uuid): Filtrar por paciente
- `status` (agendada|em_andamento|concluida|cancelada): Filtrar por status
- `data_inicio` (date): Data inicial do período
- `data_fim` (date): Data final do período

**Permissões:** `consultas:read`

#### POST /api/consultas
Cria uma nova consulta.

**Body:**
```json
{
  "paciente_id": "uuid",
  "medico_id": "uuid",
  "clinica_id": "uuid",
  "data_hora": "2024-01-01T10:00:00Z",
  "tipo": "consulta",
  "observacoes": "Observações da consulta"
}
```

**Permissões:** `consultas:write`

#### GET /api/consultas/[id]
Busca uma consulta por ID.

**Permissões:** `consultas:read`

#### PUT /api/consultas/[id]
Atualiza uma consulta.

**Permissões:** `consultas:write`

#### DELETE /api/consultas/[id]
Deleta uma consulta (se não estiver em andamento ou concluída).

**Permissões:** `consultas:delete`

## Clínicas

#### GET /api/clinicas
Lista clínicas (super_admin vê todas, outros veem apenas a própria).

**Permissões:** `clinicas:read`

#### POST /api/clinicas
Cria uma nova clínica (apenas super_admin).

**Body:**
```json
{
  "nome": "Nome da Clínica",
  "cnpj": "12345678000199",
  "email": "clinica@exemplo.com",
  "telefone": "11999999999",
  "endereco": "Endereço completo"
}
```

**Permissões:** `clinicas:write` + role `super_admin`

#### GET /api/clinicas/[id]
Busca uma clínica por ID (inclui estatísticas para admins).

**Permissões:** `clinicas:read`

#### PUT /api/clinicas/[id]
Atualiza uma clínica.

**Permissões:** `clinicas:write`

#### DELETE /api/clinicas/[id]
Deleta uma clínica (apenas super_admin, se não tiver dependências).

**Permissões:** `clinicas:delete` + role `super_admin`

## Perfis (Usuários)

#### GET /api/perfis
Lista perfis de usuários.

**Query Parameters:**
- Parâmetros padrão de paginação
- `clinica_id` (uuid): Filtrar por clínica
- `role` (medico|admin|super_admin): Filtrar por cargo
- `ativo` (boolean): Filtrar por status ativo

**Permissões:** `users:read`

#### POST /api/perfis
Cria um novo perfil de usuário.

**Body:**
```json
{
  "nome": "Nome do Usuário",
  "email": "usuario@exemplo.com",
  "role": "medico",
  "clinica_id": "uuid",
  "crm": "12345",
  "especialidade": "Cardiologia",
  "telefone": "11999999999"
}
```

**Permissões:** `users:write`

#### GET /api/perfis/[id]
Busca um perfil por ID (inclui estatísticas para médicos).

**Permissões:** `users:read`

#### PUT /api/perfis/[id]
Atualiza um perfil.

**Permissões:** `users:write`

#### DELETE /api/perfis/[id]
Deleta um perfil (com restrições).

**Permissões:** `users:delete`

## Conversas

#### GET /api/conversas
Lista conversas.

**Query Parameters:**
- Parâmetros padrão de paginação
- `consulta_id` (uuid): Filtrar por consulta
- `paciente_id` (uuid): Filtrar por paciente
- `medico_id` (uuid): Filtrar por médico
- `ativa` (boolean): Filtrar por status ativo

**Permissões:** `conversas:read`

#### POST /api/conversas
Cria uma nova conversa.

**Body:**
```json
{
  "consulta_id": "uuid",
  "paciente_id": "uuid",
  "medico_id": "uuid",
  "assunto": "Assunto da conversa"
}
```

**Permissões:** `conversas:write`

#### GET /api/conversas/[id]
Busca uma conversa por ID (inclui mensagens).

**Permissões:** `conversas:read`

#### PUT /api/conversas/[id]
Atualiza uma conversa.

**Permissões:** `conversas:write`

#### DELETE /api/conversas/[id]
Deleta uma conversa (e suas mensagens).

**Permissões:** `conversas:delete`

## Mensagens

#### GET /api/mensagens
Lista mensagens de uma conversa.

**Query Parameters Obrigatórios:**
- `conversa_id` (uuid): ID da conversa

**Query Parameters Opcionais:**
- Parâmetros padrão de paginação
- `remetente_tipo` (medico|paciente|sistema): Filtrar por tipo de remetente
- `lida` (boolean): Filtrar por status de leitura

**Permissões:** `mensagens:read`

#### POST /api/mensagens
Cria uma nova mensagem.

**Body:**
```json
{
  "conversa_id": "uuid",
  "conteudo": "Conteúdo da mensagem",
  "remetente_tipo": "medico"
}
```

**Permissões:** `mensagens:write`

#### GET /api/mensagens/[id]
Busca uma mensagem por ID (marca como lida se aplicável).

**Permissões:** `mensagens:read`

#### PUT /api/mensagens/[id]
Atualiza uma mensagem (apenas remetente original ou admins).

**Permissões:** `mensagens:write`

#### DELETE /api/mensagens/[id]
Deleta uma mensagem (com restrições de tempo).

**Permissões:** `mensagens:delete`

## Rate Limiting

O sistema implementa rate limiting nas seguintes rotas:

- `/api/auth/*`: 10 requisições por minuto
- `/api/patients/*`: 100 requisições por minuto
- `/api/consultas/*`: 100 requisições por minuto
- `/api/clinicas/*`: 50 requisições por minuto
- Outras rotas: 200 requisições por minuto

## Códigos de Erro Comuns

- `400`: Dados inválidos ou parâmetros incorretos
- `401`: Não autenticado ou token inválido
- `403`: Sem permissão para acessar o recurso
- `404`: Recurso não encontrado
- `409`: Conflito (ex: duplicação de dados)
- `429`: Rate limit excedido
- `500`: Erro interno do servidor

## Permissões por Cargo

### Super Admin
- Todas as permissões
- Pode gerenciar clínicas
- Pode criar outros super_admins

### Admin
- Gerenciar usuários, pacientes, consultas e conversas da própria clínica
- Não pode gerenciar clínicas
- Não pode criar super_admins

### Médico
- Visualizar e gerenciar próprios pacientes e consultas
- Participar de conversas relacionadas às próprias consultas
- Não pode gerenciar outros usuários

## Middleware de Segurança

Todas as rotas protegidas passam pelo middleware `withMedicalAuth` que:

1. Verifica a autenticação do usuário
2. Valida se o usuário está ativo
3. Verifica se a clínica está ativa (quando aplicável)
4. Confirma as permissões necessárias
5. Aplica rate limiting

## Validação de Dados

Todos os dados de entrada são validados usando schemas Zod definidos em `/lib/validations/schemas.ts`.

Os schemas incluem:
- Validação de tipos
- Validação de formato (email, CPF, CNPJ, etc.)
- Validação de tamanho e limites
- Sanitização de dados