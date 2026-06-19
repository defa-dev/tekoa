-- ================================================================
-- TEKOA — Tekoins Fase 5 (parte 1): admin de comunidade + fundo real
-- ================================================================
-- Admin de comunidade é atribuído por um admin da plataforma (papel já
-- existente: users.is_admin / current_user_is_admin(), de 002). Default:
-- quem cadastrou a comunidade é admin até alguém ser definido.
-- O fundo comunitário deixa de ser só o ranking de leitura da Fase 4 e
-- passa a ter saldo real, gasto em mutirões. Ver docs/feature-tekoins.md.
-- ================================================================

alter table public.communities
  add column if not exists created_by uuid references public.users(id) on delete set null;

create table if not exists public.community_admins (
  id uuid primary key default uuid_generate_v4(),
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  assigned_by uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default now(),
  unique (community_id, user_id)
);

create index if not exists idx_community_admins_community on public.community_admins(community_id);

alter table public.community_admins enable row level security;

drop policy if exists "Anyone can view community admins" on public.community_admins;
create policy "Anyone can view community admins"
  on public.community_admins for select
  using (true);
-- Insert/delete só via admin client (action valida current_user_is_admin()).

create table if not exists public.community_funds (
  community_id uuid primary key references public.communities(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0)
);

alter table public.community_funds enable row level security;

drop policy if exists "Anyone can view community funds" on public.community_funds;
create policy "Anyone can view community funds"
  on public.community_funds for select
  using (true);

create table if not exists public.community_fund_transactions (
  id uuid primary key default uuid_generate_v4(),
  community_id uuid not null references public.communities(id) on delete cascade,
  amount integer not null,
  type text not null check (type in ('mutirao_extra', 'admin_topup')),
  reference_id uuid,
  created_at timestamp with time zone default now()
);

create index if not exists idx_community_fund_tx_community
  on public.community_fund_transactions(community_id);

alter table public.community_fund_transactions enable row level security;

drop policy if exists "Anyone can view community fund transactions" on public.community_fund_transactions;
create policy "Anyone can view community fund transactions"
  on public.community_fund_transactions for select
  using (true);

-- Recalcula o saldo do fundo a partir do próprio ledger, mesmo princípio
-- do recalc_tekoin_balance() da Fase 1.
create or replace function public.recalc_community_fund_balance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_community uuid;
begin
  affected_community := coalesce(NEW.community_id, OLD.community_id);
  insert into public.community_funds (community_id, balance)
  values (
    affected_community,
    (select coalesce(sum(amount), 0) from public.community_fund_transactions where community_id = affected_community)
  )
  on conflict (community_id) do update set balance = excluded.balance;
  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists on_community_fund_transaction_change on public.community_fund_transactions;
create trigger on_community_fund_transaction_change
  after insert or update or delete on public.community_fund_transactions
  for each row
  execute function public.recalc_community_fund_balance();
