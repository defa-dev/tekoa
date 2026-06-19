# Blog Tekoa — moeda, mutirão e memória ancestral

Espaço editorial dentro do app pra contar o porquê das coisas — não só o
como. Tekoa já carrega práticas ancestrais nos próprios recursos (Jopói →
Trocas, Mutirão, Tekoin), mas o app, por si, não narra essas raízes. O
blog é esse espaço: textos próprios + curadoria de leituras de fora (Teia
dos Povos, revista Piauí, etc.), posicionando o Tekoa dentro de uma
conversa maior, não como um app isolado reinventando a roda.

**Status:** implementado (Fases 1-3 do plano abaixo, de uma vez). `/blog` e
`/blog/[slug]` para leitura; `/admin/blog` (CRUD de posts, capa via Storage)
e `/admin/blog/links` (indicações) para o admin. Post inaugural e duas
indicações (Teia dos Povos, Revista Piauí) já seedados via migration.

---

## Por que um blog, e não só um texto fixo numa página "Sobre"

- O fio que liga Jopói, Mutirão e Tekoin é uma ideia viva, não um rodapé.
  Merece o mesmo tratamento editorial que qualquer conteúdo do app — título,
  data, podia crescer em série (próximos textos sobre outras práticas).
- Curadoria externa (apontar pra quem já pesquisa e escreve sobre isso há
  mais tempo) é mais honesto do que tentar ser a única voz. Reforça que o
  Tekoa é parte de uma rede de pensamento, não dono dela.
- É o lugar certo pra explicitar, sem precisar caber num tooltip (como o
  `InfoTip` do Jopói em Trocas), o argumento de fundo: dinheiro é meio, não
  fim — e isso é mais fácil de defender com espaço pra desenvolver do que
  em uma frase solta na UI.

---

## O fio que liga os termos (rascunho do primeiro texto)

> Texto de partida pro primeiro post — pode ser publicado quase como está,
> ajustado em tom conforme a voz editorial que vocês quiserem assumir.

**Jopói.** Os Guarani chamam de Jopói o gesto de abrir as mãos — dar e
receber como uma coisa só, não duas transações separadas. Não é troca no
sentido de "preciso receber equivalente", é reciprocidade: o valor está na
relação que se mantém viva, não no saldo que fecha no fim do dia. É o nome
que demos pra aba de Trocas do Tekoa, mas é também, sem exagero, o
princípio que rege qualquer comunidade que sobrevive apoiada nela mesma.

**Mutirão.** A palavra vem do tupi — *mutirõ*, *motyrõ* — "trabalho
coletivo", "ajuda mútua". Sobreviveu séculos: em comunidades quilombolas,
assentamentos, vilas rurais, é assim que se constrói um telhado, se colhe
uma lavoura, se enfrenta uma enchente — não com dinheiro contratando mão de
obra, mas com gente que aparece porque sabe que, na vez dela, também vai
aparecer gente. O mutirão não precisa de moeda pra funcionar. Precisa de
confiança acumulada.

**Búzios.** Muito antes do real, do dólar, de qualquer papel-moeda, búzios
— as conchinhas do mar Índico — circulavam como moeda em boa parte da
África Ocidental, atravessando o Atlântico nas rotas de comércio (e,
tragicamente, também nas do tráfico). No Brasil, sobrevivem hoje sobretudo
no jogo de búzios das religiões de matriz africana — não por acaso: a
mesma concha que media valor também media destino, conselho, relação com o
sagrado. Moeda e divinação não eram dois mundos separados. O dinheiro
nascia dentro da vida comunitária e espiritual, não fora dela, acima dela.

**O que essas três práticas têm em comum** é que nenhuma trata o valor —
seja ele Tekoin, búzio, ou um dia de trabalho — como um fim em si. Valor é
**um meio** de manter pessoas em relação de cuidado mútuo. A inversão que o
dinheiro moderno fez — virar a razão máxima das coisas, em vez do
instrumento que serve a elas — é recente, é uma escolha histórica, não uma
lei da natureza. O Tekoin não é nostalgia: é a aposta de que dá pra
desenhar um sistema de valor, hoje, dentro de um app, que lembra o que o
dinheiro esqueceu — que ele só existe pra servir o que está entre as
pessoas, não pra ficar acima disso.

