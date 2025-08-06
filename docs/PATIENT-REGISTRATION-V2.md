# Sistema de Cadastro de Pacientes v0.5.0-beta

## Visão Geral

O Sistema de Cadastro de Pacientes v2.0 do MediFlow foi completamente reformulado para atender às necessidades específicas do mercado brasileiro, oferecendo uma experiência moderna, intuitiva e completa para o registro de informações de pacientes.

## 🚀 Principais Funcionalidades

### ✅ Formulário Multi-Etapas
- **5 etapas sequenciais** com validação independente
- **Navegação livre** entre etapas já validadas
- **Indicadores visuais** de progresso e status
- **Auto-save** automático de rascunhos
- **Validação em tempo real** com feedback imediato
- **Notificações detalhadas** de erro com campos específicos
- **Formatação automática** de máscaras ao carregar dados

### ✅ Validações Brasileiras
- **CPF**: Validação completa com dígitos verificadores
- **CEP**: Formato brasileiro com integração ViaCEP
- **Telefone**: Suporte a celular (11 dígitos) e fixo (10 dígitos)
- **Email**: Validação de formato e domínio
- **Campos opcionais**: Validação robusta que aceita valores vazios
- **Telefone de emergência**: Validação opcional com formato correto

### ✅ Integração ViaCEP
- **Preenchimento automático** de endereço via CEP
- **Tratamento de erros** para CEPs inexistentes
- **Cache local** para otimização de performance
- **Timeout configurável** para requisições

### ✅ Sistema de Auditoria
- **Histórico completo** de alterações
- **Logs detalhados** de operações (INSERT, UPDATE, DELETE)
- **Rastreabilidade** por usuário e timestamp
- **Dados anteriores e novos** em formato JSON

### ✅ Recursos Avançados
- **QR Code único** para cada paciente
- **Campos estruturados** para informações médicas
- **Contato de emergência** completo
- **Tipo sanguíneo** e alergias
- **Medicamentos em uso** e histórico médico
- **Sistema de auditoria** completo com logs de alterações
- **Exclusão completa** com remoção automática de documentos do storage

## 📋 Estrutura do Formulário

### Etapa 1: Dados Pessoais
```
✅ Nome Completo (obrigatório)
✅ CPF (obrigatório, com validação)
✅ Data de Nascimento (obrigatório, com cálculo de idade)
✅ Gênero (obrigatório)
✅ RG (opcional)
✅ Órgão Emissor (opcional)
✅ UF do RG (opcional)
✅ Estado Civil (opcional)
✅ Profissão (opcional)
```

### Etapa 2: Contato
```
✅ Telefone Celular (obrigatório, com máscara)
✅ Telefone Fixo (opcional, com máscara)
✅ Email (obrigatório, com validação)
✅ Observações de Contato (opcional)
```

### Etapa 3: Endereço
```
✅ CEP (obrigatório, com ViaCEP)
✅ Logradouro (preenchido automaticamente)
✅ Número (obrigatório)
✅ Complemento (opcional)
✅ Bairro (preenchido automaticamente)
✅ Cidade (preenchida automaticamente)
✅ UF (preenchida automaticamente)
```

### Etapa 4: Contato de Emergência
```
✅ Nome do Contato (opcional)
✅ Parentesco (opcional)
✅ Telefone (opcional, com validação)
✅ Observações (opcional)
```

### Etapa 5: Informações Médicas
```
✅ Tipo Sanguíneo (opcional)
✅ Alergias Conhecidas (opcional, lista)
✅ Medicamentos em Uso (opcional, lista)
✅ Histórico Médico (opcional)
✅ Observações Gerais (opcional)
```

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **date-fns** - Manipulação de datas

### Backend
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados
- **Row Level Security (RLS)** - Segurança de dados
- **Triggers e Functions** - Lógica de negócio

### Integrações
- **ViaCEP API** - Consulta de endereços
- **Algoritmo CPF** - Validação de documentos

## 📊 Schema do Banco de Dados

### Tabela `pacientes`
```sql
CREATE TABLE pacientes (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id),
  
  -- Dados Pessoais (Obrigatórios)
  nome_completo VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  data_nascimento DATE NOT NULL,
  genero VARCHAR(20) NOT NULL,
  
  -- Documentos (Opcionais)
  rg VARCHAR(20),
  orgao_emissor VARCHAR(10),
  uf_rg VARCHAR(2),
  estado_civil VARCHAR(20),
  profissao VARCHAR(100),
  
  -- Contato (Obrigatórios)
  email VARCHAR(255) NOT NULL,
  telefone_celular VARCHAR(20) NOT NULL,
  telefone_fixo VARCHAR(20),
  
  -- Endereço (Obrigatório)
  cep VARCHAR(8) NOT NULL,
  logradouro VARCHAR(255) NOT NULL,
  numero VARCHAR(20) NOT NULL,
  complemento VARCHAR(100),
  bairro VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  uf VARCHAR(2) NOT NULL,
  
  -- Emergência (Opcional)
  nome_emergencia VARCHAR(255),
  parentesco_emergencia VARCHAR(50),
  telefone_emergencia VARCHAR(20),
  observacoes_emergencia TEXT,
  
  -- Médico (Opcional)
  tipo_sanguineo VARCHAR(5),
  alergias_conhecidas TEXT[],
  medicamentos_uso TEXT[],
  historico_medico_detalhado TEXT,
  observacoes_gerais TEXT,
  
  -- Sistema
  foto_url VARCHAR(500),
  qr_code VARCHAR(255) UNIQUE,
  data_ultima_consulta TIMESTAMP,
  status_ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);
```

