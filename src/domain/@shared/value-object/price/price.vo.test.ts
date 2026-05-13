import { describe, it, expect } from 'vitest';
import { InvalidValueError } from '../../errors/invalidValueError.js';
import { Price } from './price.vo.js';

describe('Price', () => {
  it('stores a non-negative number rounded to two decimals', () => {
    expect(new Price(12.5).value).toBe(12.5);
    expect(new Price(12.499).value).toBe(12.5);
  });

  it('allows zero', () => {
    expect(new Price(0).value).toBe(0);
  });

  it('throws InvalidValueError for negative numbers', () => {
    expect(() => new Price(-1)).toThrow(InvalidValueError);
  });

  it('throws InvalidValueError for NaN or Infinity', () => {
    expect(() => new Price(NaN)).toThrow(InvalidValueError);
    expect(() => new Price(Infinity)).toThrow(InvalidValueError);
  });

  it('equals compares by value', () => {
    expect(new Price(10).equals(new Price(10))).toBe(true);
    expect(new Price(10).equals(new Price(11))).toBe(false);
  });
});
