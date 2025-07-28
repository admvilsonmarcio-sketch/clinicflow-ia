-- MediFlow Database Schema
-- Supabase PostgreSQL + Vector Extension

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================
-- AUTENTICAÇÃO E USUÁRIOS
-- =============================================

-- Tabela de perfis (estende auth.users do Supabase)
CREATE TABLE perfis (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nome_completo TEXT NOT NULL,
    foto_url TEXT,
    telefone TEXT,
    cargo TEXT CHECK (cargo IN ('admin', 'medico', 'assistente', 'recepcionista')) DEFAULT 'medico',
    clinica_id UUID,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clínicas/consultórios
CREATE TABLE clinicas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    endereco TEXT,
    telefone TEXT,
    email TEXT,
    site TEXT,
    logo_url TEXT,
    configuracoes JSONB DEFAULT '{}',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar chave estrangeira aos perfis
ALTER TABLE perfis ADD CONSTRAINT fk_perfis_clinica 
    FOREIGN KEY (clinica_id) REFERENCES clinicas(id);

-- =============================================
-- PACIENTES
-- =============================================

CREATE TABLE pacientes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clinica_id UUID REFERENCES clinicas(id) NOT NULL,
    nome_completo TEXT NOT NULL,
    email TEXT,
    telefone TEXT NOT NULL,
    data_nascimento DATE,
    genero TEXT CHECK (genero IN ('masculino', 'feminino', 'outro')),
    endereco TEXT,
    contato_emergencia TEXT,
    telefone_emergencia TEXT,
    historico_medico TEXT,
    alergias TEXT,
    medicamentos TEXT,
    observacoes TEXT,
    whatsapp_id TEXT, -- ID do WhatsApp para integração
    instagram_id TEXT, -- ID do Instagram para integração
    ultimo_contato TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('ativo', 'inativo', 'bloqueado')) DEFAULT 'ativo',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CONSULTAS E AGENDAMENTOS
-- =============================================

CREATE TABLE consultas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clinica_id UUID REFERENCES clinicas(id) NOT NULL,
    paciente_id UUID REFERENCES pacientes(id) NOT NULL,
    medico_id UUID REFERENCES perfis(id) NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_consulta TIMESTAMP WITH TIME ZONE NOT NULL,
    duracao_minutos INTEGER DEFAULT 60,
    status TEXT CHECK (status IN ('agendada', 'confirmada', 'realizada', 'cancelada', 'faltou')) DEFAULT 'agendada',
    google_calendar_event_id TEXT, -- ID do evento no Google Calendar
    lembrete_enviado BOOLEAN DEFAULT FALSE,
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DOCUMENTOS DE PACIENTES
-- =============================================

CREATE TABLE documentos_pacientes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE NOT NULL,
    clinica_id UUID REFERENCES clinicas(id) NOT NULL,
    nome_arquivo TEXT NOT NULL,
    tipo_arquivo TEXT NOT NULL, -- 'pdf', 'jpg', 'png', 'doc', etc.
    tamanho_arquivo INTEGER NOT NULL, -- em bytes
    url_arquivo TEXT NOT NULL, -- URL do Supabase Storage
    categoria TEXT CHECK (categoria IN ('exame', 'receita', 'atestado', 'documento_pessoal', 'outro')) DEFAULT 'outro',
    descricao TEXT,
    data_documento DATE,
    criado_por UUID REFERENCES auth.users(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para documentos
CREATE INDEX idx_documentos_paciente_id ON documentos_pacientes(paciente_id);
CREATE INDEX idx_documentos_clinica_id ON documentos_pacientes(clinica_id);
CREATE INDEX idx_documentos_categoria ON documentos_pacientes(categoria);
CREATE INDEX idx_documentos_criado_em ON documentos_pacientes(criado_em);

-- =============================================
-- CONVERSAS E MENSAGENS
-- =============================================

CREATE TABLE conversas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clinica_id UUID REFERENCES clinicas(id) NOT NULL,
    paciente_id UUID REFERENCES pacientes(id) NOT NULL,
    plataforma TEXT CHECK (plataforma IN ('whatsapp', 'instagram')) NOT NULL,
    id_conversa_plataforma TEXT NOT NULL, -- ID da conversa na plataforma
    status TEXT CHECK (status IN ('ativa', 'fechada', 'escalada')) DEFAULT 'ativa',
    atribuida_para UUID REFERENCES perfis(id), -- Atendente humano se escalado
    ultima_mensagem_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(plataforma, id_conversa_plataforma)
);

CREATE TABLE mensagens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversa_id UUID REFERENCES conversas(id) NOT NULL,
    tipo_remetente TEXT CHECK (tipo_remetente IN ('paciente', 'ia', 'humano', 'sistema')) NOT NULL,
    remetente_id UUID REFERENCES perfis(id), -- NULL se for paciente ou IA
    conteudo TEXT NOT NULL,
    tipo_mensagem TEXT CHECK (tipo_mensagem IN ('texto', 'imagem', 'audio', 'documento', 'localizacao')) DEFAULT 'texto',
    metadados JSONB DEFAULT '{}', -- Dados extras da mensagem
    id_mensagem_plataforma TEXT, -- ID da mensagem na plataforma
    gerada_por_ia BOOLEAN DEFAULT FALSE,
    confianca_ia FLOAT, -- Confiança da resposta da IA (0-1)
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- IA E BASE DE CONHECIMENTO
-- =============================================

