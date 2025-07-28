-- Script para atualizar o banco de dados com a tabela de documentos
-- Execute este script no SQL Editor do Supabase Dashboard

-- Criar tabela de documentos de pacientes
CREATE TABLE IF NOT EXISTS documentos_pacientes (
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

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_documentos_paciente_id ON documentos_pacientes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_documentos_clinica_id ON documentos_pacientes(clinica_id);
CREATE INDEX IF NOT EXISTS idx_documentos_categoria ON documentos_pacientes(categoria);
CREATE INDEX IF NOT EXISTS idx_documentos_criado_em ON documentos_pacientes(criado_em);

-- Habilitar Row Level Security
ALTER TABLE documentos_pacientes ENABLE ROW LEVEL SECURITY;

-- Criar política de segurança
CREATE POLICY "Usuários podem acessar documentos da sua clínica" ON documentos_pacientes
    FOR ALL USING (
        clinica_id IN (
            SELECT clinica_id FROM perfis WHERE id = auth.uid()
        )
    );

-- Criar trigger para atualizar timestamp
CREATE OR REPLACE FUNCTION update_documentos_pacientes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_documentos_pacientes_updated_at
    BEFORE UPDATE ON documentos_pacientes
    FOR EACH ROW
    EXECUTE FUNCTION update_documentos_pacientes_updated_at();

-- Verificar se a tabela foi criada corretamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'documentos_pacientes'
ORDER BY ordinal_position;