# Layout Web — Tekoa
**Descritivo para dev FE — Next.js + PWA**
Versão 0.1

---

## Contexto

O Tekoa é um app comunitário de trocas e economia solidária.
A versão web é um **PWA (Progressive Web App)** construído em Next.js.
O modelo de entrada é por indicação via link — o usuário chega no browser, passa pelo onboarding e pode instalar o app na home screen.

Stack assumida: **Next.js 14+ (App Router), Tailwind CSS, TypeScript.**

---

## 1. Breakpoints

O produto é mobile-first. A web adiciona suporte a telas maiores sem mudar o DNA do design.

| Nome       | Largura       | Comportamento                                   |
|------------|---------------|-------------------------------------------------|
| `mobile`   | < 640px       | Layout full-width, bottom nav                   |
| `tablet`   | 640px–1024px  | Layout centralizado max-width 480px, side nav   |
| `desktop`  | > 1024px      | Layout two-column, side nav expandida           |

**Regra principal:** o conteúdo nunca ultrapassa `max-width: 480px` no eixo central. Em desktop, esse container fica à esquerda ou centralizado com sidebar à direita.

---

## 2. Estrutura Geral de Layout

### Mobile (< 640px)
```
┌─────────────────────────┐
│ [CONTEÚDO DA TELA]      │
│                         │
│                         │
│                         │
│                         │
├─────────────────────────┤
│ [BOTTOM NAV]            │
│  Início Trocas Feira    │
│  Avisos  Perfil         │
└─────────────────────────┘
```

### Tablet (640px–1024px)
```
┌──────────────────────────────────┐
│ ┌──────┐ ┌──────────────────┐   │
│ │ SIDE │ │                  │   │
│ │ NAV  │ │   CONTEÚDO       │   │
│ │      │ │   max 480px      │   │
│ │ íco- │ │                  │   │
│ │ nes  │ │                  │   │
│ └──────┘ └──────────────────┘   │
└──────────────────────────────────┘
```

### Desktop (> 1024px)
```
┌────────────────────────────────────────────────┐
│ ┌───────────┐ ┌──────────────┐ ┌────────────┐ │
│ │ SIDE NAV  │ │              │ │  PAINEL    │ │
│ │ expandida │ │  CONTEÚDO    │ │  LATERAL   │ │
│ │           │ │  max 480px   │ │  (feed,    │ │
│ │ - Início  │ │              │ │  detalhes, │ │
│ │ - Trocas  │ │              │ │  chat)     │ │
│ │ - Feira   │ │              │ │            │ │
│ │ - Avisos  │ │              │ │            │ │
│ │ - Perfil  │ │              │ │            │ │
│ └───────────┘ └──────────────┘ └────────────┘ │
└────────────────────────────────────────────────┘
```

---

## 3. Componente de Layout Raiz

```tsx
// app/layout.tsx (simplificado)

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-creme font-body">
        <div className="flex min-h-screen">
          {/* Side nav — visível apenas tablet+ */}
          <SideNav className="hidden sm:flex" />

          {/* Coluna central */}
          <main className="flex-1 flex flex-col max-w-[480px] mx-auto w-full">
            {children}
          </main>

          {/* Painel lateral direito — visível apenas desktop */}
          <aside className="hidden lg:block w-[320px]">
            <RightPanel />
          </aside>
        </div>

        {/* Bottom nav — visível apenas mobile */}
        <BottomNav className="sm:hidden" />
      </body>
    </html>
  )
}
```

---

## 4. Navegação

### 4.1 Bottom Nav (mobile)

Fixada na base da tela. 5 itens.

```
┌─────────────────────────────────────┐
│  🏠      ⇄      🛍      📢      👤  │
│ Início  Trocas  Feira  Avisos  Perfil│
└─────────────────────────────────────┘
```

**Especificações:**
- `position: fixed; bottom: 0; left: 0; right: 0`
- `height: 56px`
- `padding-bottom: env(safe-area-inset-bottom)` — para iPhone com home indicator
- Background: `--color-creme` (`#F5EFE6`)
- Borda top: `1px solid #D4C4AE`
- Ícone ativo: `--color-terra` (`#B85C2A`), 20px
- Ícone inativo: `--color-ouro` (`#C9A97A`), 20px
- Label: IBM Plex Sans, 9px, mesma cor do ícone
- Área de toque mínima: 44x44px por item

