# Documentação do Banco de Dados - MediFlow

## Visão Geral

Este documento descreve a estrutura completa do banco de dados do sistema MediFlow, um sistema de gestão médica que inclui funcionalidades de agendamento, gestão de pacientes, comunicação via IA e integrações com plataformas externas.

## Estrutura do Banco

O banco de dados utiliza PostgreSQL com Supabase e está organizado em domínios funcionais:

- **Gestão de Clínicas e Usuários**
- **Gestão de Pacientes**
- **Sistema de Consultas e Agendamentos**
- **Sistema de Comunicação e IA**
- **Documentos e Arquivos**
- **Integrações Externas**
- **Auditoria e Logs**

---

## 1. Gestão de Clínicas e Usuários

### Tabela: `clinicas`

**Descrição:** Armazena informações das clínicas médicas cadastradas no sistema.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|----------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identificador único da clínica |
| `nome` | `text` | NOT NULL | Nome da clínica |
| `descricao` | `text` | | Descrição da clínica |
| `endereco` | `text` | | Endereço completo |
| `telefone` | `text` | | Telefone de contato |
| `email` | `text` | | Email de contato |
| `site` | `text` | | Website da clínica |
| `logo_url` | `text` | | URL do logotipo |
| `configuracoes` | `jsonb` | DEFAULT '{}' | Configurações específicas da clínica |
| `criado_em` | `timestamp with time zone` | DEFAULT now() | Data de criação |
| `atualizado_em` | `timestamp with time zone` | DEFAULT now() | Data da última atualização |

### Tabela: `perfis`

**Descrição:** Perfis dos usuários do sistema (médicos, assistentes, recepcionistas, etc.).

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|----------|
| `id` | `uuid` | PRIMARY KEY, FK → auth.users(id) | ID do usuário (referência ao Supabase Auth) |
| `email` | `text` | NOT NULL, UNIQUE | Email do usuário |
| `nome_completo` | `text` | NOT NULL | Nome completo do usuário |
| `foto_url` | `text` | | URL da foto de perfil |
| `telefone` | `text` | | Telefone de contato |
| `cargo` | `text` | DEFAULT 'medico', CHECK | Cargo do usuário |
| `clinica_id` | `uuid` | FK → clinicas(id) | Clínica à qual pertence |
| `criado_em` | `timestamp with time zone` | DEFAULT now() | Data de criação |
| `atualizado_em` | `timestamp with time zone` | DEFAULT now() | Data da última atualização |

**Valores permitidos para `cargo`:**
- `admin`
- `medico`
- `assistente`
- `recepcionista`

---

## 2. Gestão de Pacientes

### Tabela: `pacientes`

**Descrição:** Informações completas dos pacientes cadastrados.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|----------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identificador único do paciente |
| `clinica_id` | `uuid` | NOT NULL, FK → clinicas(id) | Clínica do paciente |
| `nome_completo` | `text` | NOT NULL | Nome completo |
| `email` | `text` | NOT NULL | Email de contato |
| `data_nascimento` | `date` | NOT NULL | Data de nascimento |
| `genero` | `text` | NOT NULL, CHECK | Gênero do paciente |
| `cpf` | `character varying` | UNIQUE, CHECK validar_cpf() | CPF (com validação) |
| `rg` | `character varying` | | Número do RG |
| `orgao_emissor` | `character varying` | | Órgão emissor do RG |
| `uf_rg` | `character varying` | | UF do RG |
| `estado_civil` | `character varying` | | Estado civil |
| `profissao` | `character varying` | | Profissão |
| `telefone_celular` | `character varying` | | Telefone celular |
| `telefone_fixo` | `character varying` | | Telefone fixo |
| `cep` | `character varying` | | CEP |
| `logradouro` | `character varying` | | Endereço |
| `numero` | `character varying` | | Número |
| `complemento` | `character varying` | | Complemento |
| `bairro` | `character varying` | | Bairro |
| `cidade` | `character varying` | | Cidade |
| `uf` | `character varying` | | Estado |
| `nome_emergencia` | `character varying` | | Nome do contato de emergência |
| `parentesco_emergencia` | `character varying` | | Parentesco do contato |
| `telefone_emergencia` | `character varying` | | Telefone de emergência |
| `observacoes_emergencia` | `text` | | Observações do contato |
| `tipo_sanguineo` | `character varying` | | Tipo sanguíneo |
| `alergias_conhecidas` | `text[]` | | Array de alergias |
| `medicamentos_uso` | `text[]` | | Array de medicamentos em uso |
| `historico_medico_detalhado` | `text` | | Histórico médico completo |
| `observacoes_gerais` | `text` | | Observações gerais |
| `convenio_medico` | `character varying` | | Convênio médico |
| `numero_carteirinha` | `character varying` | | Número da carteirinha |
| `whatsapp_id` | `text` | | ID do WhatsApp |
| `instagram_id` | `text` | | ID do Instagram |
| `foto_url` | `text` | | URL da foto |
| `qr_code` | `text` | | QR Code do paciente |
| `ultimo_contato` | `timestamp with time zone` | | Último contato |
| `data_ultima_consulta` | `timestamp with time zone` | | Data da última consulta |
| `status` | `text` | DEFAULT 'ativo', CHECK | Status do paciente |
| `status_ativo` | `boolean` | DEFAULT true | Se está ativo |
| `data_rascunho` | `timestamp with time zone` | | Data do rascunho |
| `criado_em` | `timestamp with time zone` | DEFAULT now() | Data de criação |
| `atualizado_em` | `timestamp with time zone` | DEFAULT now() | Data da última atualização |

