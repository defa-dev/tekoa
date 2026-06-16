# 📦 Pacote 4: Feira do Rolo e Mural de Avisos

## Visão Geral
Este pacote implementa as funcionalidades secundárias do MVP: marketplace de produtos usados (Feira do Rolo) e mural comunitário de avisos. Ambos compartilham componentes com o Pacote 3 (chat, ratings).

---

## 🎯 Tarefas Detalhadas

### **F.1 - Página de Publicação de Item (Feira)**

#### **F.1.1 - Product Form Component**
**Arquivos a criar:**
- `components/features/products/ProductForm/ProductForm.tsx`
- `components/features/products/ProductForm/ProductForm.types.ts`
- `components/features/products/ProductForm/validation.ts`

**Campos do formulário:**
```typescript
interface ProductFormData {
  title: string              // Ex: "Bicicleta infantil aro 16"
  description: string        // Descrição detalhada
  price: number             // Preço em reais
  category: string          // Categoria do produto
  condition: 'new' | 'like_new' | 'good' | 'fair'
  images: File[]            // Até 5 fotos
  location?: string         // Bairro/região (opcional)
}
```

**Categorias sugeridas:**
- 🪑 Móveis & Decoração
- 📱 Eletrônicos
- 👕 Roupas & Acessórios
- 📚 Livros & Mídias
- 🎮 Jogos & Hobbies
- 🏃 Esportes & Lazer
- 🧸 Infantil
- 🔧 Ferramentas
- 🏠 Utensílios Domésticos
- 🎵 Instrumentos Musicais
- 🚗 Veículos & Acessórios
- 🐾 Pet & Animais

**Condições:**
- `new` - "Novo (na embalagem)"
- `like_new` - "Seminovo (pouco uso)"
- `good` - "Bom estado"
- `fair` - "Estado regular"

**Validações:**
- Título: 5-100 caracteres
- Descrição: 20-1000 caracteres
- Preço: > 0
- Categoria: obrigatória
- Condição: obrigatória
- Imagens: 1-5 fotos obrigatórias

**Propósito:**
- Permitir cadastro de produtos
- Upload múltiplo de imagens

**Conexões:**
- ← Pacote 2 (C.2.1-5) - Usa componentes UI
- ← Pacote 1 (I.3.4) - createProduct()
- ← Pacote 1 (I.3.8) - uploadFile() para imagens
- → F.1.2 (Form usado na página)

---

#### **F.1.2 - Image Upload Component**
**Arquivos a criar:**
- `components/features/products/ImageUpload/ImageUpload.tsx`
- `components/features/products/ImageUpload/ImagePreview.tsx`

**Features:**
- Drag & drop de imagens
- Click para selecionar
- Preview com thumbnails
- Reordenar imagens (primeira = capa)
- Remover imagens
- Limite de 5 imagens
- Validação: tipo (jpg, png, webp) e tamanho (max 5MB cada)
- Loading state durante upload
- Crop/resize automático (opcional)

**Propósito:**
- UX otimizada para upload de fotos

**Conexões:**
- ← Pacote 1 (I.3.8) - uploadFile()
- → F.1.1 (Usado no ProductForm)

---

#### **F.1.3 - Create Product Page**
**Arquivos a criar:**
- `app/(app)/feira/novo/page.tsx`

**Layout:**
- Header: "Cancelar" + "Publicar"
- ImageUpload no topo
- ProductForm abaixo
- Preview card (opcional)
- Botão "Publicar" fixo no bottom

**Flow:**
1. Upload de imagens
2. Preencher dados
3. Submit → Upload images to Supabase Storage
4. Create product with image URLs
5. Redirect to product detail ou My Products

**Propósito:**
- Página completa de criação de produto

**Conexões:**
- ← F.1.1, F.1.2 (Usa form e upload)
- → F.2 (Produto aparece na listagem)

---

#### **F.1.4 - Edit Product Page**
**Arquivos a criar:**
- `app/(app)/feira/[id]/editar/page.tsx`

**Features:**
- Carregar dados e imagens existentes
- Editar dados
- Adicionar/remover imagens
- Alterar status (disponível, reservado, vendido)
- Deletar produto
- Botão "Marcar como vendido"

**Propósito:**
- Gerenciar produtos publicados

**Conexões:**
- ← F.1.1, F.1.2 (Reutiliza componentes)
- ← Pacote 1 (I.3.4) - updateProduct(), deleteProduct()

---