**Ícones Tabler:**
- Início → `ti-home`
- Trocas → `ti-arrows-exchange`
- Feira → `ti-shopping-bag`
- Avisos → `ti-speakerphone`
- Perfil → `ti-user`

---

### 4.2 Side Nav (tablet e desktop)

**Tablet:** ícones apenas, sem label, largura 56px
**Desktop:** ícones + labels, largura 200px

```
┌──────────────────┐
│  [LOGO TEKOA]    │  ← só no desktop
├──────────────────┤
│  🏠  Início      │  ← ativo: fundo terra-light, texto terra
│  ⇄   Trocas      │  ← inativo: texto tinta-mid
│  🛍  Feira       │
│  📢  Avisos      │
│  👤  Perfil      │
├──────────────────┤
│  ⚙   Config      │  ← fixado embaixo
└──────────────────┘
```

**Especificações:**
- Background: `--color-creme` (`#F5EFE6`)
- Borda direita: `1px solid #D4C4AE`
- Item ativo: background `--color-terra-light`, ícone + texto `--color-terra`
- Item inativo: ícone `--color-ouro`, texto `--color-tinta-mid`
- Border-radius do item: 8px, margin horizontal 8px
- Altura do item: 44px (mínimo de toque)

---

## 5. Telas — Fluxo de Onboarding

### 5.1 Splash / Landing

**Rota:** `/` (não autenticado)

**Layout:**
- Full-screen, sem nav
- Background: `--color-tinta` (`#1C1510`)
- `min-height: 100svh` (small viewport height — respeita barra do browser mobile)

**Estrutura visual (de cima para baixo):**

```
┌─────────────────────────┐
│ [grafismo diagonal SVG] │  ← canto sup direito, opacity 0.12
│                         │
│                         │
│  TEK                    │  ← Syne 800, 72px, #F5EFE6
│  OA                     │  ← Syne 800, 72px, #B85C2A
│                         │
│  ─────────────────────  │  ← linha ouro, opacity 0.5
│  aldeia · troca ·       │  ← IBM Plex 400, 13px, #C9A97A
│  comunidade             │
│                         │
│  [Entrar na roda]       │  ← botão primário terra
│                         │
│  Já faço parte          │  ← link discreto, #C9A97A
│                         │
│  • · • · • · •          │  ← constelação de pontos (SVG)
└─────────────────────────┘
```

**Responsivo:**
- Mobile: font-size do lettering 72px
- Tablet+: font-size 96px, container centralizado max-width 480px

**Componente do grafismo:**
SVG inline, posição absolute no canto superior direito, linhas diagonais cruzadas formando losangos, `currentColor` ouro, opacity 0.12.

**Componente da constelação:**
SVG inline no rodapé, pontos e linhas conectadas representando territórios/caminhos, opacity 0.22.

---

### 5.2 Slides de Onboarding

**Rota:** `/onboarding`

**Layout:**
- Full-screen sem nav
- Background: `--color-creme`
- Controlado por estado local: `step` (0, 1, 2)
- Pode usar `framer-motion` para transição entre slides (slide horizontal)

**Estrutura por slide:**

```
┌─────────────────────────┐
│ [●●○○] [Pular]          │  ← dots de progresso + skip
├─────────────────────────┤
│ [MAPA COMPACTO SVG]     │  ← 100px height
│ [borda triângulos]      │  ← SVG, #C9A97A, opacity 0.4
├─────────────────────────┤
│                         │
│  Troque o que           │  ← Syne 700, 22px, tinta
│  você sabe              │
│  fazer.                 │  ← última linha: terra
│                         │
│  Descrição curta        │  ← IBM Plex 400, 13px, tinta-mid
│  em até 3 linhas        │
│                         │
│  [legenda dos           │
│   marcadores]           │
│                         │
│  [Próximo]              │  ← botão primário
└─────────────────────────┘
```

**Slides definidos:**

| Slide | Título | Última palavra | Descrição curta |
|-------|--------|----------------|-----------------|
| 1 | "Troque o que você sabe" | "fazer." | Você conserta bicicleta, a vizinha dá aula de inglês. Sem precisar de dinheiro. |
| 2 | "Compre, venda ou troque no" | "seu bairro." | A Feira do Rolo é o mercado do seu bairro — sem sair de perto de casa. |
| 3 | "Fique por dentro do que acontece no" | "bairro." | Mutirões, campanhas, avisos — tudo no Mural da sua comunidade. |

