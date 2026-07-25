import { describe, it, expect } from 'vitest';
import { InvalidValueError } from '../../errors/invalidValueError.js';
import { ServiceCategory } from './service-category.vo.js';

describe('ServiceCategory', () => {
  it('accepts "nails"', () => {
    expect(new ServiceCategory('nails').value).toBe('nails');
  });

  it('accepts "eyebrows"', () => {
    expect(new ServiceCategory('eyebrows').value).toBe('eyebrows');
  });

  it('normalises case and whitespace', () => {
    expect(new ServiceCategory('  NAILS  ').value).toBe('nails');
  });

  it('throws InvalidValueError for anything else', () => {
    expect(() => new ServiceCategory('hair')).toThrow(InvalidValueError);
    expect(() => new ServiceCategory('')).toThrow(InvalidValueError);
  });
});