#### **F.1.5 - My Products List**
**Arquivos a criar:**
- `app/(app)/meus-produtos/page.tsx`
- `components/features/products/MyProductsList/MyProductsList.tsx`

**Features:**
- Lista de produtos do usuário
- Tabs: Disponíveis, Reservados, Vendidos
- Card com foto, título, preço, status
- Ações rápidas: Editar, Marcar como vendido, Deletar
- Badge de "X pessoas interessadas"

**Propósito:**
- Gerenciar produtos criados

**Conexões:**
- ← Pacote 2 (C.2.4) - Usa ProductCard
- ← Pacote 1 (I.3.4) - getProducts()
- → F.1.4 (Link para editar)

---

### **F.2 - Listagem de Itens e Filtros (Feira)**

#### **F.2.1 - Product Filters**
**Arquivos a criar:**
- `components/features/products/ProductFilters/ProductFilters.tsx`
- `components/features/products/ProductFilters/FilterModal.tsx`

**Filtros:**
```typescript
interface ProductFilters {
  category?: string[]       // Múltiplas categorias
  condition?: string[]      // Múltiplas condições
  priceMin?: number
  priceMax?: number
  location?: string         // Proximidade (futuro)
  sortBy?: 'recent' | 'price_asc' | 'price_desc' | 'popular'
}
```

**UI:**
- Chips de filtros ativos
- Botão "Filtros" → Abre modal
- Modal com todos os filtros
- Contador de produtos encontrados
- Botão "Limpar filtros"

**Propósito:**
- Facilitar busca de produtos

**Conexões:**
- ← Pacote 2 (C.2.5, C.2.8) - Usa Select e Modal
- → F.2.2 (Passa filtros para listagem)

---

#### **F.2.2 - Products Grid**
**Arquivos a criar:**
- `components/features/products/ProductsGrid/ProductsGrid.tsx`
- `components/features/products/ProductCard/ProductCard.tsx`

**ProductCard:**
- Imagem (primeira do array)
- Badge de condição
- Título
- Preço destacado
- Localização (ícone + texto)
- Badge de "Vendido" se aplicável

**Grid:**
- Responsive: 1 col (mobile), 2 cols (tablet), 3-4 cols (desktop)
- Lazy loading / Infinite scroll
- Loading skeleton
- Estado vazio: "Nenhum produto encontrado"

**Propósito:**
- Exibir produtos com boa UX

**Conexões:**
- ← Pacote 2 (C.2.4, C.2.7) - Usa Card e Badge
- ← Pacote 1 (I.3.4) - getProducts()
- → F.3 (Link para detalhes)

---

#### **F.2.3 - Feira Main Page**
**Arquivos a criar:**
- `app/(app)/feira/page.tsx`

**Layout:**
- Header com search bar
- ProductFilters
- ProductsGrid
- FAB (botão flutuante): "Vender item" → F.1.3

**Features:**
- Search em tempo real (debounced)
- Filtros persistidos em query params
- Scroll to top button

**Propósito:**
- Hub principal da Feira do Rolo

**Conexões:**
- ← F.2.1, F.2.2 (Usa filtros e grid)
- → F.1.3 (Criar produto)
- → F.3 (Ver detalhes)

---

#### **F.2.4 - Search Component**
**Arquivos a criar:**
- `components/features/products/ProductSearch/ProductSearch.tsx`

**Features:**
- Input de busca
- Ícone de lupa
- Clear button (X)
- Debounce de 300ms
- Histórico de buscas (localStorage)
- Sugestões (opcional)

**Propósito:**
- Busca rápida de produtos

**Conexões:**
- ← Pacote 2 (C.2.2) - Usa Input
- → F.2.3 (Integrado na página)

---

### **F.3 - Página de Detalhes do Item**

#### **F.3.1 - Product Detail View**
**Arquivos a criar:**
- `app/(app)/feira/[id]/page.tsx`
- `components/features/products/ProductDetail/ProductDetail.tsx`

**Seções:**

**1. Image Gallery:**
- Carrossel de imagens
- Dots indicator
- Pinch to zoom (mobile)
- Lightbox (fullscreen)

**2. Product Info:**
- Título
- Preço (grande e destacado)
- Badge de condição
- Categoria
- Descrição completa
- Localização
- Data de publicação
- Visualizações (opcional)

**3. Seller Info:**
- Avatar + nome do vendedor
- Rating (estrelas)
- Total de vendas (opcional)
- Botão "Ver perfil"

**4. Action Buttons:**
- "Tenho interesse" (principal)
- "Compartilhar" (share)
- "Favoritar" (opcional)
- "Reportar" (menu)

