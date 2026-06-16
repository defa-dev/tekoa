-- ================================================================
-- TEKOA — Migração: Comunidades + papel de Admin
-- ================================================================
-- Transforma "comunidade" (hoje texto livre em users.location) numa
-- entidade de verdade, gerenciável por administradores.
--
-- Execute no SQL Editor do Supabase (ver migrations/README.md).
-- ================================================================

-- ----------------------------------------------------------------
-- 1. Papel de admin no usuário
-- ----------------------------------------------------------------
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Função para checar admin do usuário atual.
-- SECURITY DEFINER evita recursão de RLS ao consultar public.users.
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_admin FROM public.users WHERE id = auth.uid()), false)
$$;

-- ----------------------------------------------------------------
-- 2. Tabela de comunidades
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL CHECK (length(name) >= 2 AND length(name) <= 120),
  description TEXT CHECK (length(description) <= 2000),
  address TEXT CHECK (length(address) <= 300),
  lat NUMERIC(9, 6),
  lng NUMERIC(9, 6),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_communities_name ON public.communities(name);

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- Todos podem ver as comunidades
CREATE POLICY "Communities are viewable by everyone"
  ON public.communities FOR SELECT USING (true);

-- Apenas admins criam/editam/removem
CREATE POLICY "Admins can insert communities"
  ON public.communities FOR INSERT TO authenticated
  WITH CHECK (public.current_user_is_admin());

CREATE POLICY "Admins can update communities"
  ON public.communities FOR UPDATE TO authenticated
  USING (public.current_user_is_admin());

CREATE POLICY "Admins can delete communities"
  ON public.communities FOR DELETE TO authenticated
  USING (public.current_user_is_admin());

-- updated_at automático (reusa a função do schema base)
DROP TRIGGER IF EXISTS set_updated_at_communities ON public.communities;
CREATE TRIGGER set_updated_at_communities
  BEFORE UPDATE ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------
-- 3. Define o administrador inicial
-- ----------------------------------------------------------------
UPDATE public.users SET is_admin = true WHERE email = 'phelipe2208@gmail.com';

-- Para tornar outra pessoa admin no futuro:
--   UPDATE public.users SET is_admin = true WHERE email = 'outro@email.com';
-- ================================================================
