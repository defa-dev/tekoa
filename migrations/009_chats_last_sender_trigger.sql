-- O trigger on_message_created (001) é quem realmente mantém last_message/
-- last_message_at em chats a cada INSERT em messages — inclusive pra envios
-- que vão direto pela tabela (ex.: app/api/messages/route.ts), sem passar
-- pelo chat.service.ts. Precisa também setar last_sender_id, senão o campo
-- fica null pra qualquer mensagem mandada fora do service layer.

CREATE OR REPLACE FUNCTION public.update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chats
  SET
    last_message = NEW.content,
    last_message_at = NEW.created_at,
    last_sender_id = NEW.sender_id
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
