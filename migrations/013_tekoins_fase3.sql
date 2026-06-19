-- ================================================================
-- TEKOA — Tekoins Fase 3: doação na Feira (ponte pra moeda circulante)
-- ================================================================
-- O anunciante escolhe aceitar Tekoin como parte/todo do pagamento. Isso é
-- a primeira transferência P2P real do ledger: debita comprador, credita
-- vendedor — diferente das recompensas da Fase 1, que são mintadas, não
-- transferidas. Ver docs/feature-tekoins.md.
-- ================================================================

alter table public.products
  add column if not exists accepts_tekoins boolean not null default false;

alter table public.tekoin_transactions
  drop constraint if exists tekoin_transactions_type_check;
alter table public.tekoin_transactions
  add constraint tekoin_transactions_type_check
  check (type in (
    'earned_rating', 'earned_aviso', 'admin_adjustment',
    'spent_highlight', 'spent_priority', 'donated_feira'
  ));
