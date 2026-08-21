import { describe, it, expect } from 'vitest';
import { CryptoPasswordGeneratorAdapter } from './crypto.adapter.js';

describe('CryptoPasswordGeneratorAdapter', () => {
  const adapter = new CryptoPasswordGeneratorAdapter();

  it('returns a string comfortably longer than the 6-character minimum', () => {
    const password = adapter.generate();

    expect(typeof password).toBe('string');
    expect(password.length).toBeGreaterThan(6);
  });

  it('returns a different value on each call', () => {
    expect(adapter.generate()).not.toBe(adapter.generate());
  });

  it('uses the base64url alphabet', () => {
    expect(adapter.generate()).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});
