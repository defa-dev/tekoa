-- ================================================================
-- TEKOA — Blog: textos próprios + curadoria de leituras externas
-- ================================================================
-- Duas tabelas deliberadamente separadas: blog_posts é conteúdo escrito
-- pelo Tekoa; blog_links é curadoria (apontar pra fora, nunca reproduzir
-- o texto da fonte). Escrita restrita a admin (current_user_is_admin(),
-- de 002), leitura pública — mesmo padrão de `communities`. A aplicação
-- sempre escreve via admin client (RLS aqui é defesa em profundidade).
-- Ver docs/feature-blog.md.
-- ================================================================

create table if not exists public.blog_posts (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique check (length(slug) >= 2),
  title text not null check (length(title) >= 3),
  summary text not null check (length(summary) >= 10),
  content text not null check (length(content) >= 20),
  cover_image text,
  author_name text not null default 'Equipe Tekoa',
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_blog_posts_published_at on public.blog_posts(published_at);

alter table public.blog_posts enable row level security;

drop policy if exists "Published posts are viewable by everyone" on public.blog_posts;
create policy "Published posts are viewable by everyone"
  on public.blog_posts for select
  using (published_at is not null);

drop policy if exists "Admins can view all posts" on public.blog_posts;
create policy "Admins can view all posts"
  on public.blog_posts for select to authenticated
  using (public.current_user_is_admin());

drop policy if exists "Admins can insert posts" on public.blog_posts;
create policy "Admins can insert posts"
  on public.blog_posts for insert to authenticated
  with check (public.current_user_is_admin());

drop policy if exists "Admins can update posts" on public.blog_posts;
create policy "Admins can update posts"
  on public.blog_posts for update to authenticated
  using (public.current_user_is_admin());

drop policy if exists "Admins can delete posts" on public.blog_posts;
create policy "Admins can delete posts"
  on public.blog_posts for delete to authenticated
  using (public.current_user_is_admin());

create table if not exists public.blog_links (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  source text not null,
  url text not null unique,
  note text,
  added_by uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default now()
);

alter table public.blog_links enable row level security;

drop policy if exists "Links are viewable by everyone" on public.blog_links;
create policy "Links are viewable by everyone"
  on public.blog_links for select
  using (true);

drop policy if exists "Admins can insert links" on public.blog_links;
create policy "Admins can insert links"
  on public.blog_links for insert to authenticated
  with check (public.current_user_is_admin());

drop policy if exists "Admins can delete links" on public.blog_links;
create policy "Admins can delete links"
  on public.blog_links for delete to authenticated
  using (public.current_user_is_admin());

-- ----------------------------------------------------------------
-- Post inaugural: o fio que liga Jopói, Mutirão e Búzios (rascunho já
-- escrito em docs/feature-blog.md). Idempotente via slug único.
-- ----------------------------------------------------------------
insert into public.blog_posts (slug, title, summary, content, author_name, published_at)
values (
  'jopoi-mutirao-buzios',
  'O fio que liga Jopói, Mutirão e Búzios',
  'Antes do dinheiro como conhecemos, valor já foi reciprocidade, trabalho coletivo e concha do mar — sempre um meio, nunca um fim. É esse fio que o Tekoa tenta recuperar.',
  E'Os Guarani chamam de Jopói o gesto de abrir as mãos — dar e receber como uma coisa só, não duas transações separadas. Não é troca no sentido de "preciso receber equivalente", é reciprocidade: o valor está na relação que se mantém viva, não no saldo que fecha no fim do dia. É o nome que demos pra aba de Trocas do Tekoa, mas é também, sem exagero, o princípio que rege qualquer comunidade que sobrevive apoiada nela mesma.\n\nMutirão vem do tupi — mutirõ, motyrõ — "trabalho coletivo", "ajuda mútua". Sobreviveu séculos: em comunidades quilombolas, assentamentos, vilas rurais, é assim que se constrói um telhado, se colhe uma lavoura, se enfrenta uma enchente — não com dinheiro contratando mão de obra, mas com gente que aparece porque sabe que, na vez dela, também vai aparecer gente. O mutirão não precisa de moeda pra funcionar. Precisa de confiança acumulada.\n\nMuito antes do real, do dólar, de qualquer papel-moeda, búzios — as conchinhas do mar Índico — circulavam como moeda em boa parte da África Ocidental, atravessando o Atlântico nas rotas de comércio (e, tragicamente, também nas do tráfico). No Brasil, sobrevivem hoje sobretudo no jogo de búzios das religiões de matriz africana — não por acaso: a mesma concha que media valor também media destino, conselho, relação com o sagrado. Moeda e divinação não eram dois mundos separados. O dinheiro nascia dentro da vida comunitária e espiritual, não fora dela, acima dela.\n\nO que essas três práticas têm em comum é que nenhuma trata o valor — seja ele Tekoin, búzio, ou um dia de trabalho — como um fim em si. Valor é um meio de manter pessoas em relação de cuidado mútuo. A inversão que o dinheiro moderno fez — virar a razão máxima das coisas, em vez do instrumento que serve a elas — é recente, é uma escolha histórica, não uma lei da natureza. O Tekoin não é nostalgia: é a aposta de que dá pra desenhar um sistema de valor, hoje, dentro de um app, que lembra o que o dinheiro esqueceu — que ele só existe pra servir o que está entre as pessoas, não pra ficar acima disso.',
  'Equipe Tekoa',
  now()
)
on conflict (slug) do nothing;

insert into public.blog_links (title, source, note, url)
values
  (
    'Teia dos Povos',
    'Teia dos Povos',
    'Articulação de povos e comunidades tradicionais — território, autonomia e economias próprias contadas por quem vive nelas.',
    'https://teiadospovos.org.br'
  ),
  (
    'Revista Piauí',
    'Revista Piauí',
    'Reportagens longas que, vez ou outra, descem fundo em economia solidária, moedas sociais e práticas comunitárias brasileiras.',
    'https://piaui.folha.uol.com.br'
  )
on conflict (url) do nothing;
