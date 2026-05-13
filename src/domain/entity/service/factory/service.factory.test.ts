import { describe, it, expect } from 'vitest';
import { ServiceFactory } from './service.factory.js';
import { InvalidValueError } from '../../../@shared/errors/invalidValueError.js';

describe('ServiceFactory', () => {
  const baseProps = {
    name: 'French Manicure',
    category: 'nails',
    price: 25.5,
    durationMinutes: 45,
  };

  it('create() generates a new UUID', () => {
    const service = ServiceFactory.create(baseProps);
    expect(service.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('create() wraps price and category in value objects', () => {
    const service = ServiceFactory.create(baseProps);
    expect(service.price.value).toBe(25.5);
    expect(service.category.value).toBe('nails');
  });

  it('throws InvalidValueError when durationMinutes is not positive', () => {
    expect(() => ServiceFactory.create({ ...baseProps, durationMinutes: 0 })).toThrow(
      InvalidValueError,
    );
    expect(() => ServiceFactory.create({ ...baseProps, durationMinutes: -5 })).toThrow(
      InvalidValueError,
    );
  });

  it('reconstitute() preserves the provided id and timestamps', () => {
    const id = 'existing-uuid';
    const now = new Date('2026-01-01T00:00:00Z');
    const service = ServiceFactory.reconstitute({
      ...baseProps,
      id,
      createdAt: now,
      updatedAt: now,
    });
    expect(service.id).toBe(id);
    expect(service.createdAt).toEqual(now);
  });
});
