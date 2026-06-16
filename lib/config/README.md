# Environment Configuration (I.5.1)

This module provides type-safe environment variable validation and configuration for the Tekoa project.

## Files Created

- `.env.local.example` - Template with all required environment variables
- `lib/config/env.ts` - Environment configuration module with validation
- `lib/config/env.test.ts` - Comprehensive unit tests (17 test cases)

## Features

### ✅ Runtime Validation
- Validates all required environment variables at application startup
- Provides clear error messages with guidance when variables are missing
- Validates Supabase URL and key formats

### ✅ Type Safety
- Full TypeScript type definitions
- Exports `EnvConfig` interface for type-safe access
- Environment-specific boolean flags (`isDevelopment`, `isProduction`, `isTest`)

### ✅ Security
- Clearly separates public and server-only variables
- Service role key validation (server-side only)
- JWT format validation for Supabase keys

## Usage

### Import the configuration

```typescript
import { env } from '@/lib/config/env';

// Access Supabase configuration
const supabaseUrl = env.supabase.url;
const anonKey = env.supabase.anonKey;

// Check environment
if (env.isDevelopment) {
  console.log('Running in development mode');
}
```

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key (safe for browser)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-only, keep secret)

## Validation Rules

### URL Validation
- Must be a valid URL
- Must contain "supabase" in the hostname
- Example: `https://your-project.supabase.co`

### Key Validation
- Must be a valid JWT format (three parts separated by dots)
- Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.secret`

### Error Handling
- Throws errors at module load time if validation fails
- Provides detailed error messages with guidance
- References `.env.local.example` for help

## Test Coverage

The test suite includes 17 comprehensive tests covering:

- ✅ Valid configuration loading
- ✅ Environment flag detection (development, production, test)
- ✅ Missing environment variable detection
- ✅ Empty/whitespace variable detection
- ✅ Invalid URL format validation
- ✅ Non-Supabase URL rejection
- ✅ Invalid JWT format detection
- ✅ Default NODE_ENV behavior
- ✅ Type safety verification

Run tests with:
```bash
npm test -- lib/config/env.test.ts
```

## Integration

This module is used by:
- Supabase clients (`lib/supabase/client.ts`, `lib/supabase/server.ts`)
- All data services that interact with Supabase
- Authentication flows

## Next Steps

Ver também: `docs/nextjs-configuration.md`

## Status

✅ **Completed** - All tests passing (17/17)
