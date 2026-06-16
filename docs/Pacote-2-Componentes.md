# 📦 Pacote 2: Componentes e Design System

## Visão Geral
Este pacote cria toda a base visual do projeto: design tokens, componentes reutilizáveis, sistema de layout e navegação. Foco em mobile-first, acessibilidade e consistência visual.

---

## 🎯 Tarefas Detalhadas

### **C.1 - Definição da Paleta de Cores/Tipografia**

#### **C.1.1 - Design Tokens**
**Arquivos a criar:**
- `styles/tokens.css` - CSS Variables globais
- `lib/design/tokens.ts` - Export de tokens para JS/TS
- `tailwind.config.ts` - Configuração do Tailwind

**Conteúdo:**
```css
:root {
  /* Colors - Vibrantes e afetivas */
  --color-primary: #FF6B6B;
  --color-secondary: #4ECDC4;
  --color-accent: #FFE66D;
  --color-success: #95E1D3;
  --color-warning: #F9A826;
  --color-error: #FF6B6B;
  
  /* Neutrals */
  --color-background: #FFFFFF;
  --color-surface: #F8F9FA;
  --color-text-primary: #2D3436;
  --color-text-secondary: #636E72;
  --color-border: #DFE6E9;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  /* Typography */
  --font-family-base: 'Inter', sans-serif;
  --font-family-heading: 'Poppins', sans-serif;
  
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 2rem;
  
  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

**Propósito:**
- Centralizar todas as decisões de design
- Facilitar mudanças globais de tema
- Garantir consistência visual

**Conexões:**
- → C.1.2 (Usado pelas fontes)
- → C.2 (Usado por todos os componentes)

---

#### **C.1.2 - Fontes e Assets**
**Arquivos a criar:**
- `app/layout.tsx` - Configurar fontes do Google Fonts
- `public/fonts/` - (opcional) Fontes locais

**Fontes sugeridas:**
- **Poppins** - Headings (moderna, amigável)
- **Inter** - Body text (legível, limpa)

**Propósito:**
- Carregar fontes otimizadas
- Configurar fallbacks

**Conexões:**
- ← C.1.1 (Usa tokens de tipografia)
- → Todos os componentes

---

#### **C.1.3 - Tema e Dark Mode (Opcional)**
**Arquivos a criar:**
- `lib/hooks/useTheme.ts` - Hook para alternar tema
- `components/ui/ThemeToggle.tsx` - Botão de tema
- `styles/themes.css` - Variações de tema

**Propósito:**
- Suporte a dark mode (futuro)
- Preferências do usuário

**Conexões:**
- ← C.1.1 (Extends tokens)

---

### **C.2 - Criação de Componentes Base (Design System)**

#### **C.2.1 - Button Component**
**Arquivos a criar:**
- `components/ui/Button/Button.tsx`
- `components/ui/Button/Button.types.ts`
- `components/ui/Button/Button.stories.tsx` (opcional - Storybook)

**Variants:**
- `primary` - Ações principais
- `secondary` - Ações secundárias
- `outline` - Ações terciárias
- `ghost` - Ações sutis
- `danger` - Ações destrutivas

**Sizes:**
- `sm`, `md`, `lg`

**Props:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
  disabled?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children: ReactNode
  onClick?: () => void
}
```

**Propósito:**
- Botão consistente em todo o app
- Estados visuais claros (hover, active, disabled)

**Conexões:**
- → Todos os pacotes (usado em forms, cards, etc)

---

#### **C.2.2 - Input Component**
**Arquivos a criar:**
- `components/ui/Input/Input.tsx`
- `components/ui/Input/Input.types.ts`

**Types:**
- `text`, `email`, `password`, `number`, `tel`, `url`

**Props:**
```typescript
interface InputProps {
  label?: string
  placeholder?: string
  type?: string
  error?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  disabled?: boolean
  required?: boolean
  value?: string
  onChange?: (value: string) => void
}
```

