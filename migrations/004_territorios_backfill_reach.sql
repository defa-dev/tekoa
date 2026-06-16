-- ================================================================
-- TEKOA — Correção: alcance dos registros pré-existentes
-- ================================================================
-- A migração inicial usou DEFAULT 'all' em reach, fazendo todo o
-- conteúdo antigo aparecer em todos os territórios. Publicações
-- anteriores ao escopo territorial devem ficar só na comunidade
-- de origem (reach = 'own').
--
-- Rode isto se você já executou migrations/003_territorios.sql
-- com DEFAULT 'all' em reach (corrige dados antigos).
-- ================================================================

UPDATE public.services
  SET reach = 'own'
  WHERE reach = 'all';

UPDATE public.products
  SET reach = 'own'
  WHERE reach = 'all';

UPDATE public.mural_posts
  SET reach = 'own'
  WHERE reach = 'all';

-- Novos registros sem reach explícito passam a nascer no território.
ALTER TABLE public.services
  ALTER COLUMN reach SET DEFAULT 'own';

ALTER TABLE public.products
  ALTER COLUMN reach SET DEFAULT 'own';

ALTER TABLE public.mural_posts
  ALTER COLUMN reach SET DEFAULT 'own';
