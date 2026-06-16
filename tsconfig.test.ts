import { describe, it, expect } from 'vitest';
import tsConfig from './tsconfig.json';

describe('TypeScript Configuration', () => {
  it('should have compiler options', () => {
    expect(tsConfig.compilerOptions).toBeDefined();
  });

  it('should have strict mode enabled', () => {
    expect(tsConfig.compilerOptions.strict).toBe(true);
  });

  it('should have path aliases configured', () => {
    expect(tsConfig.compilerOptions.paths).toBeDefined();
    expect(tsConfig.compilerOptions.paths['@/*']).toBeDefined();
    expect(tsConfig.compilerOptions.paths['@/components/*']).toBeDefined();
    expect(tsConfig.compilerOptions.paths['@/lib/*']).toBeDefined();
    expect(tsConfig.compilerOptions.paths['@/data/*']).toBeDefined();
    expect(tsConfig.compilerOptions.paths['@/types/*']).toBeDefined();
    expect(tsConfig.compilerOptions.paths['@/utils/*']).toBeDefined();
    expect(tsConfig.compilerOptions.paths['@/app/*']).toBeDefined();
  });

  it('should target ES2017', () => {
    expect(tsConfig.compilerOptions.target).toBe('ES2017');
  });

  it('should use esnext module', () => {
    expect(tsConfig.compilerOptions.module).toBe('esnext');
  });

  it('should have jsx react-jsx', () => {
    expect(tsConfig.compilerOptions.jsx).toBe('react-jsx');
  });

  it('should include necessary file patterns', () => {
    expect(tsConfig.include).toContain('**/*.ts');
    expect(tsConfig.include).toContain('**/*.tsx');
    expect(tsConfig.include).toContain('**/*.mts');
  });

  it('should exclude node_modules', () => {
    expect(tsConfig.exclude).toContain('node_modules');
  });
});