**Propósito:**
- Input padronizado com validação visual
- Estados de erro e sucesso

**Conexões:**
- → C.3 (Usado em forms de login/cadastro)
- → Pacote 3 e 4 (Forms de criação)

---

#### **C.2.3 - Textarea Component**
**Arquivos a criar:**
- `components/ui/Textarea/Textarea.tsx`

**Props:**
```typescript
interface TextareaProps {
  label?: string
  placeholder?: string
  error?: string
  helperText?: string
  rows?: number
  maxLength?: number
  disabled?: boolean
  required?: boolean
  value?: string
  onChange?: (value: string) => void
}
```

**Propósito:**
- Campo de texto longo (descrições, bio)

**Conexões:**
- → Pacote 3 (Descrição de serviços)
- → Pacote 4 (Descrição de produtos e posts)

---

#### **C.2.4 - Card Component**
**Arquivos a criar:**
- `components/ui/Card/Card.tsx`
- `components/ui/Card/ServiceCard.tsx` - Card de serviço
- `components/ui/Card/ProductCard.tsx` - Card de produto
- `components/ui/Card/PostCard.tsx` - Card de post

**Base Card Props:**
```typescript
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'sm' | 'md' | 'lg'
  clickable?: boolean
  onClick?: () => void
  children: ReactNode
}
```

**ServiceCard Props:**
```typescript
interface ServiceCardProps {
  service: Service
  onMatch?: () => void
  onView?: () => void
}
```

**Propósito:**
- Container visual consistente
- Cards especializados para cada entidade

**Conexões:**
- → Pacote 3 (T.2) - Listagem de matches
- → Pacote 4 (F.2) - Listagem de produtos
- → Pacote 4 (F.4) - Feed do mural

---

#### **C.2.5 - Select Component**
**Arquivos a criar:**
- `components/ui/Select/Select.tsx`

**Props:**
```typescript
interface SelectProps {
  label?: string
  placeholder?: string
  options: Array<{ value: string; label: string }>
  error?: string
  disabled?: boolean
  required?: boolean
  value?: string
  onChange?: (value: string) => void
}
```

**Propósito:**
- Dropdown para seleção
- Usado em filtros e categorias

**Conexões:**
- → Pacote 3 (Filtros de serviços)
- → Pacote 4 (Filtros de produtos)

---

#### **C.2.6 - Avatar Component**
**Arquivos a criar:**
- `components/ui/Avatar/Avatar.tsx`

**Props:**
```typescript
interface AvatarProps {
  src?: string | null
  alt: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string // Iniciais
}
```

**Propósito:**
- Exibir foto de perfil
- Fallback com iniciais

**Conexões:**
- → C.2.10 (Usado no Header)
- → Pacote 3 e 4 (Cards com informação do usuário)

---

#### **C.2.7 - Badge Component**
**Arquivos a criar:**
- `components/ui/Badge/Badge.tsx`

**Props:**
```typescript
interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md'
  children: ReactNode
}
```

**Propósito:**
- Labels e tags (status, categorias)

**Conexões:**
- → Pacote 3 (Status de serviços)
- → Pacote 4 (Status de produtos)

---

