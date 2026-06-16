# 🏘️ Tekoa - Plataforma de Economia Colaborativa

Aplicativo web mobile-first que conecta vizinhos para trocar serviços, vender produtos usados e compartilhar avisos comunitários.

## 🎯 Funcionalidades Principais

1. **🤝 Tinder de Trocas** - Sistema de matching para troca de serviços (tipo Tinder)
2. **🛒 Feira do Rolo** - Marketplace de produtos usados entre vizinhos
3. **📋 Mural de Avisos** - Feed comunitário para anúncios e eventos

## 📚 Documentação

O projeto está organizado em **4 pacotes** de desenvolvimento com documentação detalhada:

### 🚀 Comece Aqui
- **[Índice Completo](docs/Indice.md)** - Navegação de toda a documentação
- **[Resumo Executivo](docs/Resumo-Executivo.md)** - Visão geral, cronograma e prioridades

### 📦 Pacotes de Desenvolvimento
1. **[Pacote 1: Infraestrutura](docs/Pacote-1-Infraestrutura.md)** - Backend, banco de dados, autenticação
2. **[Pacote 2: Componentes](docs/Pacote-2-Componentes.md)** - Design system e componentes UI
3. **[Pacote 3: Trocas/Serviços](docs/Pacote-3-Trocas-Servicos.md)** - Core MVP (matching, chat, avaliações)
4. **[Pacote 4: Feira e Mural](docs/Pacote-4-Feira-Mural.md)** - Features secundárias

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Server Actions)
- **Linguagem:** TypeScript
- **Styling:** Tailwind CSS v4 (design tokens próprios — ver `docs/ds.md`)
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Testes:** Vitest + Testing Library
- **Hosting:** Vercel

### Princípio de arquitetura — Regra de Ouro
Nenhuma chamada direta ao Supabase é feita fora da camada de abstração em
`data/`. A UI conversa apenas com Server Components (leitura) e Server Actions
(escrita) que delegam aos *services* (`getServiceService()`, `getProductService()`…).
Trocar o backend um dia significa reescrever só o `data/`.

## 🏁 Getting Started

### Pré-requisitos
- Node.js 20+
- Um projeto no [Supabase](https://supabase.com) (gratuito)

### 1. Instale as dependências
```bash
npm install
```

### 2. Configure as variáveis de ambiente
Crie `.env.local` na raiz com as credenciais do seu projeto Supabase
(Dashboard → Project Settings → API). Aceita o formato novo de chaves
(`sb_publishable_…` / `sb_secret_…`) ou o legado (anon/service_role JWT):

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx        # papel da antiga "anon"
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx                 # papel da antiga "service_role" (só servidor)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Aplique o schema do banco
No **SQL Editor** do Supabase, cole e rode `docs/database-schema.sql`
(cria as 7 tabelas, RLS, triggers, buckets de storage e realtime).

Ou via `psql`, com a connection string do projeto:
```bash
psql "postgresql://postgres:SENHA@db.SEU-PROJETO.supabase.co:5432/postgres" \
  -f docs/database-schema.sql
```

### 4. (Opcional) Popule dados de demonstração
Cria 3 vizinhos do *Jardim das Acácias* com serviços, produtos e avisos —
ótimo para ver o matching e os feeds em ação:
```bash
npm run seed
```
Logins criados (senha `tekoa123`): `maria@tekoa.test`, `joao@tekoa.test`, `cida@tekoa.test`.

> 💡 Para cadastros novos entrarem na hora, desative a confirmação de email
> em Authentication → Sign In / Providers → Email → *Confirm email*.

### 5. Rode o app
```bash
npm run dev     # desenvolvimento em http://localhost:3000
npm test        # suíte de testes (Vitest)
npm run build   # build de produção
```

## 📋 Status do Projeto — MVP funcional ✅

Protótipo navegável e testado de ponta a ponta contra o Supabase real:

- [x] **Infraestrutura** — schema, RLS, auth (signup/login/logout), middleware de rotas, 8 services de abstração, realtime
- [x] **Design System** — tokens (terra/ouro/musgo), componentes base, ícones, navegação mobile + desktop
- [x] **Entrada** — splash "Entrar na roda", cadastro e login
- [x] **Trocas (carro-chefe)** — publicar oferta/pedido, algoritmo de matching, chat em tempo real, avaliação pós-troca
- [x] **Feira do Rolo** — anunciar com upload de fotos, listagem com busca/filtros, detalhes e negociação
- [x] **Mural** — avisos, eventos e campanhas da comunidade
- [x] **Perfil** — atividade, edição de perfil e avatar

## 🏗️ Estrutura do Projeto

```
tekoa/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticação
│   ├── (app)/             # Rotas protegidas
│   └── layout.tsx         # Layout principal
│
├── components/            # Componentes React
│   ├── ui/               # Componentes base
│   ├── layout/           # Layout components
│   └── features/         # Feature components
│
├── data/                 # Services de abstração
│   ├── base.service.ts   # Base service
│   ├── user.service.ts   # User service
│   └── ...               # Outros services
│
├── lib/                  # Bibliotecas e utils
│   ├── supabase/        # Clientes Supabase ✅
│   ├── hooks/           # Custom hooks
│   ├── realtime/        # Realtime client
│   └── utils/           # Utilitários
│
├── types/                # TypeScript types ✅
│   ├── database.types.ts # Types do Supabase
│   └── index.ts         # Types da aplicação
│
├── docs/                 # Documentação ✅
│   ├── Indice.md
│   ├── Resumo-Executivo.md
│   ├── Pacote-1-Infraestrutura.md
│   ├── Pacote-2-Componentes.md
│   ├── Pacote-3-Trocas-Servicos.md
│   └── Pacote-4-Feira-Mural.md
│
└── middleware.ts         # Middleware de auth

✅ = Concluído | 🔄 = Em andamento | ⚪ = Não iniciado
```

## 🤝 Como Contribuir

1. Escolha um pacote de trabalho
2. Leia a documentação específica do pacote
3. Siga as tarefas na ordem sugerida
4. Atualize os checklists conforme conclui tarefas
5. Documente problemas e decisões

### Para Backend Developers
→ Comece pelo [Pacote 1](docs/Pacote-1-Infraestrutura.md)

### Para Frontend Developers
→ Comece pelo [Pacote 2](docs/Pacote-2-Componentes.md)

### Para Full-Stack Developers
→ Leia o [Resumo Executivo](docs/Resumo-Executivo.md) e siga a ordem sugerida

## 📖 Mais Informações

- **Plano Original:** [docs/Plan.md](docs/Plan.md)
- **Descrição do Projeto:** [docs/Descrição.md](docs/Descrição.md)
- **Dados e Schemas:** [docs/Dados.md](docs/Dados.md)

## 📞 Suporte

Para dúvidas sobre arquitetura, consulte o documento específico:
- Infraestrutura/Backend → `docs/Pacote-1-Infraestrutura.md`
- UI/Componentes → `docs/Pacote-2-Componentes.md`
- Matching/Chat → `docs/Pacote-3-Trocas-Servicos.md`
- Feira/Mural → `docs/Pacote-4-Feira-Mural.md`

## 📄 Licença

Este projeto está em desenvolvimento.

---

**Versão:** 1.0.0 (MVP em desenvolvimento)  
**Última atualização:** 2025-11-11
