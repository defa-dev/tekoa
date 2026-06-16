# 📦 Pacote 3: Funcionalidade Principal - Tinder de Trocas/Serviços

## Visão Geral
Este é o coração do MVP: sistema de matching entre ofertas e pedidos de serviços, com chat integrado e avaliações. Implementa a funcionalidade tipo "Tinder" para trocas de serviços entre usuários.

---

## 🎯 Tarefas Detalhadas

### **T.1 - Página de Cadastro de Ofertas/Pedidos**

#### **T.1.1 - Service Form Component**
**Arquivos a criar:**
- `components/features/services/ServiceForm/ServiceForm.tsx`
- `components/features/services/ServiceForm/ServiceForm.types.ts`
- `components/features/services/ServiceForm/validation.ts`

**Campos do formulário:**
```typescript
interface ServiceFormData {
  title: string              // Ex: "Aulas de violão"
  description: string        // Descrição detalhada
  type: 'offer' | 'request' // Ofereço ou preciso
  category: string          // Educação, Reparos, Saúde, etc
  proximity: number         // Raio em km (1, 5, 10, 25, 50)
}
```

**Categorias sugeridas:**
- 🎓 Educação & Ensino
- 🔧 Reparos & Manutenção
- 💆 Saúde & Bem-estar
- 🎨 Arte & Criatividade
- 💻 Tecnologia
- 🏠 Casa & Jardim
- 🚗 Transporte
- 📚 Consultoria
- 🍳 Gastronomia
- 🎭 Entretenimento

**Validações:**
- Título: 5-100 caracteres
- Descrição: 20-500 caracteres
- Tipo: obrigatório
- Categoria: obrigatória
- Proximidade: obrigatória

**Propósito:**
- Permitir usuários cadastrarem serviços
- Interface simples e intuitiva

**Conexões:**
- ← Pacote 2 (C.2.1, C.2.2, C.2.3, C.2.5) - Usa componentes UI
- ← Pacote 1 (I.3.3) - Chama createService()
- → T.1.2 (Form usado na página)

---

#### **T.1.2 - Create Service Page**
**Arquivos a criar:**
- `app/(app)/servicos/novo/page.tsx`

**Layout:**
- Header com "Cancelar" e "Publicar"
- Tabs para "Ofereço" / "Preciso"
- Formulário
- Preview visual do card

**Propósito:**
- Página completa de criação

**Conexões:**
- ← T.1.1 (Usa ServiceForm)
- → T.2 (Serviço aparece no matching)

---

#### **T.1.3 - Edit Service Page**
**Arquivos a criar:**
- `app/(app)/servicos/[id]/editar/page.tsx`

**Features:**
- Carregar dados existentes
- Salvar alterações
- Deletar serviço

**Propósito:**
- Editar serviços existentes

**Conexões:**
- ← T.1.1 (Reutiliza ServiceForm)
- ← Pacote 1 (I.3.3) - updateService(), deleteService()

---

#### **T.1.4 - My Services List**
**Arquivos a criar:**
- `app/(app)/meus-servicos/page.tsx`
- `components/features/services/MyServicesList/MyServicesList.tsx`

**Features:**
- Lista de serviços do usuário
- Filtros: Todos, Ofertas, Pedidos
- Status: Ativo, Matched, Concluído
- Ações: Editar, Pausar, Deletar

**Propósito:**
- Gerenciar serviços criados

**Conexões:**
- ← Pacote 2 (C.2.4) - Usa ServiceCard
- ← Pacote 1 (I.3.3) - getServices()
- → T.1.3 (Link para editar)

---

### **T.2 - Algoritmo e Página de Matching**

#### **T.2.1 - Matching Algorithm**
**Arquivos a criar:**
- `lib/matching/algorithm.ts`
- `lib/matching/types.ts`
- `lib/matching/filters.ts`

**Lógica de matching:**
```typescript
interface MatchCriteria {
  type: 'complementary' // Offer ↔ Request
  category: 'same'      // Mesma categoria
  proximity: 'within'   // Dentro do raio
  status: 'active'      // Apenas ativos
}

interface MatchScore {
  serviceId: string
  score: number         // 0-100
  distance?: number     // km
  reasons: string[]     // Por que deu match
}
```

**Algoritmo:**
1. Buscar serviços do tipo oposto (offer ↔ request)
2. Filtrar por categoria igual
3. Filtrar por proximidade (localização futura)
4. Calcular score baseado em:
   - Compatibilidade de categoria (peso: 40)
   - Proximidade geográfica (peso: 30)
   - Completude do perfil (peso: 20)
   - Rating do usuário (peso: 10)
