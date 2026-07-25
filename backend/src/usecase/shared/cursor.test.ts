import { describe, it, expect } from 'vitest';
import { encodeCursor, decodeCursor } from './cursor.js';
import { InvalidValueError } from '../../domain/@shared/errors/invalidValueError.js';

describe('cursor', () => {
  it('encodes and decodes 0 correctly', () => {
    expect(decodeCursor(encodeCursor(0))).toBe(0);
  });

  it('encodes and decodes a positive offset correctly', () => {
    expect(decodeCursor(encodeCursor(42))).toBe(42);
  });

  it('throws InvalidValueError for a non-cursor base64 string', () => {
    const garbage = Buffer.from('notacursor:abc').toString('base64');
    expect(() => decodeCursor(garbage)).toThrow(InvalidValueError);
  });

  it('throws InvalidValueError for a plain string', () => {
    expect(() => decodeCursor('plaintext')).toThrow(InvalidValueError);
  });

  it('throws InvalidValueError when offset part is NaN', () => {
    const bad = Buffer.from('cursor:abc').toString('base64');
    expect(() => decodeCursor(bad)).toThrow(InvalidValueError);
  });
});
