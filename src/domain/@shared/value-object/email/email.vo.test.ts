import { describe, it, expect } from 'vitest';
import { Email } from './email.vo.js';
import { InvalidValueError } from '../../errors/invalidValueError.js';

describe('Email', () => {
  it('creates a valid email in lowercase', () => {
    const email = new Email('TEST@EXAMPLE.COM');
    expect(email.value).toBe('test@example.com');
  });

  it('throws InvalidValueError for invalid format', () => {
    expect(() => new Email('not-an-email')).toThrow(InvalidValueError);
  });

  it('throws InvalidValueError for empty string', () => {
    expect(() => new Email('')).toThrow(InvalidValueError);
  });

  it('equals returns true for same value', () => {
    const emailA = new Email('a@b.com');
    const emailB = new Email('a@b.com');

    const areEmailsEquals = emailA.equals(emailB);

    expect(areEmailsEquals).toBe(true);
  });

  it('equals returns false for different value', () => {
    const emailA = new Email('a@b.com');
    const emailB = new Email('c@b.com');

    const areEmailsEquals = emailA.equals(emailB);

    expect(areEmailsEquals).toBe(false);
  });
});