*(Aqui entraria a curadoria: links pra quem escreve sobre isso com mais
profundidade — Teia dos Povos, revista Piauí, etc. Ver seção "Indicações"
abaixo.)*

---

## Modelo de dados

```
blog_posts
  id            uuid
  slug          text unique     -- ex.: "jopoi-mutirao-buzios"
  title         text
  summary       text            -- linha de resumo, usada na listagem
  content       text            -- markdown
  cover_image   text null
  author_name   text            -- texto livre por ora ("Equipe Tekoa") — sem
                                 -- byline individual na Fase 1, ver "Em aberto"
  published_at  timestamptz null -- null = rascunho, não aparece em /blog
  created_at    timestamptz
  updated_at    timestamptz

blog_links       -- curadoria de leituras externas (Teia dos Povos, Piauí...)
  id          uuid
  title       text
  source      text             -- ex.: "Revista Piauí", "Teia dos Povos"
  url         text
  note        text null        -- por que vale a leitura, 1-2 frases
  added_by    uuid references users
  created_at  timestamptz
```

Dois conceitos deliberadamente separados — `blog_posts` é conteúdo escrito
pelo Tekoa; `blog_links` é apontar pra fora. Misturar os dois numa tabela
só tornaria a UI confusa sobre "isso eu escrevi ou só recomendei".

---

## Fases

1. **Ler.** `/blog` (lista, mais recentes primeiro) e `/blog/[slug]`
   (texto completo). Sem CMS ainda — os primeiros posts (incluindo o
   texto acima) entram via SQL Editor direto na migration ou um insert
   manual, igual o projeto já faz com dados de teste. Seção "Leituras
   recomendadas" na própria `/blog` ou numa aba, renderizando `blog_links`
   (abre em nova aba, ícone de link externo).
2. **Escrever pelo admin.** `/admin/blog` ganha CRUD simples de posts —
   título, resumo, conteúdo (textarea markdown, sem editor rico por
   ora), capa (reusa `ImageUploader` já existente), toggle de publicar
   (`published_at` null ↔ now()). Mesmo padrão de `/admin/comunidades`.
3. **Indicar pelo admin.** `/admin/blog/links` — form simples (título,
   fonte, URL, nota). Continua admin-only nesta fase: é curadoria
   editorial, não um mural aberto.

### Onde aparece na navegação

Mesmo caminho que Avisos: item em `NAV_ITEMS` (SideNav, desktop/tablet) e
em `MORE_NAV_ITEMS` (botão flutuante "Mais", mobile) — não disputa um dos
5 slots fixos do `BottomNav`. Um teaser do post mais recente também cabe
no dashboard, ao lado do ranking de comunidades — mesmo padrão de seção
opcional que já existe lá.

---

## Em aberto, não bloqueia a Fase 1

- **Autoria individual** (`author_id` em vez de `author_name` livre) —
  só importa se mais de uma pessoa for escrever; começar com texto livre
  evita modelar prematuramente.
- **Indicação aberta à comunidade** (qualquer morador sugerir uma leitura,
  com fila de moderação do admin antes de publicar) — natural evolução de
  `blog_links`, mas é trabalho de moderação novo; não fazer até a curadoria
  só-admin mostrar sinal de que vale abrir.
- **Link morto/conteúdo removido na fonte externa** — sem verificação
  automática de saúde do link na Fase 1; se um link cair, é edição manual
  do admin.
- **Comentários/reações** — não tem pedido nenhum por isso ainda; mural já
  cobre o "espaço de conversa" do app. Blog é leitura, não outro feed de
  interação.

---

## Riscos a vigiar

- **Voz editorial única**: por ser conteúdo carregado de posicionamento
  (não é um aviso utilitário), começar admin-only é uma escolha
  deliberada — uma curadoria de muitas vozes sem moderação correria o
  risco de diluir ou contradizer o próprio argumento do texto fundador.
- **Direitos de autor na curadoria**: `blog_links` deve sempre apontar
  pra fora (título + nota curta + URL), nunca reproduzir o texto da fonte
  externa inteiro — citação breve quando fizer sentido, nunca republicação.
