-- ================================================================
-- TEKOA — Adiciona status 'completed' ao chat
-- ================================================================
-- Permite encerrar uma conversa de troca com desfecho explícito.
-- Rode no SQL Editor (ver migrations/README.md).
-- ================================================================

ALTER TABLE public.chats
  DROP CONSTRAINT IF EXISTS chats_status_check;

ALTER TABLE public.chats
  ADD CONSTRAINT chats_status_check
  CHECK (status IN ('pending', 'active', 'declined', 'completed'));
