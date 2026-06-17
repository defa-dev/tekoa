-- Adiciona last_sender_id em chats: quem mandou a última mensagem.
-- Usado pela notificação em tempo real pra saber se a mensagem é "minha"
-- ou de outra pessoa (sem isso não dá pra distinguir via Realtime).

alter table chats
  add column if not exists last_sender_id uuid references users(id);
