# Design System — Tekoa

**Versão 1.0** — reflete o que está implementado no app (jun/2026).

Fonte da verdade dos tokens: `app/globals.css` (`@theme` Tailwind v4).  
Componentes base: `components/ui/`. Ícones: `components/icons/Icon.tsx`.

---

## 1. Princípios

O Tekoa vive na tensão entre **rústico e eficiente** — uma feira coberta bem organizada: estrutura funcional, alma de comunidade.

- Pigmentos de terra, ouro e musgo — nada de azul-tech genérico (exceto `anil` pontual em grafismos)
- Fundo creme, texto tinta — nunca branco/preto puros
- Profundidade por **cor de fundo e borda**, não por sombra decorativa
- Mobile-first; desktop usa trilho lateral + painéis (mensagens)
- **Território primeiro** — filtros, tags e escopo de publicação fazem parte da UI

---

## 2. Cores (tokens)

Definidas em `app/globals.css`. Use as classes Tailwind (`bg-terra`, `text-tinta-mid`…).

### Terra (CTA, headers, destaque)

| Token | Hex | Uso |
|-------|-----|-----|
| `terra` | `#b8342a` | Botão primário, TopBar, PageHeader, bolhas de chat (enviadas) |
| `terra-dark` | `#872018` | Hover de primário |
| `terra-light` | `#f4dcd6` | Fundos leves, hover secundário, tag de comunidade |

> A paleta evoluiu do handoff inicial (`#B85C2A`) para um vermelho-terra mais vivo, alinhado aos grafismos kusiwa.

### Ouro e musgo

| Token | Hex | Uso |
|-------|-----|-----|
| `ouro` | `#c9a97a` | Bordas de ênfase, ícones inativos na nav |
| `ouro-light` | `#f0e4cc` | Badges feira/categoria, fundos sutis |
| `musgo` | `#4a6741` | Texto de badges aviso/evento |
| `musgo-light` | `#d6e4d2` | Fundo de badges aviso/evento |

### Acentos de grafismo

| Token | Hex | Uso |
|-------|-----|-----|
| `urucum` | `#b5231a` | Energia visual (grafismos) |
| `brasa` | `#d6362a` | Destaques quentes |
| `anil` | `#2c4a63` | Contraste frio pontual |

### Base

| Token | Hex | Uso |
|-------|-----|-----|
| `tinta` | `#1c1510` | Texto primário |
| `tinta-mid` | `#4a3d33` | Texto secundário, labels |
| `tinta-light` | `#8c7b6e` | Placeholder, meta |
| `creme` | `#f5efe6` | Fundo da app |
| `creme-dark` | `#e8ddcc` | Cards, inputs, bolhas recebidas |
| `palha` | `#d4c4ae` | Bordas padrão |

### Semânticas

| Token | Uso |
|-------|-----|
| `sucesso` / `sucesso-light` | Confirmações (toast, estados positivos) |
| `erro` / `erro-light` | Erros de formulário |
| `alerta` | Reutiliza `terra` |

`themeColor` do PWA: `#b8342a`.

---

## 3. Tipografia

### Famílias

| Papel | Token / classe | Fonte | Onde |
|-------|----------------|-------|------|
| Display | `font-display` | **Adumu** (local, `public/fonts/`) | Títulos de PageHeader, TopBar |
| Hero inline | `font-title-inline` | **Adumu Inline** | Lettering grande (quando usado) |
| Strong | `font-strong` | **Syne** 700–800 | Botões, números, ênfase curta |
| Body | `font-body` | **IBM Plex Sans** 400–500 | Texto corrido, labels, badges |

Adumu e Adumu Inline carregam via `next/font/local` em `app/layout.tsx`. Syne e IBM Plex via Google Fonts.

### Escala prática (como no código)