### Tabela `pacientes_historico`
```sql
CREATE TABLE pacientes_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES pacientes(id),
  operacao VARCHAR(10) CHECK (operacao IN ('INSERT', 'UPDATE', 'DELETE')),
  dados_anteriores JSONB,
  dados_novos JSONB,
  usuario_id UUID,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Como Usar

### 1. Acessar o Formulário
```
Navegue para: /pacientes/novo
Ou clique em "Novo Paciente" no dashboard
```

### 2. Preenchimento por Etapas
```
1. Preencha os dados pessoais obrigatórios
2. Adicione informações de contato
3. Digite o CEP para preenchimento automático do endereço
4. Opcionalmente, adicione contato de emergência
5. Opcionalmente, adicione informações médicas
```

### 3. Navegação
```
- Use os botões "Anterior" e "Próximo" para navegar
- Clique diretamente nas etapas já validadas
- Use "Salvar Rascunho" para salvar progresso
- Clique "Finalizar Cadastro" para submeter
```

### 4. Validações
```
- CPF: Validação automática com dígitos verificadores
- CEP: Consulta automática no ViaCEP
- Telefone: Formatação automática (11) 99999-9999
- Email: Validação de formato em tempo real
```

## 🔒 Segurança e Privacidade

### Row Level Security (RLS)
- **Isolamento por clínica**: Cada clínica só acessa seus próprios pacientes
- **Autenticação obrigatória**: Todas as operações requerem login
- **Logs de auditoria**: Todas as alterações são registradas
- **Auditoria completa** de criação, edição e exclusão

### Validações de Segurança
- **CPF único** por clínica
- **Email único** por clínica
- **Sanitização** de todos os inputs
- **Validação dupla** (frontend + backend)
- **Validação robusta** de campos opcionais
- **Criptografia** de dados sensíveis

### Compliance
- **LGPD**: Conformidade com Lei Geral de Proteção de Dados
- **CFM**: Atende resoluções do Conselho Federal de Medicina
- **Auditoria**: Logs completos para compliance médico
- **Exclusão automática** de documentos associados
- **Limpeza completa** do storage e banco de dados

## 📈 Performance

### Otimizações Frontend
- **Lazy loading** de componentes
- **Debounce** em validações assíncronas
- **Cache** de consultas ViaCEP
- **Memoização** de componentes pesados

### Otimizações Backend
- **Índices** otimizados para consultas frequentes
- **Prepared statements** para queries repetitivas
- **Connection pooling** no Supabase
- **Compressão** de dados JSONB

## 🧪 Testes

### Validações Testadas
```typescript
// CPF
validarCPF('11144477735') // ✅ Válido
validarCPF('11111111111') // ❌ Inválido
validarCPF('123.456.789-09') // ✅ Válido (com formatação)

// CEP
validarCEP('01310100') // ✅ Válido
validarCEP('01310-100') // ✅ Válido (com formatação)
validarCEP('123') // ❌ Inválido

// Telefone
validarTelefone('11999887766') // ✅ Celular válido
validarTelefone('1133334444') // ✅ Fixo válido
validarTelefone('123') // ❌ Inválido
```

### Cenários de Teste
- ✅ Preenchimento completo do formulário
- ✅ Validação de campos obrigatórios
- ✅ Integração ViaCEP com CEPs válidos e inválidos
- ✅ Auto-save e recuperação de rascunhos
- ✅ Navegação entre etapas
- ✅ Submissão e salvamento no banco

## 📚 Documentação Adicional

- [Guia de Migração](./MIGRATION-GUIDE.md)
- [Roadmap Técnico](./TECHNICAL-ROADMAP.md)
- [Schema do Banco](../database-schema-v2.sql)
- [Script de Migração](../migration-v2.sql)

## 🆘 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação técnica
2. Verifique os logs de erro no console
3. Consulte o histórico de auditoria
4. Entre em contato com a equipe de desenvolvimento

---

**MediFlow v0.5.0-beta** - Sistema de Gestão Médica Moderno e Seguro