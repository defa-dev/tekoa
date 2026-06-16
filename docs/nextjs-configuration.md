# Next.js Project Configuration

This document describes the Next.js configuration setup for the Tekoa project.

## Files

### next.config.ts

Configuration for Next.js build and runtime behavior.

**Key configurations:**

- **Images**: Configured to allow images from Supabase Storage
  - Pattern: `https://*.supabase.co/storage/v1/object/public/**`
  
- **Server Actions**: 
  - Body size limit increased to 5MB for file uploads
  
- **React Strict Mode**: Enabled for better development experience

### tsconfig.json

TypeScript compiler configuration.

**Key configurations:**

- **Strict Mode**: Enabled for type safety
- **Target**: ES2017 for broad compatibility
- **Module**: ESNext for modern JavaScript features
- **Path Aliases**: Configured for cleaner imports
  - `@/*` - Root directory
  - `@/components/*` - Components directory
  - `@/lib/*` - Libraries and utilities
  - `@/data/*` - Data services layer
  - `@/types/*` - TypeScript type definitions
  - `@/utils/*` - Utility functions
  - `@/app/*` - App router pages

**Usage example:**
```typescript
// Instead of:
import { Button } from '../../components/ui/Button';

// You can use:
import { Button } from '@/components/ui/Button';
```

### eslint.config.mjs

ESLint configuration for code quality and consistency.

**Key rules:**

- **TypeScript**:
  - No unused variables (with `_` prefix exception)
  - Warn on explicit `any` types
  
- **React**:
  - Enforce hooks rules
  - Warn on missing dependencies in hooks
  
- **General**:
  - Warn on console.log (allow console.warn and console.error)
  - Enforce const over let when possible

## Testing

All configuration files have corresponding unit tests:

- `next.config.test.ts` - Tests Next.js configuration
- `tsconfig.test.ts` - Tests TypeScript configuration
- `eslint.config.test.ts` - Tests ESLint configuration

Run tests with:
```bash
npm test
```

## Image Optimization

The project is configured to use Next.js Image Optimization with Supabase Storage:

```tsx
import Image from 'next/image';

<Image
  src="https://your-project.supabase.co/storage/v1/object/public/avatars/user.jpg"
  alt="User avatar"
  width={100}
  height={100}
/>
```

## Server Actions

Server Actions are configured with a 5MB body size limit to support file uploads:

```typescript
'use server'

export async function uploadFile(formData: FormData) {
  const file = formData.get('file') as File;
  // File can be up to 5MB
}
```
