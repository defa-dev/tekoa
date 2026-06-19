-- ================================================================
-- TEKOA — Tekoins Fase 1: ledger e saldo
-- ================================================================
-- Mecanismo de recompensa por interação (avaliação pós-troca, avisos).
-- Saldo em users.tekoin_balance é só um cache: a fonte de verdade é o
-- ledger em tekoin_transactions, sempre reconstruível via trigger.
-- Ver docs/feature-tekoins.md para o desenho completo (fases 1-5).
-- Execute no SQL Editor do Supabase (ver migrations/README.md).
-- ================================================================

alter table public.users
  add column if not exists tekoin_balance integer not null default 0
    check (tekoin_balance >= 0);

create table if not exists public.tekoin_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  counterparty_id uuid references public.users(id) on delete set null,
  amount integer not null,
  type text not null check (type in ('earned_rating', 'earned_aviso', 'admin_adjustment')),
  reference_type text check (reference_type in ('trade', 'aviso')),
  reference_id uuid,
  created_at timestamp with time zone default now()
);

create index if not exists idx_tekoin_transactions_user_id
  on public.tekoin_transactions(user_id);
create index if not exists idx_tekoin_transactions_user_type_date
  on public.tekoin_transactions(user_id, type, created_at);

alter table public.tekoin_transactions enable row level security;

-- Usuário só lê suas próprias transações. Sem policy de insert pra usuário
-- comum: toda escrita passa pelo admin client (service role), depois de
-- validada na Server Action — igual o padrão já usado em `trades`.
create policy "Users can view their own tekoin transactions"
  on public.tekoin_transactions for select
  using (auth.uid() = user_id);

-- Recalcula o saldo a partir do ledger (soma completa, não incremental) —
-- mais simples e sempre correto, mesmo se uma transação for editada/removida
-- manualmente por um admin_adjustment futuro.
-- SECURITY DEFINER pelo mesmo motivo de current_user_is_admin() (migration
-- 002): evita que o saldo fique preso pela RLS de `users` quando a transação
-- não é inserida pelo próprio dono do saldo.
create or replace function public.recalc_tekoin_balance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_user uuid;
begin
  affected_user := coalesce(NEW.user_id, OLD.user_id);
  update public.users
  set tekoin_balance = (
    select coalesce(sum(amount), 0)
    from public.tekoin_transactions
    where user_id = affected_user
  )
  where id = affected_user;
  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists on_tekoin_transaction_change on public.tekoin_transactions;
create trigger on_tekoin_transaction_change
  after insert or update or delete on public.tekoin_transactions
  for each row
  execute function public.recalc_tekoin_balance();
