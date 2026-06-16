# Design System — Tekoa
**App Comunitário de Trocas e Economia Solidária**
Versão 0.1 — Para handoff ao dev FE

---

## 1. Princípios de Identidade

O Tekoa vive na tensão entre **rústico e eficiente**.
Não é um app corporativo frio. Também não é artesanal ao ponto de parecer amador.
É uma **feira coberta bem organizada** — estrutura funcional, com alma de comunidade.

Referências visuais absorvidas:
- Ancestralidades (Itaú Cultural) — preto profundo, ouro, editorial, espaço generoso
- Tô no Mapa (IPAM) — UI funcional, botões grandes, ícones acessíveis
- Artesol — grids modulares, fundo neutro que dá protagonismo ao conteúdo
- Imaginário de quilombo, aldeia, feira de bairro — pigmentos, texturas, oralidade

---

## 2. Paleta de Cores (Design Tokens)

### Cores Primárias

| Token                  | Hex       | Uso principal                              |
|------------------------|-----------|--------------------------------------------|
| `--color-terra`        | `#B85C2A` | CTA primário, header, destaques            |
| `--color-terra-dark`   | `#7A3A18` | Hover de botões, estados ativos            |
| `--color-terra-light`  | `#F2E0D0` | Backgrounds de cards destacados, fills leves |

### Cores de Acento

| Token                  | Hex       | Uso principal                              |
|------------------------|-----------|--------------------------------------------|
| `--color-ouro`         | `#C9A97A` | Bordas, divisores, ícones secundários      |
| `--color-ouro-light`   | `#F0E4CC` | Backgrounds sutis, estados hover leve      |
| `--color-musgo`        | `#4A6741` | Badge de avisos, status positivo           |
| `--color-musgo-light`  | `#D6E4D2` | Background de badge musgo                  |

### Cores de Base (Fundos e Texto)

