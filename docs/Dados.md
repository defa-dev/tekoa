```
users {
  id: uuid (PK, via Supabase Auth)
  email: string (unique)
  full_name: string
  display_name: string (apelido/nome público)
  avatar_url: string (nullable)
  phone: string (nullable, criptografado)
  
  -- Localização
  neighborhood: string (bairro)
  latitude: decimal (nullable)
  longitude: decimal (nullable)
  address_visibility: enum ('public', 'matches_only', 'private')
  
  -- Reputação e métricas
  reputation_score: integer (default: 0)
  total_trades: integer (default: 0)
  total_sales: integer (default: 0)
  community_credits: integer (default: 0) -- futuro
  
  -- Preferências
  bio: text (nullable)
  interests: text[] (tags de interesse)
  notification_preferences: jsonb
  
  -- Controle
  is_active: boolean (default: true)
  is_verified: boolean (default: false) -- verificação comunitária futura
  created_at: timestamp
  updated_at: timestamp
  last_seen_at: timestamp
}
```

```
services {
  id: uuid (PK)
  user_id: uuid (FK -> users)
  
  -- Tipo e conteúdo
  type: enum ('offer', 'request') -- oferta ou pedido
  title: string (max 100 chars)
  description: text
  category: string (FK -> service_categories, futuro)
  tags: text[] (habilidades/palavras-chave)
  
  -- Disponibilidade
  status: enum ('active', 'paused', 'completed', 'cancelled')
  availability_type: enum ('one_time', 'recurring', 'flexible')
  available_days: integer[] (0-6, domingo-sábado)
  available_hours: jsonb ({start: '09:00', end: '18:00'})
  
  -- Matching
  max_distance_km: integer (nullable, para filtro de proximidade)
  estimated_duration_minutes: integer (nullable)
  
  -- Controle
  views_count: integer (default: 0)
  matches_count: integer (default: 0)
  created_at: timestamp
  updated_at: timestamp
  expires_at: timestamp (nullable)
  completed_at: timestamp (nullable)
}
``` 

```
products {
  id: uuid (PK)
  user_id: uuid (FK -> users)
  
  -- Conteúdo
  title: string (max 100 chars)
  description: text
  category: string (FK -> product_categories, futuro)
  condition: enum ('new', 'like_new', 'good', 'fair', 'for_parts')
  
  -- Tipo de transação
  transaction_type: enum ('sale', 'barter', 'both') -- venda, troca, ambos
  price: decimal (nullable)
  price_negotiable: boolean (default: true)
  barter_preferences: text (nullable, "aceito trocas por...")
  
  -- Imagens
  images: text[] (URLs do Supabase Storage)
  main_image_index: integer (default: 0)
  
  -- Status
  status: enum ('available', 'negotiating', 'reserved', 'sold', 'removed')
  
  -- Métricas
  views_count: integer (default: 0)
  favorites_count: integer (default: 0)
  
  -- Controle
  created_at: timestamp
  updated_at: timestamp
  sold_at: timestamp (nullable)
}
``` 

```
matches {
  id: uuid (PK)
  
  -- Relacionamento (um oferece, outro pede ou vice-versa)
  service_offer_id: uuid (FK -> services)
  service_request_id: uuid (FK -> services)
  user_offer_id: uuid (FK -> users)
  user_request_id: uuid (FK -> users)
  
  -- Status do match
  status: enum ('pending', 'accepted', 'declined', 'completed', 'cancelled')
  
  -- Quem iniciou e aceitou
  initiated_by: uuid (FK -> users)
  accepted_at: timestamp (nullable)
  
  -- Pós-troca
  completed_at: timestamp (nullable)
  
  created_at: timestamp
  updated_at: timestamp
}
```

```
chats {
  id: uuid (PK)
  
  -- Contexto da conversa
  context_type: enum ('match', 'product', 'general') -- troca, feira, direto
  context_id: uuid (nullable) -- ID do match ou product
  
  -- Participantes (sempre 2 no MVP, array permite grupos futuros)
  participant_ids: uuid[] (users)
  
  -- Status
  status: enum ('active', 'archived', 'blocked')
  
  -- Última mensagem (desnormalizado para performance)
  last_message_text: string (nullable)
  last_message_at: timestamp (nullable)
  last_message_user_id: uuid (nullable)
  
  -- Controle
  created_at: timestamp
  updated_at: timestamp
} 
```