#### **C.2.8 - Modal Component**
**Arquivos a criar:**
- `components/ui/Modal/Modal.tsx`
- `lib/hooks/useModal.ts`

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'full'
  children: ReactNode
}
```

**Propósito:**
- Diálogos e overlays
- Confirmações e forms

**Conexões:**
- → Todos os pacotes (Confirmações, detalhes)

---

#### **C.2.9 - Toast/Notification Component**
**Arquivos a criar:**
- `components/ui/Toast/Toast.tsx`
- `components/ui/Toast/ToastContainer.tsx`
- `lib/hooks/useToast.ts`

**Props:**
```typescript
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}
```

**Propósito:**
- Feedback visual de ações
- Notificações temporárias

**Conexões:**
- → Todos os pacotes (Feedback de operações)

---

#### **C.2.10 - Header/Navbar Component**
**Arquivos a criar:**
- `components/layout/Header/Header.tsx`
- `components/layout/Header/MobileMenu.tsx`

**Features:**
- Logo/Brand
- Avatar do usuário
- Menu mobile (hamburger)
- Notificações (badge de contador)

**Propósito:**
- Navegação principal
- Acesso rápido ao perfil

**Conexões:**
- ← C.2.6 (Usa Avatar)
- → C.2.11 (Trabalha junto com BottomNav)

---

#### **C.2.11 - Layout Components**
**Arquivos a criar:**
- `components/layout/Layout.tsx` - Layout principal
- `components/layout/Container.tsx` - Container responsivo
- `components/layout/Section.tsx` - Seções de página

**Propósito:**
- Estrutura consistente de páginas
- Responsividade mobile-first

**Conexões:**
- ← C.2.10 (Inclui Header)
- ← C.4 (Inclui BottomNav)
- → Todas as páginas

---

### **C.3 - Desenvolvimento da Tela de Cadastro/Login**

#### **C.3.1 - Login Form**
**Arquivos a criar:**
- `app/(auth)/login/page.tsx`
- `components/features/auth/LoginForm.tsx`

**Features:**
- Email input
- Password input (com toggle show/hide)
- "Esqueci minha senha" link
- Submit button com loading state
- Link para cadastro

**Validações:**
- Email válido
- Senha obrigatória

**Propósito:**
- Autenticar usuários existentes

**Conexões:**
- ← C.2.1, C.2.2 (Usa Button e Input)
- ← Pacote 1 (I.2.4) - Chama signIn()

---

#### **C.3.2 - Signup Form**
**Arquivos a criar:**
- `app/(auth)/signup/page.tsx`
- `components/features/auth/SignupForm.tsx`

**Features:**
- Nome completo
- Email input
- Password input (com requisitos visuais)
- Confirm password
- Termos de uso checkbox
- Submit button com loading state
- Link para login

**Validações:**
- Email válido e único
- Senha forte (min 8 chars, letra maiúscula, número)
- Passwords coincidem
- Termos aceitos

**Propósito:**
- Registrar novos usuários

**Conexões:**
- ← C.2.1, C.2.2 (Usa Button e Input)
- ← Pacote 1 (I.2.4) - Chama signUp()

---

#### **C.3.3 - Reset Password Flow**
**Arquivos a criar:**
- `app/(auth)/reset-password/page.tsx`
- `components/features/auth/ResetPasswordForm.tsx`
- `app/(auth)/update-password/page.tsx`
- `components/features/auth/UpdatePasswordForm.tsx`

**Propósito:**
- Recuperação de senha

**Conexões:**
- ← Pacote 1 (I.2.4) - Chama resetPassword(), updatePassword()

---

#### **C.3.4 - Auth Layout**
**Arquivos a criar:**
- `app/(auth)/layout.tsx`

**Features:**
- Design clean e centrado
- Logo
- Background decorativo
- Responsive

**Propósito:**
- Layout consistente para telas de auth

---

### **C.4 - Implementação da Navegação Mobile**

#### **C.4.1 - Bottom Navigation**
**Arquivos a criar:**
- `components/layout/BottomNav/BottomNav.tsx`
- `components/layout/BottomNav/NavItem.tsx`

**Tabs:**
1. **Home/Dashboard** 🏠 - Feed principal
2. **Trocas** 🤝 - Matching de serviços
3. **Feira** 🛒 - Feira do Rolo
4. **Mural** 📋 - Mural de avisos
5. **Perfil** 👤 - Perfil do usuário

**Features:**
- Active state visual claro
- Ícones + labels
- Badge de notificações
- Fixed bottom position
- Mobile-first (esconde em desktop)

**Propósito:**
- Navegação principal mobile
- Acesso rápido às principais features

**Conexões:**
- → Todas as páginas principais do app

---

#### **C.4.2 - Tab Bar Icons**
**Arquivos a criar:**
- `components/icons/` - SVG icons customizados
  - `HomeIcon.tsx`
  - `SwapIcon.tsx`
  - `ShopIcon.tsx`
  - `BoardIcon.tsx`
  - `ProfileIcon.tsx`

**Propósito:**
- Ícones consistentes e otimizados
- Variants filled/outlined

**Conexões:**
- → C.4.1 (Usado no BottomNav)

---

#### **C.4.3 - Page Transitions**
**Arquivos a criar:**
- `components/layout/PageTransition.tsx`
- `lib/animations/transitions.ts`

**Propósito:**
- Transições suaves entre páginas
- Melhor UX

**Conexões:**
- → C.2.11 (Usado no Layout)

---

## 📊 Checklist de Conclusão

### C.1 - Design Tokens
- [ ] C.1.1 - Design tokens definidos
- [ ] C.1.2 - Fontes configuradas
- [ ] C.1.3 - Tema configurado (opcional)

### C.2 - Componentes Base
- [ ] C.2.1 - Button
- [ ] C.2.2 - Input
- [ ] C.2.3 - Textarea
- [ ] C.2.4 - Card (+ variants)
- [ ] C.2.5 - Select
- [ ] C.2.6 - Avatar
- [ ] C.2.7 - Badge
- [ ] C.2.8 - Modal
- [ ] C.2.9 - Toast
- [ ] C.2.10 - Header
- [ ] C.2.11 - Layout

### C.3 - Auth Screens
- [ ] C.3.1 - Login form
- [ ] C.3.2 - Signup form
- [ ] C.3.3 - Reset password
- [ ] C.3.4 - Auth layout

### C.4 - Mobile Navigation
- [ ] C.4.1 - Bottom navigation
- [ ] C.4.2 - Icons
- [ ] C.4.3 - Transitions

---

## 🔗 Dependências com Outros Pacotes

### Pacote 1 (Infraestrutura)
- Recebe: Types, Auth actions, Data services
- Fornece: Componentes prontos para usar

### Pacote 3 (Trocas/Serviços)
- Fornece: Todos os componentes UI
- Recebe: Páginas integradas

### Pacote 4 (Feira e Mural)
- Fornece: Todos os componentes UI
- Recebe: Páginas integradas

---

## 🎨 Guia de UX/UI

### Princípios
1. **Mobile-First** - Design pensado para mobile, adapta para desktop
2. **Acessibilidade** - WCAG 2.1 AA compliance
3. **Feedback Visual** - Toda ação tem feedback imediato
4. **Consistência** - Mesmos padrões em todo o app
5. **Performance** - Componentes otimizados e leves

### Estados Visuais
- **Default** - Estado normal
- **Hover** - Feedback de interação (desktop)
- **Active** - Clicado/pressionado
- **Focus** - Keyboard navigation
- **Disabled** - Não disponível
- **Loading** - Processando ação
- **Error** - Erro de validação
- **Success** - Ação concluída

---

## 🎯 Próximos Passos

1. **Começar por C.1** - Design tokens é a base de tudo
2. **Criar componentes base (C.2.1 a C.2.5)** - São os mais usados
3. **Implementar Layout (C.2.10, C.2.11)** - Estrutura das páginas
4. **Criar telas de auth (C.3)** - Primeiro ponto de contato
5. **Implementar navegação mobile (C.4)** - Core da experiência mobile
6. **Componentes restantes (C.2.6 a C.2.9)** - Complementam o sistema

### Ordem recomendada:
1. C.1.1, C.1.2 (Tokens e fontes)
2. C.2.1, C.2.2 (Button e Input - mais críticos)
3. C.2.11 (Layout)
4. C.3.1, C.3.2 (Login/Signup)
5. C.4.1, C.4.2 (Bottom Nav)
6. Demais componentes conforme necessidade
