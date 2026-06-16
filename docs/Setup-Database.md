# Setup do banco de dados — Supabase

## Pré-requisitos

- Projeto no [Supabase](https://supabase.com)
- Credenciais em `.env.local` (ver [README.md](../README.md))

---

## Projeto novo

No **SQL Editor**, execute **na ordem** os arquivos em [`migrations/`](../migrations/README.md):

1. `001_schema_inicial.sql` — tabelas, RLS, storage, realtime  
2. `002_comunidades_admin.sql` — `communities`, `is_admin`  
3. `003_territorios.sql` — alcunha + escopo territorial  
4. `005_interesses_trocas.sql` — estados do chat de interesse  

Ou via `psql`:

```bash
for f in migrations/001_schema_inicial.sql \
         migrations/002_comunidades_admin.sql \
         migrations/003_territorios.sql \
         migrations/005_interesses_trocas.sql; do
  psql "$DATABASE_URL" -f "$f"
done
```

### Dados de demonstração

```bash
npm run seed
```

Logins (senha `tekoa123`): `maria@tekoa.test`, `joao@tekoa.test`, `cida@tekoa.test`.

---

## Projeto já existente

Rode só as migrações que ainda **não** foram aplicadas. Consulte [`migrations/README.md`](../migrations/README.md).

| Situação | Script extra |
|----------|----------------|
| Rodou `003` antiga com `reach DEFAULT 'all'` e feeds mostram tudo | `004_territorios_backfill_reach.sql` |

---

## Verificação

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Esperado: `users`, `communities`, `services`, `products`, `mural_posts`, `chats`, `messages`, `ratings`.

Colunas recentes em `chats`:

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'chats' AND column_name IN ('status', 'initiated_by', 'offerer_service_id');
```

---

## Storage e Realtime

Após o `001`:

- **Storage:** buckets `avatars`, `products`, `mural`
- **Realtime:** `messages`, `mural_posts`, `chats` (Replication no dashboard)

---

## Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Regenerar types (opcional)

```bash
supabase gen types typescript --linked > types/database.types.ts
```

---

## Problemas comuns

**`relation already exists`** — migração já aplicada; pule ou use só `ALTER` dos scripts mais novos.

**Feeds vazios após territórios** — confira `reach` e `community` nas publicações; veja `004` se tudo estiver `all`.

**Interesse em troca falha** — rode `005_interesses_trocas.sql`.

---

**Última atualização:** junho de 2026