| Uso | Classes típicas |
|-----|-----------------|
| Título de header | `font-display text-[22px] font-extrabold` (PageHeader) |
| Título de TopBar | `font-display text-[18px] font-bold` |
| Título de card | `font-strong text-[15px] font-bold` |
| Corpo | `font-body text-[13px]` ou `text-sm` |
| Meta / timestamp | `font-body text-[11px] text-tinta-light` |
| Label de campo | `text-[10px] uppercase tracking-[0.07em] text-tinta-mid` |
| Badge | `text-[10px] uppercase tracking-[0.06em]` |

### Regras

- Títulos em sentence case (exceto labels micro uppercase)
- `font-synthesis: none` no `body` — Adumu não tem bold sintético
- Evitar peso 600+ em IBM Plex no corpo longo

---

## 4. Espaçamento e raio

Escala base 4px — use utilitários Tailwind (`p-4`, `gap-3`, `mb-6`).

| Token | Valor | Uso |
|-------|-------|-----|
| `radius-sm` | 4px | Badges (`rounded-sm`) |
| `radius-md` | 8px | Botões, inputs (`rounded-md`) |
| `radius-lg` | 12px | Cards |
| `radius-xl` | 18px | PageHeader (`rounded-b-2xl`) |
| `radius-full` | pill | Chips, Toggle, TerritoryToggle, avatares |

Padding lateral padrão de tela: `px-4` (16px).

---

## 5. Bordas

- Padrão: `border border-palha`
- Ênfase / hover de card: `hover:border-ouro`
- Foco de input: `focus:border-terra`
- Divisor: `border-t border-palha` ou `divide-palha`

Sem `box-shadow` decorativa.

---

## 6. Iconografia

**Não usamos Tabler via CDN.** Ícones inline em `components/icons/Icon.tsx` (SVG 24×24, `currentColor`).

Nomes usados na nav e features: `home`, `exchange`, `bag`, `speakerphone`, `user`, `message`, `plus`, `map-pin`, `star`, `send`, `arrow-left`, `chevron-right`, `shield` (admin)…

| Contexto | Tamanho |
|----------|---------|
| Bottom nav | 20px |
| TopBar / ações | 16–20px |
| Dentro de card | 18–20px |

Sempre `aria-hidden` em ícone decorativo; `aria-label` em botão só-ícone.

---

## 7. Grafismos (identidade visual)

Composições inspiradas em grafismos indígenas (kusiwa), arquivos em `public/images/`:

- `caninana-m`, `jabuti-m`, `rio-m`, `samauma-m` (sufixo `-m` = versão para faixa)

Mapeamento por rota em `lib/screenGraphics.ts` (`bandGraphicFor`, `pageGraphicFor`).

**Estado atual:** `PageHeader` e `TopBar` usam **faixa sólida `bg-terra`** — o fundo com imagem está preparado na API (`graphic` prop) mas desligado até refinamento visual. Texturas de página podem ser aplicadas em layouts específicos.

O padrão de mosaico SVG do handoff v0.1 **não está em uso**.

---

## 8. Componentes UI (`components/ui/`)

| Componente | Notas |
|------------|-------|
| `Button` | `primary` \| `secondary` \| `ghost` \| `dark`; tamanhos `sm` \| `md` \| `lg`; `loading` com `.tk-spinner`; `min-h` 36–48px |
| `Input`, `Textarea`, `Select` | Label uppercase, borda `palha`, foco `terra`, erro `erro` |
| `Badge` | Tipos: `novo`, `aviso`, `evento`, `feira`, `troca`, `categoria`, `comunidade` |
| `Chip` | Filtros horizontais (mural); ativo `bg-terra text-creme` |
| `Toggle` | Pílula dupla (Oferecem/Buscam); mesmo visual do TerritoryToggle |
| `Avatar` | Iniciais ou imagem; tamanhos configuráveis |
| `Card` | Base genérica (pouco usada — cards de feature são custom) |
| `EmptyState` | Ícone + título + descrição + slot de ação |
| `Toast` | Feedback de ações (sucesso/erro) |
| `SectionLabel` | Título de bloco uppercase discreto |
| `InfoTip` | Tooltip de contexto (ex.: explicação de Trocas) |

### Badge — mapeamento de domínio

