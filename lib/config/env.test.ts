import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Environment Configuration', () => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    // Reset modules to allow re-importing with new env vars
    vi.resetModules();
    // Create a fresh copy of process.env
    process.env = { ...originalEnv };
  });
  
  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });
  
  const validEnvVars = {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test-project.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.test',
    SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.secret',
  };
  
  describe('Valid Configuration', () => {
    it('should load configuration with valid environment variables', async () => {
      process.env = { ...process.env, ...validEnvVars };
      
      const { env } = await import('./env');
      
      expect(env.supabase.url).toBe(validEnvVars.NEXT_PUBLIC_SUPABASE_URL);
      expect(env.supabase.anonKey).toBe(validEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      expect(env.supabase.serviceRoleKey).toBe(validEnvVars.SUPABASE_SERVICE_ROLE_KEY);
    });
    
    it('should set development environment flags correctly', async () => {
      process.env = { ...process.env, ...validEnvVars, NODE_ENV: 'development' };
      
      const { env } = await import('./env');
      
      expect(env.nodeEnv).toBe('development');
      expect(env.isDevelopment).toBe(true);
      expect(env.isProduction).toBe(false);
      expect(env.isTest).toBe(false);
    });
    
    it('should set production environment flags correctly', async () => {
      process.env = { ...process.env, ...validEnvVars, NODE_ENV: 'production' };
      
      const { env } = await import('./env');
      
      expect(env.nodeEnv).toBe('production');
      expect(env.isDevelopment).toBe(false);
      expect(env.isProduction).toBe(true);
      expect(env.isTest).toBe(false);
    });
    
    it('should set test environment flags correctly', async () => {
      process.env = { ...process.env, ...validEnvVars, NODE_ENV: 'test' };
      
      const { env } = await import('./env');
      
      expect(env.nodeEnv).toBe('test');
      expect(env.isDevelopment).toBe(false);
      expect(env.isProduction).toBe(false);
      expect(env.isTest).toBe(true);
    });
  });
  
  describe('Missing Environment Variables', () => {
    it('should throw error when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
      process.env = {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: validEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: validEnvVars.SUPABASE_SERVICE_ROLE_KEY,
      };
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      await expect(import('./env')).rejects.toThrow('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL');
    });
    
    it('should throw error when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', async () => {
      process.env = {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: validEnvVars.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: validEnvVars.SUPABASE_SERVICE_ROLE_KEY,
      };
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      await expect(import('./env')).rejects.toThrow('Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
    });
    
    it('should throw error when SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
      process.env = {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: validEnvVars.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: validEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      };
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      await expect(import('./env')).rejects.toThrow('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY');
    });
    
    it('should throw error when environment variable is empty string', async () => {
      process.env = {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: validEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: validEnvVars.SUPABASE_SERVICE_ROLE_KEY,
      };
      
      await expect(import('./env')).rejects.toThrow('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL');
    });
    
    it('should throw error when environment variable is whitespace only', async () => {
      process.env = {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: '   ',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: validEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: validEnvVars.SUPABASE_SERVICE_ROLE_KEY,
      };
      
      await expect(import('./env')).rejects.toThrow('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL');
    });
  });
  
  describe('Invalid Environment Variable Formats', () => {
    it('should throw error for invalid Supabase URL format', async () => {
      process.env = {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: 'not-a-valid-url',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: validEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: validEnvVars.SUPABASE_SERVICE_ROLE_KEY,
      };
      
      await expect(import('./env')).rejects.toThrow('Invalid NEXT_PUBLIC_SUPABASE_URL format');
    });
    
    it('should throw error for non-Supabase URL', async () => {
      process.env = {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.com',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: validEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: validEnvVars.SUPABASE_SERVICE_ROLE_KEY,
      };
      
      await expect(import('./env')).rejects.toThrow('URL must be a valid Supabase URL');
    });
    
    it('should throw error for invalid anon key format', async () => {
      process.env = {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: validEnvVars.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'invalid-key-format',
        SUPABASE_SERVICE_ROLE_KEY: validEnvVars.SUPABASE_SERVICE_ROLE_KEY,
      };
      
      await expect(import('./env')).rejects.toThrow('Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY format');
    });
    
    it('should throw error for invalid service role key format', async () => {
      process.env = {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: validEnvVars.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: validEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: 'invalid-key-format',
      };
      
      await expect(import('./env')).rejects.toThrow('Invalid SUPABASE_SERVICE_ROLE_KEY format');
    });
    
    it('should throw error for JWT with only two parts', async () => {
      process.env = {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: validEnvVars.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9',
        SUPABASE_SERVICE_ROLE_KEY: validEnvVars.SUPABASE_SERVICE_ROLE_KEY,
      };
      
      await expect(import('./env')).rejects.toThrow('Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY format');
    });
    
    it('should throw error for JWT with four parts', async () => {
      process.env = {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: validEnvVars.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'part1.part2.part3.part4',
        SUPABASE_SERVICE_ROLE_KEY: validEnvVars.SUPABASE_SERVICE_ROLE_KEY,
      };
      
      await expect(import('./env')).rejects.toThrow('Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY format');
    });
  });
  
  describe('Default NODE_ENV', () => {
    it('should default to development when NODE_ENV is not set', async () => {
      process.env = { ...process.env, ...validEnvVars };
      delete (process.env as Record<string, string | undefined>).NODE_ENV;
      
      const { env } = await import('./env');
      
      expect(env.nodeEnv).toBe('development');
      expect(env.isDevelopment).toBe(true);
    });
  });
  
  describe('Type Safety', () => {
    it('should export EnvConfig type', async () => {
      process.env = { ...process.env, ...validEnvVars };
      
      const module = await import('./env');
      
      expect(module.env).toBeDefined();
      expect(module.env.supabase).toBeDefined();
      expect(module.env.supabase.url).toBeTypeOf('string');
      expect(module.env.supabase.anonKey).toBeTypeOf('string');
      expect(module.env.supabase.serviceRoleKey).toBeTypeOf('string');
      expect(module.env.nodeEnv).toBeTypeOf('string');
      expect(module.env.isDevelopment).toBeTypeOf('boolean');
      expect(module.env.isProduction).toBeTypeOf('boolean');
      expect(module.env.isTest).toBeTypeOf('boolean');
    });
  });
});