**Propósito:**
- Exibir todas as informações do produto
- Facilitar contato com vendedor

**Conexões:**
- ← Pacote 2 (C.2.1, C.2.6) - Button, Avatar
- ← Pacote 1 (I.3.4) - getProductById()
- → F.3.2 (Galeria de imagens)
- → F.3.3 (Iniciar chat)

---

#### **F.3.2 - Image Gallery Component**
**Arquivos a criar:**
- `components/features/products/ImageGallery/ImageGallery.tsx`
- `components/features/products/ImageGallery/Lightbox.tsx`

**Features:**
- Swipe entre imagens
- Thumbnails
- Zoom
- Fullscreen mode
- Contador "1/5"

**Propósito:**
- Visualização otimizada de fotos

**Conexões:**
- → F.3.1 (Usado na página de detalhes)

---

#### **F.3.3 - Interest Chat Flow**
**Arquivos a criar:**
- `components/features/products/InterestModal/InterestModal.tsx`

**Flow:**
1. Usuário clica "Tenho interesse"
2. Modal: "Enviar mensagem para [Nome]"
3. Input de mensagem pré-preenchido: "Olá! Tenho interesse no produto [Título]. Ainda está disponível?"
4. Usuário pode editar mensagem
5. Clicar "Enviar" → Cria chat + envia primeira mensagem
6. Redirect para chat

**Propósito:**
- Facilitar início da negociação

**Conexões:**
- ← Pacote 2 (C.2.8) - Usa Modal
- ← Pacote 1 (I.3.6) - createChat(), sendMessage()
- → Pacote 3 (T.3.2) - Abre chat

---

#### **F.3.4 - Related Products**
**Arquivos a criar:**
- `components/features/products/RelatedProducts/RelatedProducts.tsx`

**Features:**
- "Produtos similares"
- Mesma categoria
- Horizontal scroll
- 4-6 produtos

**Propósito:**
- Aumentar engajamento
- Cross-selling

**Conexões:**
- ← F.2.2 (Reutiliza ProductCard)
- ← Pacote 1 (I.3.4) - getProducts() com filtro

---

### **F.4 - Mural de Avisos (CRUD Simples)**

#### **F.4.1 - Post Form Component**
**Arquivos a criar:**
- `components/features/mural/PostForm/PostForm.tsx`
- `components/features/mural/PostForm/PostForm.types.ts`

**Campos:**
```typescript
interface PostFormData {
  title: string             // Ex: "Festa junina no dia 24/06"
  content: string           // Conteúdo do aviso
  type: 'announcement' | 'event' | 'general'
  images?: File[]           // Até 3 fotos (opcional)
}
```

**Types:**
- `announcement` - 📢 Anúncio importante
- `event` - 🎉 Evento comunitário
- `general` - 💬 Geral

**Validações:**
- Título: 5-100 caracteres
- Conteúdo: 10-2000 caracteres
- Tipo: obrigatório
- Imagens: 0-3 fotos

**Propósito:**
- Criar posts no mural comunitário

**Conexões:**
- ← Pacote 2 (C.2.1-3, C.2.5) - Componentes UI
- ← F.1.2 (Reutiliza ImageUpload)
- ← Pacote 1 (I.3.5) - createPost()
- → F.4.2 (Usado na página)

---

#### **F.4.2 - Create Post Page**
**Arquivos a criar:**
- `app/(app)/mural/novo/page.tsx`

**Layout:**
- Header: "Cancelar" + "Publicar"
- Tipo de post (seletor)
- Formulário
- Upload de imagens (opcional)
- Preview do post

**Propósito:**
- Página de criação de post

**Conexões:**
- ← F.4.1 (Usa PostForm)
- → F.4.3 (Post aparece no feed)

---

#### **F.4.3 - Mural Feed**
**Arquivos a criar:**
- `app/(app)/mural/page.tsx`
- `components/features/mural/MuralFeed/MuralFeed.tsx`
- `components/features/mural/PostCard/PostCard.tsx`

**PostCard:**
- Avatar + nome do autor
- Timestamp
- Badge de tipo
- Título (bold)
- Conteúdo (preview com "Ver mais")
- Imagens (se houver)
- Ações:
  - 👍 Like (contador)
  - 💬 Comentar (contador)
  - ⋮ Menu (editar/deletar se for autor)

**Feed:**
- Ordenado por: Recente, Popular (likes)
- Infinite scroll
- Realtime updates (novos posts aparecem automaticamente)
- Loading skeleton
- FAB: "Novo post" → F.4.2