**Valores permitidos para `genero`:**
- `masculino`
- `feminino`
- `outro`

**Valores permitidos para `status`:**
- `ativo`
- `inativo`
- `bloqueado`

### Tabela: `pacientes_historico`

**Descrição:** Histórico de alterações nos dados dos pacientes para auditoria.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|----------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| `paciente_id` | `uuid` | NOT NULL, FK → pacientes(id) | Paciente alterado |
| `campo_alterado` | `character varying` | NOT NULL | Campo que foi alterado |
| `valor_anterior` | `text` | | Valor anterior |
| `valor_novo` | `text` | | Novo valor |
| `usuario_id` | `uuid` | NOT NULL, FK → auth.users(id) | Usuário que fez a alteração |
| `motivo` | `text` | | Motivo da alteração |
| `data_alteracao` | `timestamp with time zone` | DEFAULT now() | Data da alteração |

### Tabela: `documentos_pacientes`

**Descrição:** Documentos e arquivos associados aos pacientes.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|----------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identificador único |
| `paciente_id` | `uuid` | NOT NULL, FK → pacientes(id) | Paciente proprietário |
| `clinica_id` | `uuid` | NOT NULL, FK → clinicas(id) | Clínica |
| `nome_arquivo` | `text` | NOT NULL | Nome do arquivo |
| `tipo_arquivo` | `text` | NOT NULL | Tipo/extensão do arquivo |
| `tamanho_arquivo` | `integer` | NOT NULL | Tamanho em bytes |
| `url_arquivo` | `text` | NOT NULL | URL do arquivo |
| `categoria` | `text` | DEFAULT 'outro', CHECK | Categoria do documento |
| `descricao` | `text` | | Descrição do documento |
| `data_documento` | `date` | | Data do documento |
| `criado_por` | `uuid` | FK → auth.users(id) | Usuário que fez upload |
| `criado_em` | `timestamp with time zone` | DEFAULT now() | Data de criação |
| `atualizado_em` | `timestamp with time zone` | DEFAULT now() | Data da última atualização |

**Valores permitidos para `categoria`:**
- `exame`
- `receita`
- `atestado`
- `documento_pessoal`
- `outro`

---

## 3. Sistema de Consultas e Agendamentos

### Tabela: `consultas`

**Descrição:** Agendamentos e consultas médicas.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|----------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identificador único |
| `clinica_id` | `uuid` | NOT NULL, FK → clinicas(id) | Clínica |
| `paciente_id` | `uuid` | NOT NULL, FK → pacientes(id) | Paciente |
| `medico_id` | `uuid` | NOT NULL, FK → perfis(id) | Médico responsável |
| `titulo` | `text` | NOT NULL | Título da consulta |
| `descricao` | `text` | | Descrição detalhada |
| `data_consulta` | `timestamp with time zone` | NOT NULL | Data e hora da consulta |
| `duracao_minutos` | `integer` | DEFAULT 60 | Duração em minutos |
| `status` | `text` | DEFAULT 'agendada', CHECK | Status da consulta |
| `google_calendar_event_id` | `text` | | ID do evento no Google Calendar |
| `lembrete_enviado` | `boolean` | DEFAULT false | Se lembrete foi enviado |
| `observacoes` | `text` | | Observações adicionais |
| `criado_em` | `timestamp with time zone` | DEFAULT now() | Data de criação |
| `atualizado_em` | `timestamp with time zone` | DEFAULT now() | Data da última atualização |

**Valores permitidos para `status`:**
- `agendada`
- `confirmada`
- `realizada`
- `cancelada`
- `faltou`

---

## 4. Sistema de Comunicação e IA

### Tabela: `conversas`

