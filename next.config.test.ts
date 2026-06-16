import { describe, it, expect } from 'vitest';
import nextConfig from './next.config';

describe('Next.js Configuration', () => {
  it('should have images configuration', () => {
    expect(nextConfig.images).toBeDefined();
    expect(nextConfig.images?.remotePatterns).toBeDefined();
    expect(Array.isArray(nextConfig.images?.remotePatterns)).toBe(true);
  });

  it('should allow Supabase images', () => {
    const supabasePattern = nextConfig.images?.remotePatterns?.find(
      (pattern) => pattern.hostname === '*.supabase.co'
    );
    
    expect(supabasePattern).toBeDefined();
    expect(supabasePattern?.protocol).toBe('https');
    expect(supabasePattern?.pathname).toBe('/storage/v1/object/public/**');
  });

  it('should have server actions configuration', () => {
    expect(nextConfig.experimental?.serverActions).toBeDefined();
    expect(nextConfig.experimental?.serverActions?.bodySizeLimit).toBe('5mb');
  });

  it('should have react strict mode enabled', () => {
    expect(nextConfig.reactStrictMode).toBe(true);
  });
});