-- Base de conhecimento para contexto da IA
CREATE TABLE base_conhecimento (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clinica_id UUID REFERENCES clinicas(id) NOT NULL,
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    categoria TEXT, -- 'faq', 'procedimento', 'politica', etc.
    tags TEXT[],
    embedding vector(1536), -- Dimensão dos embeddings do OpenAI
    ativo BOOLEAN DEFAULT TRUE,
    criado_por UUID REFERENCES perfis(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contexto de conversas da IA
CREATE TABLE contextos_ia (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversa_id UUID REFERENCES conversas(id) NOT NULL,
    dados_contexto JSONB NOT NULL, -- Contexto da conversa para IA
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INTEGRAÇÕES
-- =============================================

CREATE TABLE integracoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clinica_id UUID REFERENCES clinicas(id) NOT NULL,
    tipo TEXT CHECK (tipo IN ('whatsapp', 'instagram', 'google_calendar', 'n8n')) NOT NULL,
    nome TEXT NOT NULL,
    configuracao JSONB NOT NULL, -- Configurações da integração
    ativo BOOLEAN DEFAULT TRUE,
    ultima_sincronizacao TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- AUDITORIA E LOGS
-- =============================================

CREATE TABLE logs_atividade (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clinica_id UUID REFERENCES clinicas(id) NOT NULL,
    usuario_id UUID REFERENCES perfis(id),
    acao TEXT NOT NULL,
    tipo_recurso TEXT NOT NULL, -- 'paciente', 'consulta', 'mensagem', etc.
    recurso_id UUID,
    detalhes JSONB,
    endereco_ip INET,
    user_agent TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices de pacientes
CREATE INDEX idx_pacientes_clinica_id ON pacientes(clinica_id);
CREATE INDEX idx_pacientes_telefone ON pacientes(telefone);
CREATE INDEX idx_pacientes_whatsapp_id ON pacientes(whatsapp_id);

-- Índices de consultas
CREATE INDEX idx_consultas_clinica_id ON consultas(clinica_id);
CREATE INDEX idx_consultas_paciente_id ON consultas(paciente_id);
CREATE INDEX idx_consultas_medico_id ON consultas(medico_id);
CREATE INDEX idx_consultas_data ON consultas(data_consulta);
CREATE INDEX idx_consultas_status ON consultas(status);

-- Índices de mensagens
CREATE INDEX idx_mensagens_conversa_id ON mensagens(conversa_id);
CREATE INDEX idx_mensagens_criado_em ON mensagens(criado_em);

-- Índices de conversas
CREATE INDEX idx_conversas_clinica_id ON conversas(clinica_id);
CREATE INDEX idx_conversas_paciente_id ON conversas(paciente_id);
CREATE INDEX idx_conversas_plataforma ON conversas(plataforma);

-- Índice de similaridade vetorial para base de conhecimento
CREATE INDEX idx_base_conhecimento_embedding ON base_conhecimento 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- =============================================
-- SEGURANÇA DE LINHA (RLS)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE base_conhecimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE contextos_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE integracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_atividade ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (usuários só podem acessar dados de sua clínica)
CREATE POLICY "Usuários podem ver próprio perfil" ON perfis
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Usuários podem acessar dados da clínica" ON clinicas
    FOR ALL USING (
        id IN (
            SELECT clinica_id FROM perfis WHERE id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem acessar pacientes da clínica" ON pacientes
    FOR ALL USING (
        clinica_id IN (
            SELECT clinica_id FROM perfis WHERE id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem acessar documentos da clínica" ON documentos_pacientes
    FOR ALL USING (
        clinica_id IN (
            SELECT clinica_id FROM perfis WHERE id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem acessar consultas da clínica" ON consultas
    FOR ALL USING (
        clinica_id IN (
            SELECT clinica_id FROM perfis WHERE id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem acessar conversas da clínica" ON conversas
    FOR ALL USING (
        clinica_id IN (
            SELECT clinica_id FROM perfis WHERE id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem acessar mensagens da clínica" ON mensagens
    FOR ALL USING (
        conversa_id IN (
            SELECT id FROM conversas WHERE clinica_id IN (
                SELECT clinica_id FROM perfis WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Usuários podem acessar base de conhecimento da clínica" ON base_conhecimento
    FOR ALL USING (
        clinica_id IN (
            SELECT clinica_id FROM perfis WHERE id = auth.uid()
        )
    );

-- =============================================
-- FUNÇÕES E TRIGGERS
-- =============================================

-- Função para atualizar timestamp de atualização
CREATE OR REPLACE FUNCTION atualizar_timestamp_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger de atualização às tabelas relevantes
CREATE TRIGGER trigger_perfis_atualizado_em BEFORE UPDATE ON perfis
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp_atualizacao();

CREATE TRIGGER trigger_clinicas_atualizado_em BEFORE UPDATE ON clinicas
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp_atualizacao();

CREATE TRIGGER trigger_pacientes_atualizado_em BEFORE UPDATE ON pacientes
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp_atualizacao();

CREATE TRIGGER trigger_documentos_pacientes_atualizado_em BEFORE UPDATE ON documentos_pacientes
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp_atualizacao();

CREATE TRIGGER trigger_consultas_atualizado_em BEFORE UPDATE ON consultas
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp_atualizacao();

CREATE TRIGGER trigger_conversas_atualizado_em BEFORE UPDATE ON conversas
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp_atualizacao();

-- Função para criar perfil ao registrar usuário
CREATE OR REPLACE FUNCTION public.criar_perfil_novo_usuario()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.perfis (id, email, nome_completo)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'nome_completo', ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil no registro
CREATE TRIGGER trigger_criar_perfil_usuario
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.criar_perfil_novo_usuario();