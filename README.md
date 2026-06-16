# Tekoa — Plataforma de Economia Colaborativa

Aplicativo web mobile-first que conecta vizinhos para trocar serviços, vender produtos usados e compartilhar avisos — com **território primeiro** (comunidade, alcunha, escopo de publicação).

## Funcionalidades

1. **Trocas** — roda de ofertas e pedidos, sugestões de match, interesse com aceite no chat, minhas trocas
2. **Feira do Rolo** — marketplace local com fotos e negociação
3. **Mural** — avisos, eventos e campanhas com filtro territorial
4. **Comunidades** — cadastro admin, mapa, alcunhas (quilombo, favela, quebrada…)

## Documentação

| Documento | Conteúdo |
|-----------|----------|
| [Estado do projeto](docs/Estado-do-Projeto.md) | O que está implementado (leia primeiro) |
| [Fluxo de Trocas](docs/fluxo-trocas.md) | Jornada dos usuários nas trocas |
| [Índice](docs/Indice.md) | Navegação completa |
| [Setup do banco](docs/Setup-Database.md) | Supabase e migrações |
| [migrations/](migrations/README.md) | Scripts SQL numerados |
| [Design system](docs/ds.md) | Cores, tipografia, UI |

Documentação de planejamento antiga (Pacotes, I.*): [docs/plano-original/](docs/plano-original/) — arquivada.

## Tech stack

- Next.js 16, TypeScript, Tailwind v4
- Supabase (PostgreSQL, Auth, Storage, Realtime)
- Vitest

**Arquitetura:** UI → Server Components / Server Actions → `data/*.service.ts` → Supabase. Sem chamadas diretas ao banco na UI.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # preencher credenciais Supabase
```

Aplique as migrações em [`migrations/`](migrations/README.md) no SQL Editor do Supabase (projeto novo: 001 → 002 → 003 → 005).

```bash
npm run seed      # opcional — dados demo
npm run dev       # http://localhost:3000
npm test          # Vitest
npm run build
```

## Estrutura

```
tekoa/
├── app/              # Rotas (auth, app, chat, admin)
├── components/       # UI + features
├── data/             # Services de abstração
├── lib/              # matching, territories, hooks, supabase
├── migrations/       # SQL numerado
├── types/
└── docs/             # Documentação
```

## Status

MVP funcional com auth, territórios, trocas (interesse + aceite), feira, mural, chat realtime e avaliações. Ver [docs/Estado-do-Projeto.md](docs/Estado-do-Projeto.md).

---

**Última atualização:** junho de 2026
