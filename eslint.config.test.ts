import { describe, it, expect } from 'vitest';
import eslintConfig from './eslint.config.mjs';

describe('ESLint Configuration', () => {
  it('should be an array of configuration objects', () => {
    expect(Array.isArray(eslintConfig)).toBe(true);
  });

  it('should have rules configuration', () => {
    const rulesConfig = eslintConfig.find((config) => config.rules);
    expect(rulesConfig).toBeDefined();
    expect(rulesConfig?.rules).toBeDefined();
  });

  it('should configure TypeScript unused vars rule', () => {
    const rulesConfig = eslintConfig.find((config) => config.rules);
    const unusedVarsRule = rulesConfig?.rules?.['@typescript-eslint/no-unused-vars'];
    
    expect(unusedVarsRule).toBeDefined();
    expect(Array.isArray(unusedVarsRule)).toBe(true);
  });

  it('should configure React hooks rules', () => {
    const rulesConfig = eslintConfig.find((config) => config.rules);
    
    expect(rulesConfig?.rules?.['react-hooks/rules-of-hooks']).toBe('error');
    expect(rulesConfig?.rules?.['react-hooks/exhaustive-deps']).toBe('warn');
  });

  it('should configure no-console rule', () => {
    const rulesConfig = eslintConfig.find((config) => config.rules);
    const noConsoleRule = rulesConfig?.rules?.['no-console'];
    
    expect(noConsoleRule).toBeDefined();
    expect(Array.isArray(noConsoleRule)).toBe(true);
  });

  it('should configure prefer-const rule', () => {
    const rulesConfig = eslintConfig.find((config) => config.rules);
    
    expect(rulesConfig?.rules?.['prefer-const']).toBe('error');
  });
});
