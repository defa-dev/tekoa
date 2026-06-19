# Tekoins — moeda social do Tekoa

Mecanismo de recompensa pós-troca/feira/aviso que evolui, em fases, de pontuação
fechada para **moeda social circulante**, no espírito do Jopói (reciprocidade
guarani) e dos modelos reais de moeda comunitária brasileiros (ex.: o Palmas,
do Banco Palmas, em Fortaleza — circula localmente, não é conversível em
reais).

**Status:** desenhado, ainda não implementado. Começar pela Fase 1.

---

## Princípio geral

Tekoin nasce como **pontuação fechada dentro do app**, mas a tabela é
desenhada como **livro-razão (ledger)** desde o dia um — não um contador
simples no perfil. Isso é o que permite a evolução gradual para moeda
circulante sem reescrever nada depois: cada fase nova é só um tipo de
transação adicional no mesmo ledger.

---

## Fases de evolução

1. **Fase 1 — Ganhar e acumular.** Tekoins nascem do encerramento de
   troca/negociação, escalados pela avaliação recebida. Aparecem só como saldo
   no perfil + extrato.
2. **Fase 2 — Gastar dentro do app.** Destaque no anúncio, prioridade de
   matching, badges por marco de saldo/atividade. Ainda fechado: o Tekoin é
   "queimado", não vai para ninguém.
3. **Fase 3 — Doação na Feira (a ponte para circulação).** O anunciante
   escolhe se aceita Tekoin como parte ou todo do pagamento. Tekoin sai da
   carteira de um vizinho e entra na de outro — moeda circulante de fato,
   só que enquadrada como opção de pagamento na feira.
