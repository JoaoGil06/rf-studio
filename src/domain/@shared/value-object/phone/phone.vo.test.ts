import { describe, it, expect } from 'vitest';
import { Phone } from './phone.vo.js';
import { InvalidValueError } from '../../errors/invalidValueError.js';

describe('Phone', () => {
  it('stores a valid phone number', () => {
    const phone = new Phone('+351912345678');
    expect(phone.value).toBe('+351912345678');
  });

  it('throws InvalidValueError for empty string', () => {
    expect(() => new Phone('')).toThrow(InvalidValueError);
  });

  it('throws InvalidValueError for whitespace only', () => {
    expect(() => new Phone('   ')).toThrow(InvalidValueError);
  });

  it('equals returns true for same value', () => {
    const phoneA = new Phone('123');
    const phoneB = new Phone('123');

    const arePhonesEquals = phoneA.equals(phoneB);

    expect(arePhonesEquals).toBe(true);
  });

  it('equals returns false for different values', () => {
    const phoneA = new Phone('123');
    const phoneB = new Phone('124');

    const arePhonesEquals = phoneA.equals(phoneB);

    expect(arePhonesEquals).toBe(false);
  });
});
