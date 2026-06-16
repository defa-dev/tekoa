-- ================================================================
-- TEKOA — Interesse em trocas (chat pendente até aceite)
-- ================================================================
-- Cada demonstração de interesse abre um chat com status 'pending'.
-- O dono do serviço aceita ou recusa; só então a conversa libera.
-- Rode no SQL Editor se ainda não aplicou.
-- ================================================================

ALTER TABLE public.chats
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS initiated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS offerer_service_id UUID REFERENCES public.services(id) ON DELETE SET NULL;

ALTER TABLE public.chats
  DROP CONSTRAINT IF EXISTS chats_status_check;

ALTER TABLE public.chats
  ADD CONSTRAINT chats_status_check
  CHECK (status IN ('pending', 'active', 'declined'));

-- Chats antigos e de produtos continuam ativos.
UPDATE public.chats SET status = 'active' WHERE status IS NULL;

CREATE INDEX IF NOT EXISTS idx_chats_service_initiator
  ON public.chats(service_id, initiated_by)
  WHERE service_id IS NOT NULL;