| type | Visual | Uso |
|------|--------|-----|
| `novo` | terra/creme | Destaque, status ativo |
| `aviso` / `evento` | musgo-light/musgo | Tipos de mural |
| `feira` / `categoria` | ouro-light/tinta-mid | Produtos, categorias |
| `troca` | tinta/8% | Oferece/Busca |
| `comunidade` | creme/15 sobre fundo escuro | Badge no header escuro |

---

## 9. Componentes de layout

| Componente | Uso |
|------------|-----|
| `PageHeader` | Dashboard, perfil — faixa terra, eyebrow, título, badge de comunidade |
| `TopBar` | Páginas internas — sticky, `back`, ação à direita |
| `BottomNav` | Mobile — 5 itens (`navItems.ts`) |
| `RailRow` | Desktop — trilho lateral |
| `MensagensPanes` | Lista + thread em duas colunas (desktop) |

### Navegação principal

Ordem da roda: **Início** → **Trocas** → **Feira** → **Avisos** → **Perfil**.  
Mensagens acessadas pelo perfil ou contexto de interesse (não é item da bottom nav).

---

## 10. Componentes de feature (padrões visuais)

### Cards de feed

Padrão compartilhado (Trocas, Feira, Mural):

```
rounded-lg border border-palha bg-creme-dark p-3|p-4
```

- **ServiceCard** — avatar, badge Oferece/Busca, categoria, `InterestButton`
- **NoticeCard** — badges tipo + `CommunityTag` + autor
- **FeedCard** — dashboard unificado

### Território

| Componente | Uso |
|------------|-----|
| `TerritoryToggle` | Pílula Minha comunidade / Outros territórios |
| `CommunityTag` | `bg-terra-light text-terra` — origem da publicação |
| `ScopeSelector` | Alcance ao publicar (own / selected / all) |

### Chat

- Bolha enviada: `bg-terra text-creme`
- Bolha recebida: `border-palha bg-creme-dark`
- Pendente: banner + `InterestReplyBar` (Aceitar / Recusar)
- Header: `ChatHeader` + `RatingSheet` após troca aceita

---

## 11. Padrões de layout

- Largura de referência: ~390px (mobile); desktop expande com trilho
- Grid de atalhos no dashboard: `grid-cols-2 gap-2`
- Feeds: coluna única `flex flex-col gap-3`
- Safe areas: `env(safe-area-inset-*)` no chat e bottom nav
- Scroll horizontal de chips: classe `.no-scrollbar`

---

## 12. Acessibilidade

- Contraste AA nos pares principais (tinta sobre creme, creme sobre terra)
- Alvo mínimo ~44px em botões (`min-h-[44px]` no `Button` md)
- `:focus-visible` global — outline `2px solid terra`
- `prefers-reduced-motion` — animações reduzidas em `globals.css`
- Labels associados em inputs; `aria-pressed` em Chip/Toggle

---

## 13. Implementação para devs

### Tailwind v4

Tokens em `@theme { }` geram utilitários automaticamente. Não duplique `:root` manual — edite `globals.css`.

### Classes mais usadas

```
bg-creme bg-creme-dark bg-terra bg-terra-light
text-tinta text-tinta-mid text-tinta-light text-creme
border-palha border-ouro
font-display font-strong font-body
rounded-md rounded-lg rounded-full
```

### Utilitários globais

- `.tk-spinner` — loading em botões
- `.tk-rotate-slow` — decoração hero (anel)
- `.no-scrollbar` — trilhas horizontais

### O que não fazer

- Branco `#fff` ou preto `#000` como base
- Box-shadow decorativa
- Tabler / emoji como ícone de UI
- Gradientes genéricos estilo SaaS
- Border-radius > 18px em cards
- Azul/roxo fora da paleta

---

## 14. Documentação relacionada

- Layout de telas: [layout-web.md](layout-web.md)
- Jornada de Trocas: [fluxo-trocas.md](fluxo-trocas.md)
- Estado do app: [Estado-do-Projeto.md](Estado-do-Projeto.md)

---

*Design System Tekoa v1.0 — sincronizado com o código em produção no repo.*
