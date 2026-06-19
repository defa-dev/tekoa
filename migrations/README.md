# Migrações do banco — Tekoa

Scripts SQL numerados para aplicar no **SQL Editor** do Supabase (ou via `psql`), na ordem abaixo.

## Ordem de execução

| # | Arquivo | Quando rodar |
|---|---------|--------------|
| 1 | `001_schema_inicial.sql` | Projeto novo — cria tabelas, RLS, storage, realtime |
| 2 | `002_comunidades_admin.sql` | Entidade `communities`, papel `is_admin`, mapa admin |
| 3 | `003_territorios.sql` | Alcunha das comunidades + escopo territorial (`reach`) |
| 4 | `004_territorios_backfill_reach.sql` | **Opcional** — só se rodou a 003 antiga com `DEFAULT 'all'` |
| 5 | `005_interesses_trocas.sql` | Chat pendente/aceito/recusado para interesse em trocas |
| 6 | `006_chat_status_completed.sql` | Status `completed` no chat |
| 7 | `007_trades.sql` | Tabela `trades` — registro de trocas encerradas |
| 8 | `008_chats_last_sender.sql` | Coluna `last_sender_id` em `chats` |
| 9 | `009_chats_last_sender_trigger.sql` | Trigger de `last_message`/`last_sender_id` |
| 10 | `010_negociacao_produto.sql` | `product_id` em `trades`/`ratings` (negociação na feira) |
| 11 | `011_tekoins_fase1.sql` | Ledger de Tekoins (`tekoin_transactions`) + saldo em `users` |
| 12 | `012_tekoins_fase2.sql` | Gasto: `tekoin_boosts` (destaque/prioridade) + `tekoin_badges` |
| 13 | `013_tekoins_fase3.sql` | `products.accepts_tekoins` + doação P2P na Feira |
| 14 | `014_tekoins_fase4.sql` | View `community_tekoin_totals` (ranking de leitura) |
| 15 | `015_tekoins_fase5_admin_fundo.sql` | `community_admins`, `community_funds`, `community_fund_transactions` |
| 16 | `016_tekoins_fase5_mutirao.sql` | `mutirao_requests`, `mutirao_confirmations`, `mutirao_messages` |
| 17 | `017_mutirao_territorio.sql` | Escopo territorial (`community`/`reach`/`reach_communities`) em mutirões |
| 18 | `018_blog.sql` | `blog_posts`, `blog_links` + post inaugural e indicações iniciais |
| 19 | `019_blog_storage.sql` | Bucket de Storage `blog` (capas de post) — escrita só admin |

## Projeto novo (do zero)

```bash
psql "$DATABASE_URL" -f migrations/001_schema_inicial.sql
psql "$DATABASE_URL" -f migrations/002_comunidades_admin.sql
psql "$DATABASE_URL" -f migrations/003_territorios.sql
psql "$DATABASE_URL" -f migrations/005_interesses_trocas.sql
```

## Projeto já em produção

Rode apenas os scripts que ainda **não** foram aplicados. Os `ALTER … IF NOT EXISTS` são idempotentes na maior parte.

## Após mudar o schema

Regenere os types TypeScript se necessário:

```bash
supabase gen types typescript --linked > types/database.types.ts
```

Guia completo: [docs/Setup-Database.md](../docs/Setup-Database.md)
