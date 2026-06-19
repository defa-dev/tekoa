-- ================================================================
-- TEKOA — Tekoins Fase 4: fundo comunitário como ranking (leitura)
-- ================================================================
-- Soma agregada (só leitura) de Tekoins ganhos por comunidade — métrica de
-- transparência, não move Tekoin de ninguém. Vira a base de dados pra Fase
-- 5, onde o fundo passa a ter saldo real. Ver docs/feature-tekoins.md.
-- ================================================================

create or replace view public.community_tekoin_totals
with (security_invoker = true) as
select
  u.location as community,
  coalesce(sum(t.amount) filter (where t.amount > 0), 0) as total_earned
from public.users u
join public.tekoin_transactions t on t.user_id = u.id
where u.location is not null
group by u.location
order by total_earned desc;
