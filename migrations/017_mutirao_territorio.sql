-- ================================================================
-- TEKOA — Território nos mutirões
-- ================================================================
-- Mesmo padrão de escopo territorial de services/products/mural_posts
-- (migration 003): community (origem), reach (own/selected/all) e
-- reach_communities. Independente de `community_id` (vínculo formal com
-- uma `communities` registrada, usado pro fundo comunitário) — são
-- conceitos diferentes: este é o território informal do organizador,
-- aquele é a comunidade formal cujo fundo pode financiar o extra.
-- Execute no SQL Editor do Supabase (ver migrations/README.md).
-- ================================================================

ALTER TABLE public.mutirao_requests
  ADD COLUMN IF NOT EXISTS community TEXT,
  ADD COLUMN IF NOT EXISTS reach TEXT NOT NULL DEFAULT 'own',
  ADD COLUMN IF NOT EXISTS reach_communities TEXT[] NOT NULL DEFAULT '{}';
