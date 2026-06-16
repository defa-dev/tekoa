# Estado do projeto — Tekoa

Documento de referência do que está **implementado** no repositório (jun/2026).

---

## Stack

- Next.js 16 (App Router, Server Actions, Server Components)
- TypeScript, Tailwind v4
- Supabase (PostgreSQL, Auth, Storage, Realtime)
- Vitest (~287 testes)

**Regra de ouro:** a UI não chama Supabase direto — tudo passa por `data/*.service.ts` e Server Actions.

---

## Funcionalidades entregues

### Autenticação e perfil
- Signup, login, logout, recuperação de senha
- Middleware de rotas protegidas
- Perfil com avatar, comunidade (`users.location`), bio
- Admin (`is_admin`) para gestão de comunidades

### Comunidades e território
- Cadastro admin de comunidades com **alcunha** (quilombo, favela, quebrada…)
- Mapa com pins das comunidades (Google Maps)
- Escopo ao publicar: só na minha quebrada / territórios escolhidos / todos
- Feeds filtrados por território com toggle “Outros territórios” (Trocas, Feira, Avisos, dashboard)

### Trocas (carro-chefe)

Jornada completa (publicar, roda, interesse, aceite, chat): **[fluxo-trocas.md](fluxo-trocas.md)**

- Publicar oferta ou pedido (`/trocas/nova`) com categoria e proximidade
- Roda da comunidade: toggle Oferecem / Buscam (inclui suas publicações)
- Sugestões **Combina com você** (algoritmo em `lib/matching/match.ts`: categoria oposta + afinidade de texto)
- **Interesse em troca** (não exclusivo — a oferta continua na roda):
  1. “Tenho interesse” → chat `pending` + mensagem automática (lista suas ofertas se houver)
  2. Dono aceita ou recusa no chat (`InterestReplyBar`)
  3. Aceite → conversa liberada + avaliação
- **Minhas trocas** (`/trocas/minhas`): publicações, interesses recebidos/enviados, encerrar/remover

### Feira do Rolo
- Anunciar produto com fotos, listagem, filtros, detalhe, chat de interesse (produto)

### Mural de avisos
- Publicar aviso/evento/recado com escopo territorial
- Tag da comunidade de origem no card
- Filtros por tipo

### Mensagens
- Lista de conversas com status (novo interesse, aguardando, combinada, recusada)
- Chat em tempo real (Supabase Realtime)
- Avaliação pós-troca no header do chat

---

## Rotas principais

| Rota | Descrição |
|------|-----------|
| `/` | Entrada / splash |
| `/dashboard` | Home logada |
| `/trocas`, `/trocas/nova`, `/trocas/minhas` | Trocas |
| `/feira`, `/feira/novo`, `/feira/[id]` | Feira |
| `/avisos`, `/avisos/novo` | Mural |
| `/mensagens`, `/mensagens/[id]` | Chat |
| `/perfil`, `/perfil/editar` | Perfil |
| `/admin/comunidades` | Admin de comunidades |

---

## Banco de dados

Schema base + evoluções em [`migrations/`](../migrations/README.md).

Tabelas principais: `users`, `communities`, `services`, `products`, `mural_posts`, `chats`, `messages`, `ratings`.

Campos territoriais em publicações: `community`, `reach`, `reach_communities`.  
Campos de interesse em `chats`: `status` (`pending` \| `active` \| `declined`), `initiated_by`, `offerer_service_id`.

---

## O que o plano original previa e ainda não existe

- Interface de **swipe** estilo Tinder (hoje é lista + sugestões)
- Likes/comentários no mural
- Edição de publicação de troca pela UI (backend existe)
- Notificações push de novo interesse
- Proximidade geográfica real (hoje só raio declarado no cadastro)

---

## Design e layout

- Design system: [ds.md](ds.md)
- Layout web: [layout-web.md](layout-web.md)

---

## Documentação histórica

Plano e tarefas da fase inicial: [plano-original/](plano-original/) (Pacotes 1–4, notas I.*).

---

**Última atualização:** junho de 2026