**Propósito:**
- Feed comunitário dinâmico

**Conexões:**
- ← Pacote 2 (C.2.4, C.2.6, C.2.7) - Card, Avatar, Badge
- ← Pacote 1 (I.3.5) - getPosts(), subscribeToNewPosts()
- ← Pacote 1 (I.4.2) - useRealtimePosts()
- → F.4.4 (Ver detalhes)

---

#### **F.4.4 - Post Detail View**
**Arquivos a criar:**
- `app/(app)/mural/[id]/page.tsx`
- `components/features/mural/PostDetail/PostDetail.tsx`

**Seções:**
1. **Post completo:**
   - Avatar + nome + timestamp
   - Badge de tipo
   - Título
   - Conteúdo completo
   - Imagens (galeria se múltiplas)
   - Like button + contador

2. **Comentários:**
   - Lista de comentários
   - Avatar + nome + timestamp
   - Input para novo comentário
   - Realtime updates

**Propósito:**
- Ver post completo com comentários

**Conexões:**
- ← F.4.3 (Aberto ao clicar no card)
- ← F.4.5 (Comentários)

---

#### **F.4.5 - Comments System**
**Arquivos a criar:**
- `components/features/mural/Comments/CommentsList.tsx`
- `components/features/mural/Comments/CommentInput.tsx`
- `components/features/mural/Comments/CommentItem.tsx`

**Features:**
- Listar comentários
- Adicionar comentário
- Deletar comentário (se autor)
- Realtime updates
- Loading states

**Schema adicional necessário:**
```sql
CREATE TABLE post_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES mural_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp DEFAULT now()
);
```

**Propósito:**
- Sistema de comentários para posts

**Conexões:**
- ← Pacote 1 (Needs new service methods)
- → F.4.4 (Usado no PostDetail)

---

#### **F.4.6 - Likes System**
**Arquivos a criar:**
- `components/features/mural/Likes/LikeButton.tsx`
- `lib/hooks/useLikes.ts`

**Features:**
- Toggle like/unlike
- Contador de likes
- Animação ao dar like
- Estado persistido

**Schema adicional necessário:**
```sql
CREATE TABLE post_likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES mural_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  UNIQUE(post_id, user_id)
);
```

**Propósito:**
- Sistema de likes para posts

**Conexões:**
- ← Pacote 1 (Needs new service methods)
- → F.4.3, F.4.4 (Usado em posts)

---

#### **F.4.7 - Edit/Delete Post**
**Arquivos a criar:**
- `app/(app)/mural/[id]/editar/page.tsx`
- `components/features/mural/PostActions/PostActions.tsx`

**Features:**
- Editar post (se autor)
- Deletar post (se autor)
- Confirmação antes de deletar

**Propósito:**
- Gerenciar posts criados

**Conexões:**
- ← F.4.1 (Reutiliza PostForm)
- ← Pacote 1 (I.3.5) - updatePost(), deletePost()

---

#### **F.4.8 - Realtime Feed Updates**
**Arquivos a criar:**
- `lib/hooks/useMuralRealtime.ts`

**Features:**
- Subscribe to new posts
- Update feed automatically
- Notification toast: "Novo post disponível"
- Badge counter

**Propósito:**
- Feed dinâmico em tempo real

**Conexões:**
- ← Pacote 1 (I.4.1, I.4.2) - Realtime client
- → F.4.3 (Usado no feed)

---

## 📊 Checklist de Conclusão

### F.1 - Publicação de Produtos
- [ ] F.1.1 - ProductForm component
- [ ] F.1.2 - Image upload component
- [ ] F.1.3 - Create product page
- [ ] F.1.4 - Edit product page
- [ ] F.1.5 - My products list

### F.2 - Listagem e Filtros
- [ ] F.2.1 - Product filters
- [ ] F.2.2 - Products grid
- [ ] F.2.3 - Feira main page
- [ ] F.2.4 - Search component

### F.3 - Detalhes do Produto
- [ ] F.3.1 - Product detail view
- [ ] F.3.2 - Image gallery
- [ ] F.3.3 - Interest chat flow
- [ ] F.3.4 - Related products

### F.4 - Mural de Avisos
- [ ] F.4.1 - Post form
- [ ] F.4.2 - Create post page
- [ ] F.4.3 - Mural feed
- [ ] F.4.4 - Post detail view
- [ ] F.4.5 - Comments system
- [ ] F.4.6 - Likes system
- [ ] F.4.7 - Edit/Delete post
- [ ] F.4.8 - Realtime updates

