-- ================================================================
-- TEKOA - Database Schema
-- Plataforma de Economia Colaborativa
-- ================================================================
-- 
-- Este script cria toda a estrutura do banco de dados do Tekoa:
-- - 7 tabelas principais + auth
-- - Políticas RLS (Row Level Security)
-- - Triggers e funções auxiliares
-- - Índices para performance
--
-- Execute este script no SQL Editor do Supabase Dashboard
-- ================================================================

-- ================================================================
-- EXTENSÕES
-- ================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- TABELA: users (profiles)
-- ================================================================
-- Estende auth.users com informações de perfil
-- RLS: Usuários podem ver todos os perfis, mas só editar o próprio

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  location TEXT,
  bio TEXT CHECK (length(bio) <= 500),
  rating NUMERIC(3, 2) CHECK (rating >= 0 AND rating <= 5),
  total_ratings INTEGER DEFAULT 0 CHECK (total_ratings >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_location ON public.users(location) WHERE location IS NOT NULL;

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Todos podem ver perfis públicos
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.users
  FOR SELECT
  USING (true);

-- Usuários podem inserir seu próprio perfil
CREATE POLICY "Users can insert their own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- ================================================================
-- TABELA: services
-- ================================================================
-- Ofertas e pedidos de serviços para matching
-- RLS: Públicos para visualização, apenas dono pode editar/deletar

CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) >= 5 AND length(title) <= 100),
  description TEXT NOT NULL CHECK (length(description) >= 20 AND length(description) <= 500),
  type TEXT NOT NULL CHECK (type IN ('offer', 'request')),
  category TEXT NOT NULL,
  proximity INTEGER DEFAULT 5 CHECK (proximity > 0),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'matched', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_services_user_id ON public.services(user_id);
CREATE INDEX idx_services_type ON public.services(type);
CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_status ON public.services(status);
CREATE INDEX idx_services_created_at ON public.services(created_at DESC);

-- RLS Policies
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Todos podem ver serviços ativos
CREATE POLICY "Active services are viewable by everyone"
  ON public.services
  FOR SELECT
  USING (status = 'active' OR user_id = auth.uid());

-- Usuários autenticados podem criar serviços
CREATE POLICY "Authenticated users can create services"
  ON public.services
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios serviços
CREATE POLICY "Users can update their own services"
  ON public.services
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuários podem deletar seus próprios serviços
CREATE POLICY "Users can delete their own services"
  ON public.services
  FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================================
-- TABELA: products
-- ================================================================
-- Produtos da Feira do Rolo
-- RLS: Públicos para visualização, apenas dono pode editar/deletar

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) >= 5 AND length(title) <= 100),
  description TEXT NOT NULL CHECK (length(description) >= 20 AND length(description) <= 1000),
  price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  category TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'fair')),
  images TEXT[] NOT NULL CHECK (array_length(images, 1) >= 1 AND array_length(images, 1) <= 5),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
  location TEXT,
  views INTEGER DEFAULT 0 CHECK (views >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX idx_products_location ON public.products(location) WHERE location IS NOT NULL;

-- RLS Policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Todos podem ver produtos disponíveis
CREATE POLICY "Available products are viewable by everyone"
  ON public.products
  FOR SELECT
  USING (status = 'available' OR user_id = auth.uid());

-- Usuários autenticados podem criar produtos
CREATE POLICY "Authenticated users can create products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios produtos
CREATE POLICY "Users can update their own products"
  ON public.products
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuários podem deletar seus próprios produtos
CREATE POLICY "Users can delete their own products"
  ON public.products
  FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================================
-- TABELA: mural_posts
-- ================================================================
-- Posts do Mural de Avisos comunitário
-- RLS: Públicos para visualização, apenas dono pode editar/deletar

CREATE TABLE public.mural_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) >= 5 AND length(title) <= 100),
  content TEXT NOT NULL CHECK (length(content) >= 10 AND length(content) <= 2000),
  images TEXT[] DEFAULT '{}' CHECK (array_length(images, 1) <= 3),
  type TEXT DEFAULT 'general' CHECK (type IN ('announcement', 'event', 'general')),
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
  comments_count INTEGER DEFAULT 0 CHECK (comments_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_mural_posts_user_id ON public.mural_posts(user_id);
CREATE INDEX idx_mural_posts_type ON public.mural_posts(type);
CREATE INDEX idx_mural_posts_created_at ON public.mural_posts(created_at DESC);
CREATE INDEX idx_mural_posts_likes ON public.mural_posts(likes_count DESC);

-- RLS Policies
ALTER TABLE public.mural_posts ENABLE ROW LEVEL SECURITY;

-- Todos podem ver posts
CREATE POLICY "Posts are viewable by everyone"
  ON public.mural_posts
  FOR SELECT
  USING (true);

-- Usuários autenticados podem criar posts
CREATE POLICY "Authenticated users can create posts"
  ON public.mural_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios posts
CREATE POLICY "Users can update their own posts"
  ON public.mural_posts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuários podem deletar seus próprios posts
CREATE POLICY "Users can delete their own posts"
  ON public.mural_posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================================
-- TABELA: chats
-- ================================================================
-- Conversas entre usuários (match ou interesse em produto)
-- RLS: Apenas participantes podem ver e editar

CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  participant_1 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT different_participants CHECK (participant_1 != participant_2),
  CONSTRAINT has_context CHECK (service_id IS NOT NULL OR product_id IS NOT NULL)
);

