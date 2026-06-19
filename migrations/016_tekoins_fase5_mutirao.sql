-- ================================================================
-- TEKOA — Tekoins Fase 5 (parte 2): Mutirão
-- ================================================================
-- Pedido multi-participante, paralelo ao pedido 1:1 (troca/feira/busca).
-- Decisão de arquitetura: o "chat em grupo" do mutirão vive em tabelas
-- PRÓPRIAS (mutirao_messages), em vez de estender chats/messages com um
-- modo de grupo. Isso evita relaxar a constraint NOT NULL de
-- participant_1/participant_2 e ramificar a RLS de chats/messages — a
-- mudança de maior risco que existia no desenho original. O 1:1 existente
-- (trocas, feira) fica inteiramente intocado.
-- Ver docs/feature-tekoins.md.
-- ================================================================

create table if not exists public.mutirao_requests (
  id uuid primary key default uuid_generate_v4(),
  organizer_id uuid not null references public.users(id) on delete cascade,
  community_id uuid references public.communities(id) on delete set null,
  title text not null check (length(title) >= 5 and length(title) <= 100),
  description text not null check (length(description) >= 10 and length(description) <= 1000),
  location text,
  scheduled_at timestamp with time zone,
  min_confirmations integer not null default 1 check (min_confirmations >= 1),
  status text not null default 'open' check (status in ('open', 'confirmed', 'completed', 'cancelled')),
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

create index if not exists idx_mutirao_requests_organizer on public.mutirao_requests(organizer_id);
create index if not exists idx_mutirao_requests_status on public.mutirao_requests(status);
create index if not exists idx_mutirao_requests_community on public.mutirao_requests(community_id) where community_id is not null;

alter table public.mutirao_requests enable row level security;

drop policy if exists "Mutiroes are viewable by everyone" on public.mutirao_requests;
create policy "Mutiroes are viewable by everyone"
  on public.mutirao_requests for select
  using (true);

drop policy if exists "Authenticated users can create mutiroes" on public.mutirao_requests;
create policy "Authenticated users can create mutiroes"
  on public.mutirao_requests for insert
  to authenticated
  with check (auth.uid() = organizer_id);

drop policy if exists "Organizer can update their mutirao" on public.mutirao_requests;
create policy "Organizer can update their mutirao"
  on public.mutirao_requests for update
  using (auth.uid() = organizer_id);

create table if not exists public.mutirao_confirmations (
  id uuid primary key default uuid_generate_v4(),
  mutirao_id uuid not null references public.mutirao_requests(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  confirmed_at timestamp with time zone default now(),
  attended boolean,
  unique (mutirao_id, user_id)
);

create index if not exists idx_mutirao_confirmations_mutirao on public.mutirao_confirmations(mutirao_id);

alter table public.mutirao_confirmations enable row level security;

drop policy if exists "Confirmations are viewable by everyone" on public.mutirao_confirmations;
create policy "Confirmations are viewable by everyone"
  on public.mutirao_confirmations for select
  using (true);

drop policy if exists "Users can confirm their own attendance" on public.mutirao_confirmations;
create policy "Users can confirm their own attendance"
  on public.mutirao_confirmations for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Organizer can update attendance" on public.mutirao_confirmations;
create policy "Organizer can update attendance"
  on public.mutirao_confirmations for update
  using (
    exists (
      select 1 from public.mutirao_requests
      where mutirao_requests.id = mutirao_confirmations.mutirao_id
      and mutirao_requests.organizer_id = auth.uid()
    )
  );

create table if not exists public.mutirao_messages (
  id uuid primary key default uuid_generate_v4(),
  mutirao_id uuid not null references public.mutirao_requests(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  content text not null check (length(content) >= 1 and length(content) <= 2000),
  created_at timestamp with time zone default now()
);

create index if not exists idx_mutirao_messages_mutirao on public.mutirao_messages(mutirao_id);

alter table public.mutirao_messages enable row level security;

-- Só organizador + quem confirmou presença participam do chat do mutirão.
drop policy if exists "Participants can view mutirao messages" on public.mutirao_messages;
create policy "Participants can view mutirao messages"
  on public.mutirao_messages for select
  using (
    exists (
      select 1 from public.mutirao_requests
      where mutirao_requests.id = mutirao_messages.mutirao_id
      and mutirao_requests.organizer_id = auth.uid()
    )
    or exists (
      select 1 from public.mutirao_confirmations
      where mutirao_confirmations.mutirao_id = mutirao_messages.mutirao_id
      and mutirao_confirmations.user_id = auth.uid()
    )
  );

drop policy if exists "Participants can send mutirao messages" on public.mutirao_messages;
create policy "Participants can send mutirao messages"
  on public.mutirao_messages for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and (
      exists (
        select 1 from public.mutirao_requests
        where mutirao_requests.id = mutirao_messages.mutirao_id
        and mutirao_requests.organizer_id = auth.uid()
      )
      or exists (
        select 1 from public.mutirao_confirmations
        where mutirao_confirmations.mutirao_id = mutirao_messages.mutirao_id
        and mutirao_confirmations.user_id = auth.uid()
      )
    )
  );

alter table public.tekoin_transactions
  drop constraint if exists tekoin_transactions_type_check;
alter table public.tekoin_transactions
  add constraint tekoin_transactions_type_check
  check (type in (
    'earned_rating', 'earned_aviso', 'admin_adjustment',
    'spent_highlight', 'spent_priority', 'donated_feira',
    'earned_mutirao_base'
  ));

alter table public.tekoin_transactions
  drop constraint if exists tekoin_transactions_reference_type_check;
alter table public.tekoin_transactions
  add constraint tekoin_transactions_reference_type_check
  check (reference_type in ('trade', 'aviso', 'service', 'product', 'mutirao'));
