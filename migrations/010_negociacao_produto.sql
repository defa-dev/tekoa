-- Generaliza o encerramento de chat + avaliação pra negociações de produto
-- (feira), que até aqui só existia pra trocas de serviço.

alter table trades
  add column if not exists product_id uuid references products(id);

alter table ratings
  add column if not exists product_id uuid references products(id);
