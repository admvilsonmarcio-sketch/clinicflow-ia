-- Correções para o banco MediFlow
-- Execute este script no Supabase SQL Editor se você já executou o schema anterior

-- Renomear tabela profiles para perfis (se necessário)
-- ALTER TABLE profiles RENAME TO perfis;

-- Atualizar função de criação de perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.perfis (id, email, nome_completo)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'nome_completo', ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();