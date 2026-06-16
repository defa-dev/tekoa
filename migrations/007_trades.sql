-- ================================================================
-- TEKOA — Tabela de trocas concluídas
-- ================================================================
-- Materializa o registro de uma troca ao encerrar o chat.
-- Permite histórico limpo por usuário, métricas de comunidade
-- e futura troca bilateral sem depender do status do chat.
-- Rode no SQL Editor (ver migrations/README.md).
-- ================================================================

CREATE TABLE public.trades (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id       UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  service_id    UUID REFERENCES public.services(id) ON DELETE SET NULL,
  participant_1 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  closed_by     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  outcome       TEXT NOT NULL CHECK (outcome IN ('completed', 'partial', 'cancelled')),
  closed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trades_participant_1  ON public.trades(participant_1);
CREATE INDEX idx_trades_participant_2  ON public.trades(participant_2);
CREATE INDEX idx_trades_service_id     ON public.trades(service_id) WHERE service_id IS NOT NULL;
CREATE INDEX idx_trades_closed_at      ON public.trades(closed_at DESC);
-- Para buscar o trade de um chat específico
CREATE UNIQUE INDEX idx_trades_chat_id ON public.trades(chat_id);

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Participantes podem ver suas próprias trocas
CREATE POLICY "Participants can view their trades"
  ON public.trades FOR SELECT
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Apenas participantes podem inserir (o insert vem do server action com admin client)
CREATE POLICY "Participants can insert trades"
  ON public.trades FOR INSERT
  WITH CHECK (auth.uid() = closed_by);