5. Ordenar por score
6. Excluir já visualizados/rejeitados

**Propósito:**
- Core do sistema de matching
- Encontrar serviços complementares

**Conexões:**
- ← Pacote 1 (I.3.3) - getMatches()
- → T.2.2 (Usado na página de swipe)

---

#### **T.2.2 - Swipe Interface (Tinder-like)**
**Arquivos a criar:**
- `components/features/matching/SwipeCard/SwipeCard.tsx`
- `components/features/matching/SwipeCard/SwipeCard.animations.ts`
- `lib/hooks/useSwipe.ts`

**Features:**
- Card grande com informações do serviço
- Swipe left = Não interessado (❌)
- Swipe right = Interessado (✅)
- Tap = Ver detalhes
- Botões alternativos para desktop
- Animações suaves

**Dados exibidos no card:**
- Foto do usuário
- Nome do usuário
- Rating (estrelas)
- Título do serviço
- Categoria
- Descrição (prévia)
- Distância
- "Ofereço" ou "Preciso"

**Propósito:**
- Interface intuitiva de matching
- UX familiar (estilo Tinder)

**Conexões:**
- ← T.2.1 (Recebe matches do algoritmo)
- ← Pacote 2 (C.2.6) - Usa Avatar
- → T.2.4 (Match confirmado)

---

#### **T.2.3 - Matching Page**
**Arquivos a criar:**
- `app/(app)/trocas/page.tsx`
- `components/features/matching/MatchingView/MatchingView.tsx`

**Layout:**
- SwipeCard no centro
- Contador "X serviços disponíveis"
- Botões de ação (mobile + desktop)
- Estado vazio: "Nenhum match disponível"
- Loading state

**Estados:**
- Loading matches
- Mostrando matches
- Fim dos matches
- Erro ao carregar

**Propósito:**
- Página principal do matching

**Conexões:**
- ← T.2.2 (Usa SwipeCard)
- ← T.2.1 (Busca matches)
- → T.2.4 (Ao dar match)

---

#### **T.2.4 - Match Confirmation**
**Arquivos a criar:**
- `components/features/matching/MatchModal/MatchModal.tsx`

**Features:**
- Animação de "É um match!" 🎉
- Fotos dos dois usuários
- Nomes dos serviços
- Botões:
  - "Enviar mensagem" → Abre chat
  - "Continuar procurando" → Fecha modal

**Propósito:**
- Celebrar o match
- Facilitar início da conversa

**Conexões:**
- ← Pacote 2 (C.2.8) - Usa Modal
- ← Pacote 1 (I.3.6) - createChat()
- → T.3 (Redireciona para chat)

---

#### **T.2.5 - Service Detail Modal**
**Arquivos a criar:**
- `components/features/services/ServiceDetail/ServiceDetail.tsx`

**Features:**
- Informações completas do serviço
- Perfil do usuário (com link)
- Avaliações do usuário
- Botão "Interessado" ou "Não interessado"

**Propósito:**
- Ver mais detalhes antes de decidir

**Conexões:**
- ← T.2.2 (Aberto ao clicar no card)
- ← Pacote 2 (C.2.8) - Usa Modal

---

#### **T.2.6 - Matches List**
**Arquivos a criar:**
- `app/(app)/meus-matches/page.tsx`
- `components/features/matching/MatchesList/MatchesList.tsx`

**Features:**
- Lista de matches confirmados
- Preview da última mensagem
- Badge de mensagens não lidas
- Status do serviço
- Filtros: Ativos, Concluídos

**Propósito:**
- Ver todos os matches

**Conexões:**
- ← Pacote 1 (I.3.6) - getChats()
- → T.3 (Link para chat)

---

### **T.3 - Tela de Chat Interno**

#### **T.3.1 - Chat Interface**
**Arquivos a criar:**
- `components/features/chat/ChatWindow/ChatWindow.tsx`
- `components/features/chat/ChatWindow/MessageBubble.tsx`
- `components/features/chat/ChatWindow/MessageInput.tsx`

**Features:**
- Lista de mensagens scrollável
- Auto-scroll para última mensagem
- Bubbles diferentes (enviada/recebida)
- Timestamp
- Status de leitura (✓✓)
- Input de mensagem fixo no bottom
- Botão enviar
- Loading ao enviar

**Propósito:**
- Interface de chat em tempo real

**Conexões:**
- ← Pacote 1 (I.3.6) - getMessages(), sendMessage()
- ← Pacote 1 (I.4.2) - useRealtimeMessages()
- ← Pacote 2 (C.2.2) - Usa Input