---

## 🔗 Dependências com Outros Pacotes

### Pacote 1 (Infraestrutura)
- **Recebe:**
  - Product Service (I.3.4) - CRUD de produtos
  - Mural Service (I.3.5) - CRUD do mural
  - Chat Service (I.3.6) - Chat da feira
  - Storage Service (I.3.8) - Upload de imagens
  - Realtime hooks (I.4.2) - Feed dinâmico

### Pacote 2 (Componentes)
- **Recebe:**
  - Todos os componentes UI
  - Layout e navegação

### Pacote 3 (Trocas/Serviços)
- **Compartilha:**
  - Chat system (F.3.3 usa T.3)
  - Image upload (similar a T.1)

---

## 🎯 Fluxos do Usuário

### Fluxo: Vender um Produto
1. Usuário clica no FAB "Vender item" (F.2.3)
2. Faz upload de fotos (F.1.2)
3. Preenche informações (F.1.1)
4. Publica produto (F.1.3)
5. Produto aparece na Feira (F.2.2)
6. Aparece em "Meus Produtos" (F.1.5)

### Fluxo: Comprar um Produto
1. Usuário navega pela Feira (F.2.3)
2. Aplica filtros para encontrar item (F.2.1)
3. Clica em produto de interesse (F.3.1)
4. Vê detalhes e fotos (F.3.2)
5. Clica "Tenho interesse" (F.3.3)
6. Chat é criado automaticamente
7. Negocia com vendedor (Pacote 3 - T.3)
8. Finaliza compra fora do app

### Fluxo: Postar no Mural
1. Usuário clica no FAB "Novo post" (F.4.3)
2. Escolhe tipo de post (F.4.1)
3. Escreve título e conteúdo
4. Adiciona fotos (opcional)
5. Publica post (F.4.2)
6. Post aparece no feed em tempo real (F.4.3)
7. Comunidade pode curtir e comentar (F.4.6, F.4.5)

### Fluxo: Interagir com o Mural
1. Usuário abre tab "Mural" (F.4.3)
2. Vê feed de posts
3. Curte posts interessantes (F.4.6)
4. Clica para ver detalhes e comentários (F.4.4)
5. Adiciona comentário (F.4.5)
6. Recebe notificações de respostas (opcional)

---

## 🎯 Schemas Adicionais Necessários

### post_comments
```sql
CREATE TABLE post_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES mural_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (length(content) >= 1 AND length(content) <= 500),
  created_at timestamp DEFAULT now()
);

CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX idx_post_comments_created_at ON post_comments(created_at DESC);
```

### post_likes
```sql
CREATE TABLE post_likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES mural_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
```

### Atualizar mural_posts
```sql
ALTER TABLE mural_posts
  ADD COLUMN likes_count integer DEFAULT 0,
  ADD COLUMN comments_count integer DEFAULT 0;
```

---

## 🎯 Próximos Passos

### Ordem recomendada de implementação:

**Prioridade 1: Feira do Rolo (MVP básico)**
1. F.1.1, F.1.2, F.1.3 (Criar produto)
2. F.2.2, F.2.3 (Listagem básica)
3. F.3.1, F.3.2 (Detalhes do produto)
4. F.3.3 (Chat de interesse)

**Prioridade 2: Mural (MVP básico)**
5. F.4.1, F.4.2 (Criar post)
6. F.4.3 (Feed básico)
7. F.4.8 (Realtime)

**Prioridade 3: Features secundárias**
8. F.2.1, F.2.4 (Filtros e busca)
9. F.1.4, F.1.5 (Gerenciar produtos)
10. F.4.6 (Likes)
11. F.4.5 (Comentários)
12. F.4.4, F.4.7 (Detalhes e edição)

**Pode deixar para depois:**
- F.3.4 (Produtos relacionados)
- Múltiplas imagens em posts do mural
- Notificações de comentários/likes

---

## 💡 Observações Importantes

### Diferenças: Feira vs. Trocas
- **Feira:** Venda com dinheiro, chat livre, sem matching automático
- **Trocas:** Matching automático, troca de serviços, sem dinheiro

### Compartilhamentos
- Ambos usam o mesmo sistema de chat (Pacote 3)
- Ambos usam sistema de upload de imagens
- Ambos têm rating (vendedor pode ser avaliado)

### Performance
- Implementar pagination/infinite scroll desde o início
- Otimizar carregamento de imagens (lazy loading, thumbnails)
- Cache de produtos/posts visitados
