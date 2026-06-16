# 🗄️ Guia de Setup do Banco de Dados Supabase

## Visão Geral

Este guia mostra como configurar o banco de dados do Tekoa no Supabase usando o schema SQL criado.

---

## 📋 Pré-requisitos

1. Conta no Supabase (gratuita) - https://supabase.com
2. Projeto criado no Supabase Dashboard
3. Arquivo `database-schema.sql` (criado ✅)

---

## 🚀 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse https://app.supabase.com
2. Clique em "New Project"
3. Preencha:
   - **Name:** tekoa (ou nome de sua escolha)
   - **Database Password:** Crie uma senha forte e salve
   - **Region:** Escolha a mais próxima (ex: South America - São Paulo)
   - **Pricing Plan:** Free (para desenvolvimento)
4. Clique em "Create new project"
5. Aguarde 2-3 minutos até o projeto estar pronto

### 2. Obter Credenciais do Projeto

1. No Dashboard do projeto, vá em **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL** (algo como: `https://xxxxx.supabase.co`)
   - **anon/public key** (uma string longa começando com `eyJ...`)
3. Salve essas informações - você vai precisar delas para o `.env.local`

### 3. Executar o Schema SQL

**Opção A: Via SQL Editor (Recomendado)**

1. No Dashboard, vá em **SQL Editor**
2. Clique em "New Query"
3. Abra o arquivo `docs/database-schema.sql`
4. Copie **TODO O CONTEÚDO** do arquivo
5. Cole no editor SQL do Supabase
6. Clique em **Run** (ou pressione Ctrl+Enter)
7. Aguarde a execução (pode levar 10-20 segundos)
8. Você verá "Success. No rows returned" - isso é normal!

**Opção B: Via CLI do Supabase**

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Fazer login
supabase login

# Link ao projeto (você vai precisar do Project ID)
supabase link --project-ref xxxxx

# Executar o schema
supabase db push
```

### 4. Verificar se Tudo Foi Criado

Execute esta query no SQL Editor para ver todas as tabelas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Você deve ver:
- ✅ users
- ✅ services
- ✅ products
- ✅ mural_posts
- ✅ chats
- ✅ messages
- ✅ ratings

### 5. Verificar Storage Buckets

1. Vá em **Storage** no menu lateral
2. Você deve ver 3 buckets criados:
   - ✅ avatars
   - ✅ products
   - ✅ mural

### 6. Verificar Realtime

1. Vá em **Database** → **Replication**
2. Verifique se as seguintes tabelas estão habilitadas:
   - ✅ messages
   - ✅ mural_posts
   - ✅ chats

Se não estiverem, habilite manualmente clicando na linha e ativando.

---

## 🔐 Configurar Variáveis de Ambiente

### No arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...sua-chave-aqui
```

### Criar o arquivo:

```bash
cp .env.local.example .env.local
```

Depois edite `.env.local` com suas credenciais reais.

---

## ✅ Checklist de Validação

Marque conforme completa:

- [ ] Projeto criado no Supabase
- [ ] Schema SQL executado com sucesso
- [ ] 7 tabelas criadas (users, services, products, mural_posts, chats, messages, ratings)
- [ ] 3 storage buckets criados (avatars, products, mural)
- [ ] Realtime habilitado para messages, mural_posts, chats
- [ ] Credenciais copiadas (URL e ANON_KEY)
- [ ] Arquivo `.env.local` criado e configurado

---

## 🔍 Detalhes do Schema

### Tabelas Principais

1. **users** (Perfis)
   - Estende `auth.users` com informações adicionais
   - Rating médio e total de avaliações
   - Bio, localização, avatar

2. **services** (Trocas)
   - Ofertas e pedidos de serviços
   - Sistema de matching (offer ↔ request)
   - Status: active, matched, completed, cancelled

3. **products** (Feira do Rolo)
   - Produtos para venda
   - Array de até 5 imagens
   - Preço, condição, categoria

4. **mural_posts** (Mural)
   - Posts comunitários
   - Likes e comentários (contadores)
   - Tipos: announcement, event, general

5. **chats** (Conversas)
   - Entre 2 participantes
   - Vinculado a service ou product
   - Última mensagem e timestamp

6. **messages** (Mensagens)
   - Mensagens dentro dos chats
   - Status de leitura
   - Realtime habilitado

7. **ratings** (Avaliações)
   - De 1 a 5 estrelas
   - Comentário opcional
   - Atualiza rating do usuário automaticamente

### Segurança (RLS)

Todas as tabelas têm **Row Level Security** habilitado:
- ✅ Usuários só podem editar seus próprios dados
- ✅ Chats só visíveis para participantes
- ✅ Mensagens só visíveis para participantes do chat
- ✅ Dados públicos (serviços, produtos, posts) visíveis para todos

### Triggers Automáticos

- ✅ **updated_at**: Atualizado automaticamente em mudanças
- ✅ **Perfil de usuário**: Criado automaticamente no signup
- ✅ **Rating médio**: Calculado automaticamente ao receber avaliação
- ✅ **Última mensagem**: Chat atualizado automaticamente

---

## 🆘 Problemas Comuns

### Erro: "permission denied for schema public"
**Solução:** Você precisa executar o script com uma conta que tenha permissões de admin. Use o SQL Editor do Dashboard.

### Erro: "relation already exists"
**Solução:** Se você já executou o script antes, você pode:
1. Dropar as tabelas existentes (cuidado - perde dados!)
2. Ou comentar as linhas de criação das tabelas que já existem

### Erro: "function uuid_generate_v4() does not exist"
**Solução:** Execute primeiro:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Storage Buckets não aparecem
**Solução:** Vá manualmente em Storage e crie os buckets:
- Nome: `avatars`, `products`, `mural`
- Public: ✅ (checked)

---

## 📝 Próximos Passos

Após configurar o banco de dados:

1. ✅ **I.1.1 - Schema SQL** - CONCLUÍDO
2. ⏭️ **I.1.2 - Types TypeScript** - JÁ CRIADOS ✅
3. ⏭️ **I.2 - Autenticação** - Implementar hooks e middleware
4. ⏭️ **I.3 - Data Services** - Criar camada de abstração

Continue no documento: `docs/Pacote-1-Infraestrutura.md`

---

## 🔄 Regenerar Types do Supabase (Opcional)

Se você fizer mudanças no schema, regenere os types:

```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref xxxxx

# Gerar types
supabase gen types typescript --linked > types/database.types.ts
```

Ou use o gerador online:
https://supabase.com/dashboard/project/YOUR_PROJECT_ID/api/types

---

**Status:** ✅ Schema criado e documentado  
**Tempo estimado de execução:** 10-15 minutos  
**Última atualização:** 2024-11-11