---

#### **T.3.2 - Chat Page**
**Arquivos a criar:**
- `app/(app)/chat/[chatId]/page.tsx`

**Layout:**
- Header com:
  - Voltar
  - Avatar + nome do usuário
  - Menu (⋮)
- ChatWindow no centro
- Service info card (colapsável)

**Propósito:**
- Página completa de chat

**Conexões:**
- ← T.3.1 (Usa ChatWindow)
- ← T.3.3 (Usa ServiceInfoCard)

---

#### **T.3.3 - Service Info Card (dentro do chat)**
**Arquivos a criar:**
- `components/features/chat/ServiceInfoCard/ServiceInfoCard.tsx`

**Features:**
- Informações dos 2 serviços (match)
- Botões de ação:
  - "Marcar como concluído" → T.4
  - "Reportar problema"
  - "Ver perfil do usuário"

**Propósito:**
- Contexto do match no chat
- Ações rápidas

**Conexões:**
- → T.4 (Link para avaliação)

---

#### **T.3.4 - Chat List**
**Arquivos a criar:**
- `app/(app)/conversas/page.tsx`
- `components/features/chat/ChatList/ChatList.tsx`
- `components/features/chat/ChatList/ChatListItem.tsx`

**Features:**
- Lista de chats ativos
- Preview da última mensagem
- Badge de não lidas
- Timestamp
- Avatar do outro usuário
- Estado vazio

**Propósito:**
- Ver todos os chats

**Conexões:**
- ← Pacote 1 (I.3.6) - getChats()
- → T.3.2 (Link para chat)

---

#### **T.3.5 - Realtime Integration**
**Arquivos a criar:**
- `lib/hooks/useChatRealtime.ts`

**Features:**
- Subscribe to new messages
- Update chat list on new message
- Notification sound (opcional)
- Badge counter update

**Propósito:**
- Mensagens em tempo real

**Conexões:**
- ← Pacote 1 (I.4.1, I.4.2) - Realtime client
- → T.3.1, T.3.4 (Usado nos componentes)

---

### **T.4 - Sistema de Avaliação Pós-Troca**

#### **T.4.1 - Rating Form**
**Arquivos a criar:**
- `components/features/ratings/RatingForm/RatingForm.tsx`
- `components/features/ratings/StarRating/StarRating.tsx`

**Campos:**
```typescript
interface RatingFormData {
  rating: number        // 1-5 estrelas
  comment?: string      // Opcional, max 500 chars
}
```

**Features:**
- Estrelas interativas (hover + click)
- Campo de comentário opcional
- Preview do que será publicado
- Botões: Cancelar, Enviar

**Propósito:**
- Avaliar experiência com outro usuário

**Conexões:**
- ← Pacote 2 (C.2.3) - Usa Textarea
- ← Pacote 1 (I.3.7) - createRating()

---

#### **T.4.2 - Rating Modal**
**Arquivos a criar:**
- `components/features/ratings/RatingModal/RatingModal.tsx`

**Trigger:**
- Ao marcar serviço como concluído
- Após X dias do match (reminder)

**Layout:**
- "Como foi sua experiência com [Nome]?"
- Avatar do usuário
- RatingForm
- "Pular por agora" link

**Propósito:**
- Solicitar avaliação no momento certo

**Conexões:**
- ← Pacote 2 (C.2.8) - Usa Modal
- ← T.4.1 (Usa RatingForm)
- ← T.3.3 (Acionado do ServiceInfoCard)

---

#### **T.4.3 - Rating Display**
**Arquivos a criar:**
- `components/features/ratings/RatingDisplay/RatingDisplay.tsx`
- `components/features/ratings/RatingsList/RatingsList.tsx`

**Features:**
- Média de estrelas
- Total de avaliações
- Lista de comentários
- Foto + nome de quem avaliou
- Data da avaliação

**Propósito:**
- Exibir avaliações no perfil

**Conexões:**
- ← Pacote 1 (I.3.7) - getUserRatings()
- → Página de perfil

---

#### **T.4.4 - Complete Service Flow**
**Arquivos a criar:**
- `components/features/services/CompleteServiceModal/CompleteServiceModal.tsx`

**Flow:**
1. Usuário clica "Marcar como concluído"
2. Modal de confirmação
3. Atualizar status do serviço
4. Abrir RatingModal
5. Enviar avaliação
6. Atualizar rating do usuário

**Propósito:**
- Fluxo completo de conclusão + avaliação

**Conexões:**
- ← Pacote 1 (I.3.3) - updateService()
- ← T.4.2 (Abre RatingModal)

