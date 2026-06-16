# 📦 Pacote 1: Infraestrutura e Abstração de Dados

## Visão Geral
Este pacote estabelece a fundação do projeto: configuração do banco de dados, autenticação e camada de abstração que isola o frontend das implementações específicas do backend.

---

## 🎯 Tarefas Detalhadas

### **I.1 - Configuração Inicial do Supabase**

#### **I.1.1 - Schema do Banco de Dados**
**Arquivos a criar:**
- `docs/database-schema.sql` - Script SQL para criar todas as tabelas

**Propósito:**
- Definir estrutura completa do banco de dados
- Criar políticas RLS (Row Level Security)
- Configurar triggers e funções

**Tabelas:**
1. `users` - Perfis de usuário
2. `services` - Ofertas e pedidos de serviços
3. `products` - Itens da Feira do Rolo
4. `mural_posts` - Posts do Mural de Avisos
5. `chats` - Conversas entre usuários
6. `messages` - Mensagens individuais
7. `ratings` - Avaliações pós-troca

**Conexões:**
- → I.1.2 (Types TypeScript gerados a partir deste schema)
- → I.3 (Camada de abstração usa estas tabelas)

---

#### **I.1.2 - Types TypeScript**
**Arquivos a criar:**
- ✅ `types/database.types.ts` - Types gerados do Supabase
- ✅ `types/index.ts` - Types da aplicação

**Propósito:**
- Type safety em todo o projeto
- Autocomplete no desenvolvimento
- Validação em tempo de compilação

**Conexões:**
- ← I.1.1 (Gerado a partir do schema)
- → I.3 (Usado pela camada de abstração)
- → Todos os pacotes (Types compartilhados)

**Status:** ✅ Criado

---

### **I.2 - Implementação da Autenticação**

#### **I.2.1 - Clientes Supabase**
**Arquivos a criar:**
- ✅ `lib/supabase/client.ts` - Cliente para Client Components
- ✅ `lib/supabase/server.ts` - Cliente para Server Components
- ✅ `lib/supabase/middleware.ts` - Atualização de sessão

**Propósito:**
- Gerenciar sessões de usuário
- Refresh automático de tokens
- Separação client/server

**Conexões:**
- → I.2.2 (Usado pelos hooks de auth)
- → I.2.3 (Usado pelo middleware)
- → Todos os pacotes (Autenticação global)

**Status:** ✅ Criado

---

#### **I.2.2 - Hooks de Autenticação**
**Arquivos a criar:**
- `lib/hooks/useAuth.ts` - Hook para acessar usuário atual
- `lib/hooks/useSession.ts` - Hook para gerenciar sessão

**Propósito:**
- Simplificar acesso ao estado de autenticação
- Encapsular lógica de auth em hooks reutilizáveis

**Conexões:**
- ← I.2.1 (Usa os clientes Supabase)
- → C.3 (Usado nas telas de login/cadastro)
- → Todos os componentes (Auth state)

---

#### **I.2.3 - Middleware de Autenticação**
**Arquivos a criar:**
- `middleware.ts` - Middleware principal do Next.js
- `lib/auth/routes.ts` - Configuração de rotas públicas/privadas

**Propósito:**
- Proteger rotas privadas
- Redirecionar usuários não autenticados
- Refresh de sessão automático

**Conexões:**
- ← I.2.1 (Usa middleware.ts do Supabase)
- → Todas as páginas (Proteção de rotas)

---

#### **I.2.4 - Server Actions de Autenticação**
**Arquivos a criar:**
- `app/auth/actions.ts` - Server Actions para auth
  - `signUp(email, password, metadata)`
  - `signIn(email, password)`
  - `signOut()`
  - `resetPassword(email)`
  - `updatePassword(newPassword)`

**Propósito:**
- Operações de autenticação seguras no servidor
- Validação de dados antes de enviar ao Supabase

**Conexões:**
- ← I.2.1 (Usa cliente server)
- → C.3 (Chamado pelos forms de login/cadastro)

---

### **I.3 - Criação da Camada de Abstração (Data Service)**

#### **I.3.1 - Base do Data Service**
**Arquivos a criar:**
- `data/base.service.ts` - Classe base abstrata
- `data/types.ts` - Types específicos do data layer

**Propósito:**
- Definir interface comum para todos os services
- Métodos CRUD genéricos
- Tratamento de erros padronizado

**Conexões:**
- → I.3.2 até I.3.6 (Extendido por todos os services)

---

#### **I.3.2 - User Service**
**Arquivos a criar:**
- `data/user.service.ts`

**Métodos:**
- `getCurrentUser()` - Usuário autenticado
- `getUserById(id)` - Buscar por ID
- `updateProfile(data)` - Atualizar perfil
- `uploadAvatar(file)` - Upload de foto