-- Índices
CREATE INDEX idx_chats_participant_1 ON public.chats(participant_1);
CREATE INDEX idx_chats_participant_2 ON public.chats(participant_2);
CREATE INDEX idx_chats_service_id ON public.chats(service_id) WHERE service_id IS NOT NULL;
CREATE INDEX idx_chats_product_id ON public.chats(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX idx_chats_last_message_at ON public.chats(last_message_at DESC NULLS LAST);

-- RLS Policies
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Participantes podem ver seus chats
CREATE POLICY "Participants can view their chats"
  ON public.chats
  FOR SELECT
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Usuários autenticados podem criar chats
CREATE POLICY "Authenticated users can create chats"
  ON public.chats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Participantes podem atualizar seus chats
CREATE POLICY "Participants can update their chats"
  ON public.chats
  FOR UPDATE
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- ================================================================
-- TABELA: messages
-- ================================================================
-- Mensagens dentro dos chats
-- RLS: Apenas participantes do chat podem ver e criar mensagens

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 1000),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_read ON public.messages(read) WHERE read = false;

-- RLS Policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Participantes do chat podem ver mensagens
CREATE POLICY "Chat participants can view messages"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = messages.chat_id
      AND (chats.participant_1 = auth.uid() OR chats.participant_2 = auth.uid())
    )
  );

-- Participantes podem criar mensagens
CREATE POLICY "Chat participants can create messages"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = messages.chat_id
      AND (chats.participant_1 = auth.uid() OR chats.participant_2 = auth.uid())
    )
  );

-- Participantes podem marcar mensagens como lidas
CREATE POLICY "Chat participants can update messages"
  ON public.messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = messages.chat_id
      AND (chats.participant_1 = auth.uid() OR chats.participant_2 = auth.uid())
    )
  );

-- ================================================================
-- TABELA: ratings
-- ================================================================
-- Avaliações pós-troca entre usuários
-- RLS: Públicas para visualização, apenas avaliador pode criar

CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT CHECK (length(comment) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT different_users CHECK (from_user_id != to_user_id),
  CONSTRAINT unique_rating_per_service UNIQUE (from_user_id, to_user_id, service_id)
);

-- Índices
CREATE INDEX idx_ratings_from_user ON public.ratings(from_user_id);
CREATE INDEX idx_ratings_to_user ON public.ratings(to_user_id);
CREATE INDEX idx_ratings_service_id ON public.ratings(service_id) WHERE service_id IS NOT NULL;
CREATE INDEX idx_ratings_created_at ON public.ratings(created_at DESC);

-- RLS Policies
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Todos podem ver ratings
CREATE POLICY "Ratings are viewable by everyone"
  ON public.ratings
  FOR SELECT
  USING (true);

-- Usuários podem criar ratings
CREATE POLICY "Users can create ratings"
  ON public.ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

-- ================================================================
-- FUNÇÕES E TRIGGERS
-- ================================================================

-- Função: Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_services
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_mural_posts
  BEFORE UPDATE ON public.mural_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_chats
  BEFORE UPDATE ON public.chats
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função: Criar perfil de usuário automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Função: Atualizar rating médio do usuário
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET 
    rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.ratings
      WHERE to_user_id = NEW.to_user_id
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM public.ratings
      WHERE to_user_id = NEW.to_user_id
    )
  WHERE id = NEW.to_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar rating
CREATE TRIGGER on_rating_created
  AFTER INSERT ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_rating();

-- Função: Atualizar última mensagem no chat
CREATE OR REPLACE FUNCTION public.update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chats
  SET 
    last_message = NEW.content,
    last_message_at = NEW.created_at
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar última mensagem
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chat_last_message();

-- ================================================================
-- STORAGE BUCKETS
-- ================================================================
-- Configurar buckets para upload de imagens

-- Bucket para avatares
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para imagens de produtos
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para imagens de posts do mural
INSERT INTO storage.buckets (id, name, public)
VALUES ('mural', 'mural', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para avatares
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Políticas de Storage para produtos
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'products'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'products'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'products'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Políticas de Storage para mural
CREATE POLICY "Mural images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'mural');

CREATE POLICY "Authenticated users can upload mural images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'mural'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own mural images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'mural'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own mural images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'mural'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ================================================================
-- REALTIME
-- ================================================================
-- Habilitar Realtime para tabelas que precisam de atualizações em tempo real

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mural_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;

-- ================================================================
-- SEED DATA (Opcional - categorias padrão)
-- ================================================================

-- Você pode adicionar dados iniciais aqui se necessário
-- Por exemplo, categorias padrão, etc.

-- ================================================================
-- FIM DO SCHEMA
-- ================================================================

-- Para verificar se tudo foi criado corretamente, execute:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
