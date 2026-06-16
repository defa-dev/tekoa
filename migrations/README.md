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