**Propósito:**
- Gerenciar dados de usuário
- Abstração completa do Supabase

**Conexões:**
- ← I.3.1 (Extends base service)
- → Pacote 2 (Usado pelos componentes de perfil)
- → Pacote 3 e 4 (Dados do usuário em todo app)

---

#### **I.3.3 - Service Service (Trocas)**
**Arquivos a criar:**
- `data/service.service.ts`

**Métodos:**
- `createService(data)` - Criar oferta/pedido
- `getServices(filters)` - Listar com filtros
- `getServiceById(id)` - Detalhes
- `updateService(id, data)` - Atualizar
- `deleteService(id)` - Deletar
- `getMatches(userId)` - Buscar matches

**Propósito:**
- CRUD de serviços (ofertas/pedidos)
- Lógica de matching

**Conexões:**
- ← I.3.1 (Extends base service)
- → Pacote 3 (T.1, T.2) - Core do matching

---

#### **I.3.4 - Product Service (Feira)**
**Arquivos a criar:**
- `data/product.service.ts`

**Métodos:**
- `createProduct(data)` - Criar item
- `getProducts(filters)` - Listar com filtros
- `getProductById(id)` - Detalhes
- `updateProduct(id, data)` - Atualizar
- `deleteProduct(id)` - Deletar
- `uploadProductImages(files)` - Upload de imagens

**Propósito:**
- CRUD de produtos da feira
- Integração com Supabase Storage

**Conexões:**
- ← I.3.1 (Extends base service)
- → Pacote 4 (F.1, F.2, F.3) - Feira do Rolo

---

#### **I.3.5 - Mural Service**
**Arquivos a criar:**
- `data/mural.service.ts`

**Métodos:**
- `createPost(data)` - Criar post
- `getPosts(filters)` - Listar posts
- `getPostById(id)` - Detalhes
- `updatePost(id, data)` - Atualizar
- `deletePost(id)` - Deletar
- `subscribeToNewPosts(callback)` - Realtime

**Propósito:**
- CRUD do mural
- Realtime para feed dinâmico

**Conexões:**
- ← I.3.1 (Extends base service)
- ← I.4.2 (Usa realtime)
- → Pacote 4 (F.4) - Mural de Avisos

---

#### **I.3.6 - Chat Service**
**Arquivos a criar:**
- `data/chat.service.ts`

**Métodos:**
- `createChat(participant1, participant2, serviceId?, productId?)` - Criar chat
- `getChats(userId)` - Listar chats do usuário
- `getChatById(id)` - Detalhes do chat
- `getMessages(chatId)` - Histórico de mensagens
- `sendMessage(chatId, content)` - Enviar mensagem
- `markAsRead(messageId)` - Marcar como lida
- `subscribeToMessages(chatId, callback)` - Realtime

**Propósito:**
- Sistema de chat completo
- Realtime para mensagens instantâneas

**Conexões:**
- ← I.3.1 (Extends base service)
- ← I.4.1 (Usa realtime para chat)
- → Pacote 3 (T.3) - Chat de matches
- → Pacote 4 (F.3) - Chat da feira

---

#### **I.3.7 - Rating Service**
**Arquivos a criar:**
- `data/rating.service.ts`

**Métodos:**
- `createRating(toUserId, serviceId, rating, comment)` - Avaliar
- `getUserRatings(userId)` - Avaliações recebidas
- `canRate(fromUserId, toUserId, serviceId)` - Verificar permissão

**Propósito:**
- Sistema de avaliações
- Atualizar rating médio do usuário

**Conexões:**
- ← I.3.1 (Extends base service)
- → Pacote 3 (T.4) - Avaliação pós-troca

---

#### **I.3.8 - Storage Service**
**Arquivos a criar:**
- `data/storage.service.ts`

**Métodos:**
- `uploadFile(bucket, path, file)` - Upload genérico
- `deleteFile(bucket, path)` - Deletar arquivo
- `getPublicUrl(bucket, path)` - URL pública

**Propósito:**
- Abstração do Supabase Storage
- Gerenciamento de uploads

**Conexões:**
- → I.3.2 (Avatar)
- → I.3.4 (Imagens de produtos)
- → I.3.5 (Imagens de posts)

---

### **I.4 - Configuração do Realtime para Chat**

#### **I.4.1 - Realtime Client**
**Arquivos a criar:**
- `lib/realtime/client.ts` - Cliente Realtime
- `lib/realtime/types.ts` - Types para eventos realtime

**Propósito:**
- Configurar canais Realtime
- Gerenciar subscrições
- Tratamento de eventos

**Conexões:**
- → I.3.6 (Usado pelo Chat Service)
- → I.3.5 (Usado pelo Mural Service)