---

## 📊 Checklist de Conclusão

### T.1 - Cadastro de Serviços
- [ ] T.1.1 - ServiceForm component
- [ ] T.1.2 - Create service page
- [ ] T.1.3 - Edit service page
- [ ] T.1.4 - My services list

### T.2 - Matching
- [ ] T.2.1 - Matching algorithm
- [ ] T.2.2 - Swipe interface
- [ ] T.2.3 - Matching page
- [ ] T.2.4 - Match confirmation
- [ ] T.2.5 - Service detail modal
- [ ] T.2.6 - Matches list

### T.3 - Chat
- [ ] T.3.1 - Chat interface
- [ ] T.3.2 - Chat page
- [ ] T.3.3 - Service info card
- [ ] T.3.4 - Chat list
- [ ] T.3.5 - Realtime integration

### T.4 - Avaliações
- [ ] T.4.1 - Rating form
- [ ] T.4.2 - Rating modal
- [ ] T.4.3 - Rating display
- [ ] T.4.4 - Complete service flow

---

## 🔗 Dependências com Outros Pacotes

### Pacote 1 (Infraestrutura)
- **Recebe:**
  - Service Service (I.3.3) - CRUD de serviços
  - Chat Service (I.3.6) - Sistema de chat
  - Rating Service (I.3.7) - Avaliações
  - Realtime hooks (I.4.2) - Mensagens em tempo real
  - Auth hooks (I.2.2) - Usuário atual

### Pacote 2 (Componentes)
- **Recebe:**
  - Todos os componentes UI
  - Layout e navegação
  - Design tokens

### Pacote 4 (Feira e Mural)
- **Compartilha:**
  - Chat system (mesmo componente)
  - Rating display (mesmo componente)

---

## 🎯 Fluxo do Usuário

### 1. Criar Serviço
1. Usuário clica "Novo Serviço" (T.1.2)
2. Escolhe tipo: Ofereço / Preciso
3. Preenche formulário (T.1.1)
4. Publica serviço
5. Aparece em "Meus Serviços" (T.1.4)

### 2. Fazer Matching
1. Usuário vai para tab "Trocas" (T.2.3)
2. Vê cards de serviços compatíveis (T.2.2)
3. Swipe right = Interessado
4. Se outro usuário também swipou right = Match! (T.2.4)
5. Pode enviar mensagem imediatamente

### 3. Conversar
1. Match aparece em "Conversas" (T.3.4)
2. Usuário abre chat (T.3.2)
3. Envia mensagens em tempo real (T.3.1)
4. Combina detalhes da troca
5. Marca como concluído (T.3.3)

### 4. Avaliar
1. Ao marcar como concluído, abre modal (T.4.2)
2. Usuário dá nota e comentário (T.4.1)
3. Avaliação aparece no perfil (T.4.3)
4. Rating médio é atualizado

---

## 🎯 Próximos Passos

### Ordem recomendada de implementação:

1. **T.1 - Cadastro** (Base para tudo)
   - T.1.1, T.1.2 (Criar serviço)
   - T.1.4 (Listar meus serviços)
   - T.1.3 (Editar - pode ser depois)

2. **T.2 - Matching** (Core do MVP)
   - T.2.1 (Algoritmo primeiro!)
   - T.2.2, T.2.3 (Interface de swipe)
   - T.2.4 (Confirmação de match)
   - T.2.5, T.2.6 (Detalhes - pode ser depois)

3. **T.3 - Chat** (Comunicação essencial)
   - T.3.1 (Interface de chat)
   - T.3.5 (Realtime primeiro!)
   - T.3.2 (Página de chat)
   - T.3.4 (Lista de chats)
   - T.3.3 (Service info - pode ser depois)

4. **T.4 - Avaliações** (Finaliza o ciclo)
   - T.4.1 (Form de avaliação)
   - T.4.2 (Modal de avaliação)
   - T.4.4 (Fluxo de conclusão)
   - T.4.3 (Display - pode ser depois)

### MVP Mínimo:
- T.1.1, T.1.2, T.1.4 (Cadastro)
- T.2.1, T.2.2, T.2.3, T.2.4 (Matching básico)
- T.3.1, T.3.2, T.3.5 (Chat básico)
- T.4.1, T.4.2 (Avaliação básica)

### Pode deixar para depois:
- T.1.3 (Editar serviço)
- T.2.5, T.2.6 (Detalhes e lista de matches)
- T.3.3, T.3.4 (Service info e lista de chats)
- T.4.3, T.4.4 (Display e fluxo completo)