```
messages {
  id: uuid (PK)
  chat_id: uuid (FK -> chats)
  sender_id: uuid (FK -> users)
  
  -- Conteúdo
  content: text
  message_type: enum ('text', 'image', 'system') -- sistema para "match aceito"
  media_url: string (nullable)
  
  -- Status de leitura
  read_by: uuid[] (users que leram)
  read_at: jsonb ({user_id: timestamp})
  
  -- Controle
  is_deleted: boolean (default: false)
  created_at: timestamp
  updated_at: timestamp
}
```

```
mural_posts {
  id: uuid (PK)
  user_id: uuid (FK -> users)
  
  -- Tipo e conteúdo
  post_type: enum ('announcement', 'event', 'campaign', 'alert', 'general')
  title: string (max 150 chars)
  content: text
  images: text[] (URLs)
  
  -- Evento específico
  event_date: timestamp (nullable)
  event_location: string (nullable)
  event_link: string (nullable)
  
  -- Engajamento
  is_pinned: boolean (default: false) -- para admins destacarem
  likes_count: integer (default: 0)
  comments_count: integer (default: 0)
  views_count: integer (default: 0)
  
  -- Controle
  status: enum ('draft', 'published', 'archived')
  published_at: timestamp (nullable)
  expires_at: timestamp (nullable) -- avisos temporários
  created_at: timestamp
  updated_at: timestamp
}
``` 

```
blog_posts {
  id: uuid (PK)
  author_id: uuid (FK -> users)
  
  -- Conteúdo
  title: string
  slug: string (unique)
  content: text (markdown ou rich text)
  excerpt: text
  cover_image: string (nullable)
  
  -- Organização
  category: string
  tags: text[]
  
  -- Engajamento
  likes_count: integer (default: 0)
  comments_count: integer (default: 0)
  views_count: integer (default: 0)
  
  -- Status
  status: enum ('draft', 'published', 'archived')
  published_at: timestamp (nullable)
  
  created_at: timestamp
  updated_at: timestamp
}
```

```
reviews {
  id: uuid (PK)
  
  -- Relacionamento
  match_id: uuid (FK -> matches, nullable) -- se for troca
  product_id: uuid (FK -> products, nullable) -- se for compra
  
  -- Avaliador e avaliado
  reviewer_id: uuid (FK -> users)
  reviewed_user_id: uuid (FK -> users)
  
  -- Avaliação
  rating: integer (1-5)
  comment: text (nullable)
  review_type: enum ('trade', 'sale', 'general')
  
  -- Controle
  is_visible: boolean (default: true)
  created_at: timestamp
  updated_at: timestamp
}
```

```
notifications {
  id: uuid (PK)
  user_id: uuid (FK -> users)
  
  -- Tipo e conteúdo
  type: enum ('match', 'message', 'review', 'event', 'system')
  title: string
  message: text
  
  -- Link para contexto
  action_type: enum ('open_chat', 'view_match', 'view_product', 'view_post')
  action_id: uuid (nullable)
  
  -- Status
  is_read: boolean (default: false)
  read_at: timestamp (nullable)
  
  created_at: timestamp
}
```

##### **MVP (Prioridade 1)**

- `users`, `services`, `matches`, `chats`, `messages`, `mural_posts`, `reviews`

##### **MVP2 (Expansão)**

- `products`, `favorites`, `notifications`

##### **Futuras Expansões**

- `blog_posts` (conteúdo educativo)
- `community_credits` (economia interna)
- `service_categories` e `product_categories` (taxonomia)
- `user_skills` (matching mais inteligente)
- `events` (separar de mural_posts)
- `groups` (comunidades dentro da comunidade)

### **Pontos de Atenção**

1. **Privacidade**: Campos sensíveis (phone, localização) devem ter RLS (Row Level Security) no Supabase
2. **JSONB**: Usei para `notification_preferences` e `available_hours` - permite flexibilidade sem migration
3. **Soft Deletes**: Considere adicionar `deleted_at` em tabelas críticas (users, services, products)
4. **Realtime**: Tabelas `messages` e `mural_posts` devem ter Realtime habilitado