---

#### **I.4.2 - Hooks Realtime**
**Arquivos a criar:**
- `lib/hooks/useRealtimeMessages.ts` - Hook para mensagens
- `lib/hooks/useRealtimePosts.ts` - Hook para posts do mural

**Propósito:**
- Simplificar uso do Realtime em componentes
- Gerenciar lifecycle de subscrições

**Conexões:**
- ← I.4.1 (Usa cliente realtime)
- → Pacote 3 (T.3) - UI do chat
- → Pacote 4 (F.4) - Feed do mural

---

### **I.5 - Estruturação do Projeto Next.js**

#### **I.5.1 - Configuração de Ambiente**
**Arquivos a criar:**
- `.env.local.example` - Template de variáveis
- `.env.local` - Variáveis locais (não comitar)
- `lib/config/env.ts` - Validação de env vars

**Variáveis necessárias:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

**Propósito:**
- Configurar credenciais do Supabase
- Validar variáveis obrigatórias

**Conexões:**
- → I.2.1 (Usado pelos clientes)

---

#### **I.5.2 - Estrutura de Pastas**
**Estrutura a criar:**
```
/app                    # App Router do Next.js
  /(auth)              # Grupo de rotas de autenticação
    /login             # Página de login
    /signup            # Página de cadastro
  /(app)               # Grupo de rotas autenticadas
    /dashboard         # Dashboard principal
    /perfil            # Perfil do usuário
  /api                 # API Routes
/components            # Componentes React
  /ui                  # Componentes base (Pacote 2)
  /features            # Componentes de features
/data                  # Camada de abstração de dados
/lib                   # Bibliotecas e utilitários
  /hooks              # Custom hooks
  /supabase           # Clientes Supabase
  /realtime           # Realtime client
  /auth               # Auth utilities
  /config             # Configurações
/types                 # TypeScript types
/utils                 # Funções utilitárias
/middleware.ts         # Middleware principal
```

**Propósito:**
- Organização clara e escalável
- Separação de responsabilidades

---

#### **I.5.3 - Configurações do Next.js**
**Arquivos a revisar/criar:**
- `next.config.ts` - Configurar domínios de imagem
- `tsconfig.json` - Configurar paths
- `.eslintrc.json` - Rules de linting

**Propósito:**
- Otimizar build e desenvolvimento
- Configurar paths absolutos

---

## 📊 Checklist de Conclusão

### I.1 - Supabase Setup
- [x] I.1.1 - Schema SQL criado e executado ✅
- [x] I.1.2 - Types TypeScript gerados ✅

### I.2 - Autenticação
- [x] I.2.1 - Clientes Supabase criados ✅
- [x] I.2.2 - Hooks de auth ✅
- [x] I.2.3 - Middleware de proteção ✅
- [x] I.2.4 - Server Actions de auth ✅

### I.3 - Camada de Abstração
- [x] I.3.1 - Base service ✅
- [ ] I.3.2 - User service
- [ ] I.3.3 - Service service (Trocas)
- [x] I.3.4 - Product service ✅
- [x] I.3.5 - Mural service ✅
- [x] I.3.6 - Chat service ✅
- [x] I.3.7 - Rating service ✅
- [x] I.3.8 - Storage service ✅

### I.4 - Realtime
- [x] I.4.1 - Realtime client ✅
- [x] I.4.2 - Hooks realtime ✅

### I.5 - Estruturação
- [ ] I.5.1 - Configuração de ambiente
- [ ] I.5.2 - Estrutura de pastas
- [ ] I.5.3 - Configs do Next.js

---

## 🔗 Dependências com Outros Pacotes

### Pacote 2 (Componentes)
- Fornece: Types, Auth hooks, Data services
- Recebe: Componentes UI para integração

### Pacote 3 (Trocas/Serviços)
- Fornece: Service Service, Chat Service, Rating Service
- Recebe: Páginas e lógica de matching

### Pacote 4 (Feira e Mural)
- Fornece: Product Service, Mural Service, Storage Service
- Recebe: Páginas da feira e mural

---

## 🎯 Próximos Passos

1. Completar I.1.1 - Criar e executar schema SQL no Supabase
2. Implementar I.2.2 a I.2.4 - Completar autenticação
3. Criar I.3.1 - Base service (fundação para todos os outros)
4. Implementar services em ordem de prioridade:
   - I.3.2 (User) → Básico para todo o app
   - I.3.3 (Service) → Core do MVP
   - I.3.6 (Chat) → Necessário para matches
   - I.3.4, I.3.5, I.3.7, I.3.8 → Features secundárias
5. Implementar Realtime (I.4.1 e I.4.2)
6. Finalizar configurações (I.5)