**Descrição:** Conversas com pacientes através de diferentes plataformas.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|----------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identificador único |
| `clinica_id` | `uuid` | NOT NULL, FK → clinicas(id) | Clínica |
| `paciente_id` | `uuid` | NOT NULL, FK → pacientes(id) | Paciente |
| `plataforma` | `text` | NOT NULL, CHECK | Plataforma de origem |
| `id_conversa_plataforma` | `text` | NOT NULL | ID da conversa na plataforma |
| `status` | `text` | DEFAULT 'ativa', CHECK | Status da conversa |
| `atribuida_para` | `uuid` | FK → perfis(id) | Usuário responsável |
| `ultima_mensagem_em` | `timestamp with time zone` | DEFAULT now() | Última mensagem |
| `criado_em` | `timestamp with time zone` | DEFAULT now() | Data de criação |
| `atualizado_em` | `timestamp with time zone` | DEFAULT now() | Data da última atualização |

**Valores permitidos para `plataforma`:**
- `whatsapp`
- `instagram`

**Valores permitidos para `status`:**
- `ativa`
- `fechada`
- `escalada`

### Tabela: `mensagens`

**Descrição:** Mensagens individuais dentro das conversas.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|----------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identificador único |
| `conversa_id` | `uuid` | NOT NULL, FK → conversas(id) | Conversa |
| `tipo_remetente` | `text` | NOT NULL, CHECK | Tipo do remetente |
| `remetente_id` | `uuid` | FK → perfis(id) | ID do remetente (se aplicável) |
| `conteudo` | `text` | NOT NULL | Conteúdo da mensagem |
| `tipo_mensagem` | `text` | DEFAULT 'texto', CHECK | Tipo da mensagem |
| `metadados` | `jsonb` | DEFAULT '{}' | Metadados adicionais |
| `id_mensagem_plataforma` | `text` | | ID na plataforma original |
| `gerada_por_ia` | `boolean` | DEFAULT false | Se foi gerada por IA |
| `confianca_ia` | `double precision` | | Nível de confiança da IA |
| `criado_em` | `timestamp with time zone` | DEFAULT now() | Data de criação |

**Valores permitidos para `tipo_remetente`:**
- `paciente`
- `ia`
- `humano`
- `sistema`

**Valores permitidos para `tipo_mensagem`:**
- `texto`
- `imagem`
- `audio`
- `documento`
- `localizacao`

### Tabela: `contextos_ia`

**Descrição:** Contextos mantidos pela IA para cada conversa.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|----------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identificador único |
| `conversa_id` | `uuid` | NOT NULL, FK → conversas(id) | Conversa |
| `dados_contexto` | `jsonb` | NOT NULL | Dados do contexto em JSON |
| `ultima_atualizacao` | `timestamp with time zone` | DEFAULT now() | Última atualização |

### Tabela: `base_conhecimento`

**Descrição:** Base de conhecimento para a IA da clínica.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|----------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identificador único |
| `clinica_id` | `uuid` | NOT NULL, FK → clinicas(id) | Clínica |
| `titulo` | `text` | NOT NULL | Título do conhecimento |
| `conteudo` | `text` | NOT NULL | Conteúdo |
| `categoria` | `text` | | Categoria |
| `tags` | `text[]` | | Tags para busca |
| `embedding` | `USER-DEFINED` | | Embedding vetorial |
| `ativo` | `boolean` | DEFAULT true | Se está ativo |
| `criado_por` | `uuid` | FK → perfis(id) | Criador |
| `criado_em` | `timestamp with time zone` | DEFAULT now() | Data de criação |
| `atualizado_em` | `timestamp with time zone` | DEFAULT now() | Data da última atualização |

---

## 5. Integrações Externas

### Tabela: `integracoes`

**Descrição:** Configurações de integrações com serviços externos.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|----------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identificador único |
| `clinica_id` | `uuid` | NOT NULL, FK → clinicas(id) | Clínica |
| `tipo` | `text` | NOT NULL, CHECK | Tipo de integração |
| `nome` | `text` | NOT NULL | Nome da integração |
| `configuracao` | `jsonb` | NOT NULL | Configurações em JSON |
| `ativo` | `boolean` | DEFAULT true | Se está ativa |
| `ultima_sincronizacao` | `timestamp with time zone` | | Última sincronização |
| `criado_em` | `timestamp with time zone` | DEFAULT now() | Data de criação |
| `atualizado_em` | `timestamp with time zone` | DEFAULT now() | Data da última atualização |

**Valores permitidos para `tipo`:**
- `whatsapp`
- `instagram`
- `google_calendar`
- `n8n`

---

## 6. Auditoria e Logs

### Tabela: `logs_atividade`

**Descrição:** Logs de atividades do sistema para auditoria.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|----------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identificador único |
| `clinica_id` | `uuid` | NOT NULL, FK → clinicas(id) | Clínica |
| `usuario_id` | `uuid` | FK → perfis(id) | Usuário (se aplicável) |
| `acao` | `text` | NOT NULL | Ação realizada |
| `tipo_recurso` | `text` | NOT NULL | Tipo de recurso afetado |
| `recurso_id` | `uuid` | | ID do recurso |
| `detalhes` | `jsonb` | | Detalhes em JSON |
| `endereco_ip` | `inet` | | Endereço IP |
| `user_agent` | `text` | | User Agent |
| `criado_em` | `timestamp with time zone` | DEFAULT now() | Data de criação |

