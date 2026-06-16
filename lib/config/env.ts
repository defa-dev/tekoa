/**
 * Environment Variables Configuration and Validation
 * 
 * This module validates and exports all required environment variables
 * with proper type safety and runtime checks.
 */

interface EnvConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
}

/**
 * Validates that a required environment variable exists
 * @param key - The environment variable key
 * @param value - The environment variable value
 * @throws Error if the value is missing
 */
function validateEnvVar(key: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please check your .env.local file and ensure ${key} is set.\n` +
      `See .env.local.example for reference.`
    );
  }
  return value;
}

/**
 * Validates Supabase URL format
 * @param url - The Supabase URL to validate
 * @throws Error if URL format is invalid
 */
function validateSupabaseUrl(url: string): void {
  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname.includes('supabase')) {
      throw new Error(
        `Invalid NEXT_PUBLIC_SUPABASE_URL format: ${url}\n` +
        `Expected format: https://your-project-id.supabase.co\n` +
        `URL must be a valid Supabase URL`
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('supabase')) {
      throw error;
    }
    throw new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_URL format: ${url}\n` +
      `Expected format: https://your-project-id.supabase.co`
    );
  }
}

/**
 * Validates Supabase key format (basic check for JWT structure)
 * @param key - The key to validate
 * @param keyName - The name of the key for error messages
 * @throws Error if key format appears invalid
 */
function validateSupabaseKey(key: string, keyName: string): void {
  // Basic JWT format check (three parts separated by dots)
  const parts = key.split('.');
  if (parts.length !== 3) {
    throw new Error(
      `Invalid ${keyName} format. Expected a valid JWT token with three parts.`
    );
  }
}

/**
 * Get and validate all environment variables
 * This function is called once when the module is imported
 */
function getEnvConfig(): EnvConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  // Public variables (available in browser)
  const supabaseUrl = validateEnvVar(
    'NEXT_PUBLIC_SUPABASE_URL',
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  
  const supabaseAnonKey = validateEnvVar(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  // Server-only variable (never exposed to browser)
  const supabaseServiceRoleKey = validateEnvVar(
    'SUPABASE_SERVICE_ROLE_KEY',
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  // Validate formats
  validateSupabaseUrl(supabaseUrl);
  validateSupabaseKey(supabaseAnonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
  validateSupabaseKey(supabaseServiceRoleKey, 'SUPABASE_SERVICE_ROLE_KEY');
  
  return {
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      serviceRoleKey: supabaseServiceRoleKey,
    },
    nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    isTest: nodeEnv === 'test',
  };
}

// Validate and export configuration
// This will throw an error at module load time if env vars are missing
let env: EnvConfig;

try {
  env = getEnvConfig();
} catch (error) {
  if (process.env.NODE_ENV !== 'test') {
    console.error('❌ Environment Configuration Error:');
    console.error((error as Error).message);
    console.error('\n📝 Please copy .env.local.example to .env.local and fill in the values.');
  }
  throw error;
}

export { env };
export type { EnvConfig };