**Dots de progresso:**
- Ativo: `width: 28px, height: 5px, border-radius: 2.5px`, cor terra
- Inativo: `width: 10px`, cor ouro, opacity 0.35

**Borda de triângulos:**
SVG reutilizável como componente `<TriangleBorder color="#C9A97A" opacity={0.4} />`.
Série de polígonos alternados formando dente de serra, altura 8px, largura 100%.

---

### 5.3 Cadastro

**Rota:** `/cadastro`

**Layout:**
- Background: `--color-creme`
- Sem nav
- Container: max-width 480px, padding 24px

```
┌─────────────────────────┐
│  Quem é você?           │  ← Syne 700, 20px
│  Só o básico por agora. │  ← IBM Plex 400, 12px, tinta-mid
│                         │
│  [Entrar com Google]    │  ← botão ghost com logo Google
│                         │
│  ─── ou ───             │  ← divider
│                         │
│  NOME                   │  ← label uppercase 10px
│  [Como te chamam...]    │  ← input creme-dark
│                         │
│  TELEFONE               │
│  [(11) 99999-9999]      │
│                         │
│  [Continuar]            │  ← botão primário
└─────────────────────────┘
```

**Validações mínimas:**
- Nome: mínimo 2 caracteres
- Telefone: formato BR (11 dígitos com máscara)
- Erro inline abaixo do campo, IBM Plex 11px, `--color-erro`

---

### 5.4 Escolha de Comunidade

**Rota:** `/cadastro/comunidade`

**Layout:**
- Background: `--color-creme`
- Sem nav

```
┌─────────────────────────┐
│ [MAPA DE RUAS SVG]      │  ← ~200px, com marcadores
│ [borda triângulos]      │
├─────────────────────────┤
│  Qual é o seu bairro?   │  ← Syne 700, 18px
│  Comunidades perto de   │  ← IBM Plex 400, 11px, ouro
│  você                   │
│                         │
│  ┌─────────────────┐    │  ← card selecionado: borda terra
│  │ [●] Jd. Acácias │    │     background terra-light
│  │ 247 viz · 1,2km │ ✓  │
│  └─────────────────┘    │
│  ┌─────────────────┐    │  ← card normal: borda palha
│  │ [○] Vila Esp.   │    │     background creme-dark
│  │ 134 viz · 2,8km │    │
│  └─────────────────┘    │
│                         │
│  [Essa é a minha]       │  ← botão tinta escura
└─────────────────────────┘
```

**Marcador no card:**
Círculo com dois anéis — terra para selecionado, musgo para demais. Mesmo componente `<CommunityMarker>` usado no mapa.

**Interação no mapa:**
Clicar em um marcador seleciona o card correspondente abaixo. Scroll suave até o card.

---

## 6. Telas — App Autenticado

### 6.1 Dashboard (Home)

**Rota:** `/home`

**Estrutura:**

```
┌─────────────────────────┐
│ [HEADER TERRA]          │
│  Boa tarde,             │  ← IBM Plex 400, 11px, creme/65%
│  Ana Silva              │  ← Syne 800, 16px, creme
│  [● Jd. das Acácias]   │  ← badge comunidade
│  [grafismo mosaico]     │  ← SVG, canto direito, opacity 0.10
├─────────────────────────┤
│ ┌──────────┐ ┌────────┐ │
│ │ Trocar   │ │ Feira  │ │  ← 2 botões de ação, grid 2 cols
│ │ serviço  │ │ do     │ │
│ │   ⇄      │ │ Rolo 🛍│ │
│ └──────────┘ └────────┘ │
├─────────────────────────┤
│  MOVIMENTANDO O BAIRRO  │  ← label seção, uppercase 10px
│                         │
│  [card feed]            │  ← serviço novo
│  [card feed]            │  ← aviso
│  [card feed]            │  ← produto feira
│  [card feed]            │  ← ...
└─────────────────────────┘
```

**Header:**
- Background: `--color-terra`
- `border-radius: 0 0 16px 16px`
- Padding: 16px 16px 14px
- Grafismo mosaico: SVG posicionado absolute canto superior direito, opacity 0.10

