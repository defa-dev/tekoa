-- ================================================================
-- TEKOA — Tekoins Fase 2: gasto dentro do app
-- ================================================================
-- Destaque/prioridade em anúncios (consumível, com expiração) e badges
-- (conquistados por marco de saldo, nunca comprados).
-- Ver docs/feature-tekoins.md. Execute no SQL Editor do Supabase.
-- ================================================================

-- Amplia os tipos de transação e o que pode ser referenciado, mantendo o
-- mesmo ledger único (tekoin_transactions) desenhado na Fase 1.
alter table public.tekoin_transactions
  drop constraint if exists tekoin_transactions_type_check;
alter table public.tekoin_transactions
  add constraint tekoin_transactions_type_check
  check (type in ('earned_rating', 'earned_aviso', 'admin_adjustment', 'spent_highlight', 'spent_priority'));

alter table public.tekoin_transactions
  drop constraint if exists tekoin_transactions_reference_type_check;
alter table public.tekoin_transactions
  add constraint tekoin_transactions_reference_type_check
  check (reference_type in ('trade', 'aviso', 'service', 'product'));

create table if not exists public.tekoin_boosts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  service_id uuid references public.services(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  kind text not null check (kind in ('highlight', 'priority')),
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default now(),
  constraint tekoin_boosts_single_target check (
    (service_id is not null and product_id is null) or
    (service_id is null and product_id is not null)
  )
);

create index if not exists idx_tekoin_boosts_service
  on public.tekoin_boosts(service_id) where service_id is not null;
create index if not exists idx_tekoin_boosts_product
  on public.tekoin_boosts(product_id) where product_id is not null;
create index if not exists idx_tekoin_boosts_expires
  on public.tekoin_boosts(expires_at);

alter table public.tekoin_boosts enable row level security;

-- Leitura pública: as listagens de todo mundo precisam saber quem está
-- destacado/priorizado pra ordenar. Sem policy de insert pra usuário comum
-- (admin client, depois de validar saldo e posse do anúncio na action).
drop policy if exists "Anyone can view active boosts" on public.tekoin_boosts;
create policy "Anyone can view active boosts"
  on public.tekoin_boosts for select
  using (true);

create table if not exists public.tekoin_badges (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  badge_code text not null,
  earned_at timestamp with time zone default now(),
  unique (user_id, badge_code)
);

alter table public.tekoin_badges enable row level security;

drop policy if exists "Anyone can view badges" on public.tekoin_badges;
create policy "Anyone can view badges"
  on public.tekoin_badges for select
  using (true);