| Token                    | Hex       | Uso principal                              |
|--------------------------|-----------|--------------------------------------------|
| `--color-tinta`          | `#1C1510` | Texto primário (substitui preto puro)      |
| `--color-tinta-mid`      | `#4A3D33` | Texto secundário, labels, metadados        |
| `--color-tinta-light`    | `#8C7B6E` | Placeholders, hints, texto desabilitado    |
| `--color-creme`          | `#F5EFE6` | Background primário (substitui #FFFFFF)    |
| `--color-creme-dark`     | `#E8DDCC` | Background de inputs, cards secundários    |
| `--color-palha`          | `#D4C4AE` | Bordas padrão, separadores                 |

### Cores Semânticas

| Token                    | Hex       | Uso                                        |
|--------------------------|-----------|--------------------------------------------|
| `--color-sucesso`        | `#4A6741` | Confirmações, trocas realizadas            |
| `--color-sucesso-light`  | `#D6E4D2` | Background de estado de sucesso            |
| `--color-alerta`         | `#B85C2A` | Avisos importantes (reutiliza terra)       |
| `--color-erro`           | `#8B2A1A` | Erros de formulário, falhas                |
| `--color-erro-light`     | `#F2D5CF` | Background de estado de erro               |

### Modo Escuro (referência futura)
O app começa em modo claro. Para dark mode futuro:
- `--color-creme` → `#1C1510` (inverte base)
- `--color-tinta` → `#F5EFE6` (inverte texto)
- `--color-terra` permanece como acento quente

---

## 3. Tipografia

### Famílias

| Role       | Família           | Import                                                                 |
|------------|-------------------|------------------------------------------------------------------------|
| Display    | **Syne**          | `https://fonts.googleapis.com/css2?family=Syne:wght@700;800`         |
| Body       | **IBM Plex Sans** | `https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500`|

**Por quê?**
- Syne: grossa, editorial, com personalidade. Evoca manifestos, cartazes de feira, força da oralidade.
- IBM Plex Sans: legível, técnica, acessível. Garante eficiência no corpo do texto.

### Escala de Tipos

| Token              | Família    | Tamanho | Peso | Uso                                      |
|--------------------|------------|---------|------|------------------------------------------|
| `--text-display`   | Syne       | 28px    | 800  | Nome do app, hero de tela                |
| `--text-h1`        | Syne       | 22px    | 700  | Títulos de seção principais              |
| `--text-h2`        | Syne       | 17px    | 700  | Subtítulos, cabeçalhos de card           |
| `--text-h3`        | Syne       | 14px    | 700  | Labels de grupo, nomes em feed           |
| `--text-body`      | IBM Plex   | 14px    | 400  | Texto corrido, descrições                |
| `--text-body-md`   | IBM Plex   | 14px    | 500  | Texto de ênfase, labels de campo         |
| `--text-small`     | IBM Plex   | 12px    | 400  | Metadados, timestamps, dicas             |
| `--text-micro`     | IBM Plex   | 10px    | 500  | Badges, labels de categoria uppercase    |

### Regras Tipográficas
- Títulos: sempre sentence case (nunca ALL CAPS, exceto em labels micro com letter-spacing)
- Line-height: `1.2` para display/h1, `1.4` para h2/h3, `1.6` para body
- Letter-spacing: `0.06em` apenas em labels micro uppercase
- Nunca usar peso 600 ou 700 em IBM Plex Sans no corpo — fica pesado demais

---

## 4. Espaçamento (Spacing Scale)

Base: **4px**

| Token          | Valor | Uso típico                           |
|----------------|-------|--------------------------------------|
| `--space-1`    | 4px   | Gap mínimo, ícone-texto              |
| `--space-2`    | 8px   | Gap interno de componente            |
| `--space-3`    | 12px  | Padding interno de card pequeno      |
| `--space-4`    | 16px  | Padding padrão de card / tela        |
| `--space-5`    | 20px  | Margin entre seções                  |
| `--space-6`    | 24px  | Padding de header / seção generosa   |
| `--space-8`    | 32px  | Separação entre blocos maiores       |
| `--space-12`   | 48px  | Margens de tela (top/bottom)         |

---

## 5. Border Radius

| Token              | Valor  | Uso                                      |
|--------------------|--------|------------------------------------------|
| `--radius-sm`      | 4px    | Badges, tags, labels inline              |
| `--radius-md`      | 8px    | Inputs, botões, cards pequenos           |
| `--radius-lg`      | 12px   | Cards maiores, modais, bottom sheets     |
| `--radius-xl`      | 18px   | Containers de seção, frames de tela      |
| `--radius-full`    | 9999px | Chips, avatares circulares               |

**Princípio:** bordas mais contidas que um app tech genérico, mas não completamente retas. O raio médio de 8px traz organicidade sem parecer infantil.

---

## 6. Bordas e Divisores

| Token                  | Valor                              | Uso                        |
|------------------------|------------------------------------|----------------------------|
| `--border-default`     | `1px solid #D4C4AE`                | Bordas padrão de card      |
| `--border-emphasis`    | `1px solid #C9A97A`                | Card selecionado, hover    |
| `--border-active`      | `1.5px solid #B85C2A`              | Item em foco, selecionado  |
| `--border-divider`     | `0.5px solid #D4C4AE`              | Divisores internos         |

Sem box-shadows decorativas. Profundidade é transmitida por cor de fundo, não por sombra.

---

## 7. Iconografia

Biblioteca: **Tabler Icons** (outline), já carregada via CDN.
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
```

### Ícones por módulo

| Módulo           | Ícone Tabler         |
|------------------|----------------------|
| Trocas           | `ti-arrows-exchange` |
| Feira do Rolo    | `ti-shopping-bag`    |
| Avisos           | `ti-speakerphone`    |
| Blog             | `ti-pencil`          |
| Perfil           | `ti-user`            |
| Chat             | `ti-message`         |
| Avaliação        | `ti-star`            |
| Localização      | `ti-map-pin`         |
| Notificação      | `ti-bell`            |
| Configurações    | `ti-settings`        |
| Nova oferta      | `ti-plus`            |
| Confirmar troca  | `ti-check`           |
| Ferramenta/reparo| `ti-tool`            |

### Tamanhos de ícone
| Contexto          | Tamanho |
|-------------------|---------|
| Nav bar           | 20px    |
| Inline (texto)    | 16px    |
| Card (ícone solo) | 20px    |
| Feature icon      | 28px    |

---

## 8. Padrão de Mosaico (Signature Element)

O elemento de assinatura da identidade. Aparece em backgrounds de header e splash.
Inspirado em padrões geométricos afro-brasileiros e azulejos.

Implementar em SVG inline ou como background-image CSS:

```svg
<!-- Padrão xadrez orgânico 20x20px, repetível -->
<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <rect x="0"  y="0"  width="20" height="20" fill="currentColor" opacity="0.15"/>
  <rect x="40" y="0"  width="20" height="20" fill="currentColor" opacity="0.15"/>
  <rect x="20" y="20" width="20" height="20" fill="currentColor" opacity="0.15"/>
  <rect x="60" y="20" width="20" height="20" fill="currentColor" opacity="0.15"/>
  <rect x="0"  y="40" width="20" height="20" fill="currentColor" opacity="0.15"/>
  <rect x="40" y="40" width="20" height="20" fill="currentColor" opacity="0.15"/>
  <rect x="20" y="60" width="20" height="20" fill="currentColor" opacity="0.15"/>
  <rect x="60" y="60" width="20" height="20" fill="currentColor" opacity="0.15"/>
</svg>
```

**Como usar:**
- No splash/header: posicionado no canto superior direito, `opacity: 0.12`, cor `#F5EFE6` (creme sobre terra)
- Em divisores de seção: versão horizontal, altura 4px, muito sutil
- Nunca em área de conteúdo principal — é fundo, não foreground

---

## 9. Componentes

### 9.1 Botões

#### Primário (CTA principal)
```
Background: --color-terra
Cor do texto: --color-creme
Border-radius: --radius-md (8px)
Padding: 10px 20px
Font: Syne 700, 13px
Hover: --color-terra-dark
Active: scale(0.98)
Sem sombra
```

#### Secundário / Ghost
```
Background: transparent
Borda: --border-emphasis
Cor do texto: --color-terra
Border-radius: --radius-md
Padding: 10px 20px
Font: Syne 700, 13px
Hover: --color-terra-light como background
```

#### Destrutivo / Cancelar
```
Background: transparent
Cor do texto: --color-tinta-mid
Font: IBM Plex Sans 400, 12px
Sem borda visível
```

#### Estados
- `disabled`: opacity 0.4, cursor not-allowed
- `loading`: substitui label por spinner simples (sem libs externas)

---

### 9.2 Inputs de Formulário

```
Background: --color-creme-dark
Borda: --border-default
Borda em foco: --border-active
Border-radius: --radius-md
Padding: 10px 12px
Font: IBM Plex Sans 400, 14px
Cor: --color-tinta
Placeholder: --color-tinta-light
Label acima: IBM Plex Sans 500, 10px uppercase, letter-spacing 0.07em, --color-tinta-mid
Mensagem de erro: IBM Plex Sans 400, 11px, --color-erro, abaixo do campo
```

---

### 9.3 Cards

#### Card de Feed (serviço / produto / aviso)
```
Background: --color-creme-dark
Borda: --border-default
Border-radius: --radius-lg
Padding: 12px
Display: flex, gap 10px
Ícone: 32x32px, --color-terra-light background, --radius-md
Título: --text-h3
Meta: --text-small, --color-tinta-mid
Badge: canto direito, --radius-sm
```

#### Card de Comunidade (seleção de bairro)
```
Background: --color-creme-dark
Borda: --border-default
Border-radius: --radius-md
Padding: 10px
Estado selecionado: borda --border-active, background --color-terra-light
Avatar: 32x32px, --color-ouro background, --radius-sm
```

---

### 9.4 Badges e Tags

| Tipo       | Background             | Texto              | Border-radius |
|------------|------------------------|--------------------|---------------|
| Novo       | `--color-terra`        | `--color-creme`    | `--radius-sm` |
| Aviso      | `--color-musgo-light`  | `--color-musgo`    | `--radius-sm` |
| Comunidade | `rgba(creme, 0.15)`    | `--color-creme`    | `--radius-sm` |
| Categoria  | `--color-ouro-light`   | `--color-tinta-mid`| `--radius-sm` |

Font: IBM Plex Sans 500, 9-10px, uppercase, letter-spacing 0.06em

---

### 9.5 Header do App (Dashboard)

```
Background: --color-terra
Padding: 16px
Border-radius: 0 0 16px 16px (arredonda só embaixo)
Padrão mosaico: posição absolute, canto superior direito, opacity 0.10
Saudação: IBM Plex Sans 400, 11px, rgba(creme, 0.65)
Nome: Syne 800, 16px, --color-creme
Badge de comunidade: inline, background rgba(creme, 0.15), borda rgba(creme, 0.3)
```

---

### 9.6 Bottom Navigation Bar

```
Background: --color-creme
Borda top: --border-divider
Padding: 8px 0
Ícones: 20px, --color-ouro (inativo), --color-terra (ativo)
Label: IBM Plex Sans 400, 9px, mesmas cores
5 itens: Início / Trocas / Feira / Avisos / Perfil
```

---

### 9.7 Divisor de Seção

```html
<div style="height: 1px; background: var(--color-palha); opacity: 0.6; margin: 16px 0;"></div>
```

Ou versão com label de seção:
```
Label: IBM Plex Sans 500, 10px, uppercase, --color-tinta-mid, opacity 0.7, margin-bottom 8px
```

---

## 10. Padrões de Layout Mobile

- **Largura de tela base:** 390px (iPhone 14)
- **Padding lateral padrão:** 16px (--space-4)
- **Grid padrão:** 2 colunas com `gap: 8px` para ações principais
- **Cards em feed:** 1 coluna, full-width
- **Conteúdo mínimo visível acima da dobra:** saudação + 2 botões de ação + 1 card de feed

### Safe areas (para celulares com notch/ilha dinâmica)
```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```

---

## 11. Acessibilidade

- Contraste mínimo WCAG AA em todos os pares texto/fundo
- Área de toque mínima: **44x44px** (especialmente botões e itens de nav)
- Todo ícone decorativo: `aria-hidden="true"`
- Ícone funcional sem label visível: `aria-label="..."`
- Inputs sempre com `<label>` associado via `for`/`id`
- Foco visível: `outline: 2px solid var(--color-terra)` com `outline-offset: 2px`
- `prefers-reduced-motion`: desabilitar animações de transição de tela

---

## 12. Tokens como CSS Custom Properties

Copiar no `:root` do projeto:

```css
:root {
  /* Cores */
  --color-terra: #B85C2A;
  --color-terra-dark: #7A3A18;
  --color-terra-light: #F2E0D0;
  --color-ouro: #C9A97A;
  --color-ouro-light: #F0E4CC;
  --color-musgo: #4A6741;
  --color-musgo-light: #D6E4D2;
  --color-tinta: #1C1510;
  --color-tinta-mid: #4A3D33;
  --color-tinta-light: #8C7B6E;
  --color-creme: #F5EFE6;
  --color-creme-dark: #E8DDCC;
  --color-palha: #D4C4AE;
  --color-sucesso: #4A6741;
  --color-sucesso-light: #D6E4D2;
  --color-erro: #8B2A1A;
  --color-erro-light: #F2D5CF;

  /* Tipografia */
  --font-display: 'Syne', sans-serif;
  --font-body: 'IBM Plex Sans', sans-serif;

  /* Espaçamento */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 18px;
  --radius-full: 9999px;

  /* Bordas */
  --border-default: 1px solid #D4C4AE;
  --border-emphasis: 1px solid #C9A97A;
  --border-active: 1.5px solid #B85C2A;
  --border-divider: 0.5px solid #D4C4AE;
}
```

---

## 13. Google Fonts Import

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=IBM+Plex+Sans:wght@400;500&display=swap" rel="stylesheet">
```

---

## 14. O Que Não Fazer

- ❌ Branco puro `#FFFFFF` como fundo — usa `--color-creme`
- ❌ Preto puro `#000000` em texto — usa `--color-tinta`
- ❌ Box-shadow decorativa — profundidade vem de cor de fundo
- ❌ Border-radius acima de 18px em cards — fica bolhoso demais
- ❌ Mais de 2 colunas em mobile
- ❌ Gradientes — identidade é plana e pigmentada
- ❌ Emojis como ícones de UI — usar Tabler Icons
- ❌ Peso 600+ em IBM Plex Sans — fica pesado demais
- ❌ Cores fora da paleta definida — especialmente azuis e roxos tech

---

*Design System Tekoa v0.1 — para revisão antes da implementação*