4. **Fase 4 — Fundo comunitário como ranking.** Soma de Tekoins gerados por
   comunidade/bairro, exibida como métrica de transparência ("comunidades
   mais ativas") no mapa/dashboard. Só leitura — não move Tekoin de
   ninguém, aproveita o ledger que já existe.
5. **Fase 5 — Mutirão + admin comunitário + fundo gasto de verdade.** Pedido
   multi-participante com chat em grupo, recompensa base mintada por
   participação e bônus opcional vindo do fundo comunitário (gerido por um
   admin da comunidade) ou do bolso do próprio organizador. Aqui a moeda
   social está plenamente em circulação. Ver detalhes na seção própria
   abaixo.

---

## Modelo de dados

```
tekoin_transactions
  id              uuid
  user_id         uuid          -- de quem sai/entra
  counterparty_id uuid null     -- outro lado da transação (null = sistema/app)
  amount          integer       -- positivo (ganho) ou negativo (gasto/doado)
  type            enum: 'earned_rating', 'earned_aviso', 'earned_mutirao_base',
                        'spent_highlight', 'spent_priority', 'donated_feira',
                        'mutirao_extra_fund', 'mutirao_extra_organizer',
                        'transfer_p2p', 'admin_adjustment'
  reference_type  enum: 'trade' | 'product' | 'service' | 'aviso' | 'mutirao' | 'badge' | null
  reference_id    uuid null     -- id da troca/produto/etc que gerou a transação
  created_at      timestamptz

profiles.tekoin_balance  -- cache materializado (trigger recalcula a partir do ledger)
```

O `tekoin_balance` é só performance — o ledger é a fonte de verdade e pode
reconstruir o saldo a qualquer momento (auditável, reversível em caso de
bug/abuso).

---

## Regras de ganho (Fase 1)

Disparado dentro do `closeTradeAction` já existente, no momento em que a
avaliação é registrada. Os dois lados da troca ganham — reforça que
reciprocidade é o que gera valor, não só "prestar serviço".

| Avaliação | Tekoins |
|---|---|
| ⭐⭐⭐⭐⭐ | 10 |
| ⭐⭐⭐⭐ | 7 |
| ⭐⭐⭐ | 4 |
| ⭐⭐ | 1 |
| ⭐ | 0 |

Decisão deliberada: **não** dar Tekoin negativo por avaliação baixa. Isso
puniria o avaliado duas vezes (já levou nota baixa) e cria incentivo perverso
para brigar por avaliação. São números de partida, fáceis de recalibrar —
é configuração, não estrutura.

**Aviso (Mural):** ganho fixo só por publicar (ex. 1 Tekoin), bem menor que
o intervalo da troca/feira avaliada. Limite anti-spam obrigatório — ex. só
os primeiros 2 avisos por dia rendem Tekoin — porque aqui não existe outra
pessoa do outro lado validando a interação, então é o ganho mais fácil de
abusar.

---

## Regras de gasto (Fase 2)

- **Destaque no anúncio** (feira ou troca): custo fixo por X dias, ex. 15
  Tekoins / 3 dias.
- **Prioridade no matching**: aparece primeiro nos resultados/sugestões por
  um período.
- **Badge**: não é comprado — é conquistado automaticamente por marco de
  saldo acumulado ou trocas concluídas (ex. "100 Tekoins na trajetória").
  Comprar status com a própria moeda que mede reputação seria estranho;
  ganhar por marco mantém o badge como sinal confiável.

---

## A ponte: doação na Feira (Fase 3)

No formulário de anúncio da Feira, o anunciante escolhe um toggle: **"Aceito
Tekoins"** (além do preço em real, ou no lugar dele). Na negociação, o
comprador pode oferecer Tekoins como parte do pagamento — isso gera uma
transação `donated_feira` que debita do comprador e credita do vendedor,
exatamente como uma transferência P2P, só que com a moldura familiar de
"comprar na feira". É o jeito mais natural de o usuário aceitar a ideia de
moeda circulante sem que pareça uma mudança de regras do jogo.

---

## Fundo comunitário como ranking (Fase 4)

Soma agregada (somente leitura) de Tekoins gerados por usuários de uma
mesma comunidade/bairro, exibida como ranking de "comunidades mais ativas"
no mapa ou dashboard. Não move Tekoin de ninguém — é só uma consulta sobre
o ledger que já existe, aproveitando o escopo territorial que já está em
implementação. Vira a base de dados pra Fase 5, onde o fundo passa a ter
saldo real, não só métrica.

---

## Mutirão, admin comunitário e fundo gasto de verdade (Fase 5)

### Novos conceitos

1. **Admin da plataforma** — papel novo (hoje, só Felipe), com poder de
   nomear admins de comunidade.
2. **Admin da comunidade** — atribuído por um admin da plataforma. Default:
   quem cadastrou a comunidade é admin até alguém ser definido. Eleição por
   voto dos moradores fica como evolução futura, não bloqueia esta fase.
3. **Fundo comunitário** — deixa de ser só ranking de leitura e passa a ter
   saldo real, gerido pelo admin da comunidade.
4. **Mutirão** — pedido multi-participante, paralelo ao pedido 1:1 (troca/
   feira/busca). Qualquer morador pode criar um, não é exclusivo a causas
   comunitárias — também serve pra algo pessoal que precisa de várias mãos
   (ex.: ajudar numa mudança).
5. **Chat em grupo** — capacidade nova de chat com N participantes, criada
   junto com o pedido de mutirão.

### Modelo de dados (extensão)

```
communities.created_by  uuid null   -- quem cadastrou; default pra admin da comunidade

community_admins
  id            uuid
  community_id  uuid references communities(id)
  user_id       uuid
  assigned_by   uuid null   -- admin da plataforma que atribuiu; null = default (criador)
  created_at    timestamptz

community_funds
  community_id  uuid primary key references communities(id)
  balance       integer not null default 0

community_fund_transactions   -- ledger próprio (fundo não é um usuário)
  id            uuid
  community_id  uuid
  amount        integer
  type          enum: 'mutirao_extra' | 'admin_topup'
  reference_id  uuid null
  created_at    timestamptz

mutirao_requests
  id                 uuid
  organizer_id       uuid
  community_id       uuid null references communities(id)
  title              text
  description        text
  location           text null
  scheduled_at       timestamptz null
  min_confirmations  integer    -- definido pelo organizador na criação
  status             enum: 'open' | 'confirmed' | 'completed' | 'cancelled'
  completed_at       timestamptz null
  created_at         timestamptz

mutirao_confirmations
  id            uuid
  mutirao_id    uuid
  user_id       uuid
  confirmed_at  timestamptz
  attended      boolean null   -- preenchido só no fechamento, pelo organizador

mutirao_messages   -- chat em grupo do mutirão
  id            uuid
  mutirao_id    uuid
  sender_id     uuid
  content       text
  created_at    timestamptz
```

**Desvio do desenho original:** a primeira versão deste doc propunha
estender `chats`/`messages` (campo `is_group` + tabela `chat_participants`
many-to-many) pra dar ao mutirão um chat em grupo dentro do sistema de
mensagens 1:1 já existente. Na implementação, optou-se por uma tabela
paralela (`mutirao_messages`) inteiramente separada, sem tocar `chats`:
relaxar a constraint que hoje exige `participant_1`/`participant_2` e
ramificar a RLS de um subsistema crítico e já testado é um risco
estruturalmente maior do que o benefício de reaproveitar a tabela —
ainda mais sem possibilidade de verificação manual no Supabase Studio
durante a sessão em que foi implementado. O chat do mutirão também não
tem tempo real (sem SSE): a lista de mensagens é renderizada no servidor
e atualizada via `router.refresh()` após enviar — simplificação aceita
dado que é um caso de uso bem mais esporádico que o chat 1:1.

### Fluxo

1. Morador cria o pedido de mutirão (mínimo de confirmações, descrição,
   opcionalmente quanto está dispondo a colocar do próprio bolso como
   extra). Chat em grupo nasce junto, só com o organizador dentro.
2. Cada confirmação de presença adiciona a pessoa ao chat em grupo.
3. Ao bater o mínimo, o mutirão passa pra `confirmed` ("vai acontecer").
4. Acontece. O organizador fecha a lista — marca quem de fato participou
   (`attended`). Isso vale tanto pra admin de comunidade quanto pra usuário
   comum organizando: quem organizou é sempre quem fecha a lista, sem
   confirmação cruzada.
5. Organizador avalia cada participante presente → dispara o **Tekoin base**
   (mesma tabela 10/7/4/1/0 da Fase 1), mintado — não depende de saldo de
   ninguém, é recompensa por interação.
6. Participantes avaliam o organizador de volta → organizador também ganha
   Tekoin base pela mesma tabela.
7. Se havia **extra** prometido — do fundo comunitário (quando o organizador
   é admin agindo por interesse da comunidade) ou do próprio saldo do
   organizador — debita a fonte e distribui entre os participantes
   presentes.
8. Sem extra disponível (ou saldo insuficiente na fonte do extra): só o
   básico é pago. Isso **nunca bloqueia o fechamento** — o mutirão acontecer
   não pode depender do saldo de ninguém, só o bônus em cima depende.

### Quem pode organizar o quê

- **Qualquer morador**: cria mutirão pessoal, pode prometer extra do
  próprio saldo.
- **Admin da comunidade**: cria mutirão "comunitário", pode prometer extra
  do fundo comunitário.

### Em aberto, não bloqueia esta fase

- Eleição de admin de comunidade por voto dos moradores.
- Regras de governança pra saída do fundo (limite por mutirão? segunda
  aprovação?) — por ora o próprio admin decide e debita.

---

## Riscos a vigiar

- **Farming**: limitar Tekoins ganhos por par de usuários por semana (evita
  trocas fake de ida-e-volta só para mintar).
- **Saldo nunca negativo**: gasto/doação validado contra saldo disponível
  antes de confirmar.
- **Sem conversão para BRL**: Tekoin nunca é resgatável em dinheiro — isso é
  o que mantém a moeda fora de qualquer enquadramento como instrumento
  financeiro/cripto. É moeda social, como o Palmas.
- **Legitimidade do admin de comunidade**: atribuição manual/default é
  arbitrária no início — alguém decidindo gasto do fundo coletivo sem
  eleição é o ponto mais frágil da Fase 5. Mitigação por ora: o fundo só
  cobre o *extra* opcional, nunca a recompensa base — um admin ruim no
  máximo deixa de incentivar, não trava nem prejudica ninguém.
- **Mutirão sem comparecimento real**: como o organizador fecha a lista sem
  confirmação cruzada, depende de confiança — aceitável em escala de
  vizinhança, mas vale monitorar se aparecem padrões suspeitos (mesmo grupo
  sempre "presente" entre si).

---

## Status

Fases 1 a 5 implementadas e migrations `011` a `017` aplicadas no banco
(ver `migrations/README.md`). Pendente apenas validação manual: fluxo
completo de troca→avaliação mútua→saldo, e confirmação no Supabase
Studio de que os chats 1:1 existentes não foram afetados (não foram, já
que o mutirão usa tabela paralela em vez de estender `chats` — ver
desvio documentado acima).

### Desvio de IA: mutirão dentro de Trocas, não numa aba própria

A primeira versão deste doc (e a implementação inicial) tratava Mutirão
como uma seção própria, com nav dedicado (`/mutiroes`, item no menu).
Depois de usar a feature, o feedback foi que um mutirão é conceitualmente
um tipo de **pedido** — só que precisa de várias mãos — então ele deveria
aparecer junto com os pedidos comuns ("Buscam") em **Trocas**, não
competir por espaço de navegação como uma quarta seção. Mudança feita:

- `/trocas` busca mutirões abertos do território (mesmo filtro
  `community`/`reach`/`reach_communities` de services/products/mural_posts —
  migration `017_mutirao_territorio.sql`) e os interlaça na aba "Buscam",
  cada um com uma flag `Badge type="evento"` ("Mutirão") pra não se
  confundir com um pedido comum.
- "Meus mutirões" (organizados/confirmados) passou a viver em
  `/trocas/minhas`, ao lado das demais publicações do usuário.
- `/mutiroes/[id]` (detalhe, chat em grupo, fechamento, avaliação)
  continua existindo como rota própria — só a listagem (`/mutiroes`), a
  entrada no menu principal e o formulário de criação dedicado
  (`/mutiroes/novo`) foram removidos.

**Segunda rodada de feedback:** mesmo com o link "Organizar mutirão" na
aba Buscam, o usuário foi primeiro ao formulário "Busco um serviço"
(`/trocas/nova`) procurar a opção ali, e sugeriu um terceiro toggle em
"O que você quer fazer?" — ao lado de "Ofereço"/"Busco" — em vez de um
botão separado. Faz sentido: reforça a ideia de que mutirão é só mais um
*tipo* de pedido. `NewServiceForm` (`components/features/services/`)
ganhou esse terceiro toggle ("Organizar mutirão"), trocando
categoria/proximidade por local/data/mínimo de confirmações quando
selecionado, e chamando `createMutiraoAction` em vez de
`createServiceAction` no submit. Isso tornou o formulário próprio de
mutirão (`NewMutiraoForm`, rota `/mutiroes/novo`) redundante — removidos.