**Botões de ação:**
- Grid 2 colunas, gap 8px
- Background: `--color-creme-dark`
- Borda: `1px solid #D4C4AE`
- Border-radius: 8px
- Padding: 12px 8px
- Ícone: 20px, `--color-terra`
- Label: Syne 700, 11px, tinta

**Feed cards (componente `<FeedCard>`):**

```tsx
interface FeedCardProps {
  icon: string        // tabler icon name
  title: string       // Syne 700, 12px, tinta
  meta: string        // IBM Plex 400, 10px, tinta-light
  badge?: {
    label: string
    type: 'novo' | 'aviso' | 'feira' | 'troca'
  }
}
```

Cores de badge:
- `novo`: background terra, texto creme
- `aviso`: background musgo-light, texto musgo
- `feira`: background ouro-light, texto tinta-mid
- `troca`: background rgba(tinta, 0.08), texto tinta-mid

---

### 6.2 Trocas de Serviços

**Rota:** `/trocas`

**Estrutura:**

```
┌─────────────────────────┐
│  Trocas          [+ Nova]│  ← Syne 700 18px + botão add
├─────────────────────────┤
│  [○ Busco] [● Ofereço]  │  ← toggle pill, 2 opções
├─────────────────────────┤
│  [card serviço]         │
│  [card serviço]         │
│  [card serviço]         │
└─────────────────────────┘
```

**Card de serviço (`<ServiceCard>`):**

```
┌────────────────────────────┐
│ [avatar] Nome · bairro     │
│          há 2h             │
│                            │
│  Conserto elétrico         │  ← Syne 700, 14px
│  Residencial e predial     │  ← IBM Plex 400, 12px, tinta-mid
│                            │
│  [ELÉTRICA] [REPARO]       │  ← tags categoria
│                            │
│         [Tenho interesse]  │  ← botão secundário
└────────────────────────────┘
```

**Toggle busco/ofereço:**
- Pill container: background creme-dark, borda palha, border-radius full
- Item ativo: background terra, texto creme, border-radius full
- Item inativo: texto tinta-mid

---

### 6.3 Feira do Rolo

**Rota:** `/feira`

**Estrutura:**

```
┌─────────────────────────┐
│  Feira do Rolo   [+ Add] │
├─────────────────────────┤
│  [🔍 Buscar...]         │  ← input de busca
├─────────────────────────┤
│  Todos Alimentos Roupas  │  ← chips de categoria, scroll h
│  Móveis  Serviços Outros │
├─────────────────────────┤
│  [card produto]         │
│  [card produto]         │
│  [card produto]         │
└─────────────────────────┘
```

**Card de produto (`<ProductCard>`):**

```
┌────────────────────────────┐
│ [imagem 1:1, border-rad 8] │
│                            │
│  Sofá 2 lugares            │  ← Syne 700, 13px
│  Maria · Jd. das Acácias   │  ← IBM Plex 400, 10px, tinta-light
│                            │
│  R$ 150        [Negociar]  │  ← preço tinta + botão ghost
└────────────────────────────┘
```

Grid: 2 colunas em mobile/tablet, 1 coluna se largura < 320px.

---

### 6.4 Avisos e Campanhas

**Rota:** `/avisos`

**Estrutura feed:**

```
┌─────────────────────────┐
│  Mural              [+] │
├─────────────────────────┤
│  Todos Eventos Campanhas │  ← chips filtro
│  Urgente               │
├─────────────────────────┤
│  [card aviso]           │
│  [card aviso]           │
└─────────────────────────┘
```

**Card de aviso (`<NoticeCard>`):**

```
┌────────────────────────────┐
│ [EVENTO]  Sábado, 14 jun   │  ← badge + data
│                            │
│  Mutirão de limpeza        │  ← Syne 700, 15px
│  Praça central · 8h        │  ← IBM Plex 400, 12px
│                            │
│  Texto do aviso em até     │
│  3 linhas visíveis         │
│                            │
│  [Quero participar]        │
└────────────────────────────┘
```

---

### 6.5 Perfil

**Rota:** `/perfil`

