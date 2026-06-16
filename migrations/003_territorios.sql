-- ================================================================
-- TEKOA — Migração: Alcunha das comunidades + Escopo territorial
-- ================================================================
-- 1. Comunidades ganham "alcunha" (kind): aldeia, quilombo, favela...
-- 2. Trocas/Feira/Mural ganham território de origem (community) e
--    alcance (reach): só na comunidade, comunidades específicas ou todas.
--
-- Execute no SQL Editor do Supabase (ver migrations/README.md).
-- ================================================================

-- ----------------------------------------------------------------
-- 1. Alcunha (tipo) da comunidade
-- ----------------------------------------------------------------
ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS kind TEXT;

-- ----------------------------------------------------------------
-- 2. Escopo territorial nos registros
--    reach: 'own' (só na comunidade) | 'selected' (específicas) | 'all'
--    Default 'own' — território primeiro. Use 'all' só quando o autor
--    escolher "em todos os territórios" no formulário.
-- ----------------------------------------------------------------
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS community TEXT,
  ADD COLUMN IF NOT EXISTS reach TEXT NOT NULL DEFAULT 'own',
  ADD COLUMN IF NOT EXISTS reach_communities TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS community TEXT,
  ADD COLUMN IF NOT EXISTS reach TEXT NOT NULL DEFAULT 'own',
  ADD COLUMN IF NOT EXISTS reach_communities TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.mural_posts
  ADD COLUMN IF NOT EXISTS community TEXT,
  ADD COLUMN IF NOT EXISTS reach TEXT NOT NULL DEFAULT 'own',
  ADD COLUMN IF NOT EXISTS reach_communities TEXT[] NOT NULL DEFAULT '{}';

-- ----------------------------------------------------------------
-- 3. Backfill: território de origem = comunidade (location) do autor
-- ----------------------------------------------------------------
UPDATE public.services s
  SET community = u.location
  FROM public.users u
  WHERE u.id = s.user_id AND s.community IS NULL;

UPDATE public.products p
  SET community = u.location
  FROM public.users u
  WHERE u.id = p.user_id AND p.community IS NULL;

UPDATE public.mural_posts m
  SET community = u.location
  FROM public.users u
  WHERE u.id = m.user_id AND m.community IS NULL;

-- ----------------------------------------------------------------
-- 4. Registros que herdaram reach = 'all' (instalações antigas da migração)
--    ficam restritos à comunidade de origem.
-- ----------------------------------------------------------------
UPDATE public.services SET reach = 'own' WHERE reach = 'all';
UPDATE public.products SET reach = 'own' WHERE reach = 'all';
UPDATE public.mural_posts SET reach = 'own' WHERE reach = 'all';

-- Índices para o filtro por território
CREATE INDEX IF NOT EXISTS idx_services_community ON public.services(community);
CREATE INDEX IF NOT EXISTS idx_products_community ON public.products(community);
CREATE INDEX IF NOT EXISTS idx_mural_posts_community ON public.mural_posts(community);