---

## Relacionamentos Principais

### Hierarquia de Dados
```
Clinicas
├── Perfis (usuários da clínica)
├── Pacientes
│   ├── Documentos
│   ├── Histórico de alterações
│   └── Conversas
│       └── Mensagens
│           └── Contextos IA
├── Consultas
├── Base de Conhecimento
├── Integrações
└── Logs de Atividade
```

### Relacionamentos Críticos

1. **Perfis ↔ Supabase Auth**: Cada perfil está vinculado a um usuário do sistema de autenticação
2. **Consultas**: Relaciona clínica, paciente e médico (perfil)
3. **Conversas**: Conecta pacientes com a clínica através de diferentes plataformas
4. **Auditoria**: Histórico de pacientes e logs de atividade mantêm rastreabilidade

---

## Constraints e Validações

### Validações Customizadas
- **CPF**: Função `validar_cpf()` para validação de CPF
- **Enums**: Múltiplos campos com valores restritos via CHECK constraints
- **Unicidade**: Email em perfis, CPF em pacientes

### Índices Recomendados
```sql
-- Índices para performance
CREATE INDEX idx_pacientes_clinica_id ON pacientes(clinica_id);
CREATE INDEX idx_consultas_data ON consultas(data_consulta);
CREATE INDEX idx_consultas_medico ON consultas(medico_id);
CREATE INDEX idx_conversas_paciente ON conversas(paciente_id);
CREATE INDEX idx_mensagens_conversa ON mensagens(conversa_id);
```

---

## Tabela de Autenticação (Supabase Auth)

### auth.users
**Descrição**: Tabela gerenciada pelo Supabase Auth para autenticação de usuários

| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| id | uuid | Identificador único do usuário | PRIMARY KEY |
| email | text | Email do usuário | UNIQUE |
| encrypted_password | text | Senha criptografada | |
| email_confirmed_at | timestamptz | Data de confirmação do email | |
| phone | text | Número de telefone | |
| phone_confirmed_at | timestamptz | Data de confirmação do telefone | |
| confirmed_at | timestamptz | Data de confirmação (email ou telefone) | |
| last_sign_in_at | timestamptz | Último login | |
| raw_app_meta_data | jsonb | Metadados da aplicação | |
| raw_user_meta_data | jsonb | Metadados do usuário | |
| is_super_admin | boolean | Indica se é super admin | |
| created_at | timestamptz | Data de criação | |
| updated_at | timestamptz | Data de atualização | |
| role | text | Papel do usuário (authenticated/anon) | |
| aud | text | Audience claim | |

**Observações**:
- Schema `auth` não é exposto na API auto-gerada por segurança
- `raw_user_meta_data` armazena dados personalizados do usuário
- Colunas gerenciadas pelo Supabase podem mudar sem aviso

---

## Considerações de Segurança

1. **RLS (Row Level Security)**: Implementar políticas para isolamento por clínica
2. **Auditoria**: Todas as alterações críticas são logadas
3. **Validação**: Constraints garantem integridade dos dados
4. **Referências**: Foreign keys mantêm consistência relacional
5. **Schema Auth**: Schema `auth` protegido e não acessível via API pública

---

## Integração com Supabase Auth

### Padrão Recomendado para Perfis de Usuário
```sql
-- Exemplo de trigger para sincronização automática
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfis (id, nome_completo, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'nome_completo',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger executado a cada novo usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Políticas RLS Recomendadas
```sql
-- Exemplo para tabela perfis
CREATE POLICY "Usuários podem ver apenas seu próprio perfil"
  ON perfis FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar apenas seu próprio perfil"
  ON perfis FOR UPDATE
  USING (auth.uid() = id);
```

## Notas de Implementação

- **UUIDs**: Todos os IDs primários usam UUID v4
- **Timestamps**: Campos de data usam `timestamp with time zone`
- **JSON**: Configurações e metadados em formato JSONB
- **Arrays**: Suporte nativo para arrays em campos como alergias e medicamentos
- **Soft Delete**: Alguns registros usam campos de status ao invés de exclusão física
- **Auth Integration**: Usar apenas chaves primárias como referências para tabelas gerenciadas pelo Supabase
- **Triggers**: Implementar triggers para sincronização automática entre auth.users e perfis
- **RLS**: Configurar políticas de segurança em nível de linha para isolamento de dados

---

*Última atualização: Janeiro 2025*
*Versão do Schema: 1.0*