```
┌─────────────────────────┐
│ [HEADER TERRA]           │
│  [avatar 64px]           │
│  Ana Silva               │
│  Jd. das Acácias         │
├─────────────────────────┤
│  MINHA ATIVIDADE        │
│  ┌────────┐ ┌────────┐  │
│  │  12    │ │   8    │  │  ← metric cards
│  │ trocas │ │ itens  │  │
│  └────────┘ └────────┘  │
├─────────────────────────┤
│  Meus serviços    [ver] │
│  Meus produtos    [ver] │
│  Histórico trocas [ver] │
├─────────────────────────┤
│  Configurações          │
│  Sair                   │
└─────────────────────────┘
```

---

## 7. Componentes Globais

### `<TriangleBorder />`
SVG reutilizável. Props: `color`, `opacity`, `height`.
Usado como divisor entre mapa e conteúdo nas telas de onboarding.

### `<CommunityMarker />`
SVG de marcador com dois anéis concêntricos.
Props: `variant` (`primary` = terra, `secondary` = musgo), `size`.
Usado no mapa e nos cards de comunidade.

### `<FeedCard />`
Card de feed unificado para trocas, produtos e avisos no dashboard.

### `<MosaicPattern />`
SVG do padrão geométrico de assinatura.
Usado no header do dashboard e na splash.
Props: `color`, `opacity`, `width`, `height`.

### `<SectionLabel />`
Label de seção: IBM Plex Sans 500, 10px, uppercase, letter-spacing 0.07em, `--color-tinta-mid`, opacity 0.7.

### `<PageHeader />`
Header com background terra, grafismo mosaico, saudação e badge de comunidade.
Usado no dashboard e no perfil.

---

## 8. Animações e Transições

Mínimas e intencionais. Usar `framer-motion` apenas onde agrega:

| Onde | Tipo | Duração |
|------|------|---------|
| Transição entre slides do onboarding | slide horizontal | 280ms ease |
| Entrada de cards no feed | fade + translateY(8px) | 200ms ease | 
| Toggle busco/ofereço | background sliding | 180ms ease |
| Seleção de comunidade | borda e background | 150ms ease |

`prefers-reduced-motion`: todas as animações desabilitadas quando ativo.

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

---

## 9. PWA — Configurações Next.js

Usar `next-pwa` ou configuração manual com `next.config.js`.

**Manifest (`public/manifest.json`):**
```json
{
  "name": "Tekoa",
  "short_name": "Tekoa",
  "description": "Trocas e economia solidária no seu bairro",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1C1510",
  "theme_color": "#B85C2A",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Meta tags no `<head>`:**
```html
<meta name="theme-color" content="#B85C2A" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

**Viewport:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

`viewport-fit=cover` é necessário para o `env(safe-area-inset-*)` funcionar corretamente em iPhones.

---

## 10. Rotas (App Router Next.js)

```
app/
├── layout.tsx              ← layout raiz com nav
├── page.tsx                ← splash / landing (não autenticado)
├── onboarding/
│   └── page.tsx            ← slides de funcionalidades
├── cadastro/
│   ├── page.tsx            ← form de cadastro
│   └── comunidade/
│       └── page.tsx        ← escolha de bairro
├── home/
│   └── page.tsx            ← dashboard
├── trocas/
│   ├── page.tsx            ← feed de serviços
│   └── nova/
│       └── page.tsx        ← form nova oferta
├── feira/
│   ├── page.tsx            ← listagem produtos
│   └── novo/
│       └── page.tsx        ← form novo produto
├── avisos/
│   └── page.tsx            ← mural
└── perfil/
    └── page.tsx            ← perfil do usuário
```

**Proteção de rotas:**
- `/home`, `/trocas`, `/feira`, `/avisos`, `/perfil` → requer autenticação
- `/`, `/onboarding`, `/cadastro` → apenas para não autenticados (redireciona se logado)

---

## 11. O Que Este Documento Não Cobre

- Autenticação (recomendado: NextAuth.js ou Supabase Auth)
- Backend / API (a definir)
- Estado global (recomendado: Zustand ou Context API)
- Upload de imagens
- Sistema de chat em tempo real (Socket.io ou Supabase Realtime)
- Notificações push (Web Push API)
- Mapa interativo real (Leaflet.js ou Mapbox — a definir)

Esses tópicos merecem documentos separados após definição da stack completa.

---

*Layout Web Tekoa v0.1 — para revisão antes da implementação*
