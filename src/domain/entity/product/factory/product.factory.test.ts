import { describe, it, expect } from 'vitest';
import { ProductFactory } from './product.factory.js';
import { InvalidValueError } from '../../../@shared/errors/invalidValueError.js';

describe('ProductFactory', () => {
  const baseProps = {
    name: 'Red Gel Polish',
    brand: 'OPI',
    color: 'red',
  };

  it('create() generates a new UUID', () => {
    const product = ProductFactory.create(baseProps);
    expect(product.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('create() defaults isAvailable to true when omitted', () => {
    const product = ProductFactory.create(baseProps);
    expect(product.isAvailable).toBe(true);
  });

  it('create() respects an explicit isAvailable=false', () => {
    const product = ProductFactory.create({ ...baseProps, isAvailable: false });
    expect(product.isAvailable).toBe(false);
  });

  it('create() defaults color to null when omitted', () => {
    const product = ProductFactory.create({ name: 'Base Coat', brand: 'Essie' });
    expect(product.color).toBeNull();
  });

  it('throws InvalidValueError when name is empty', () => {
    expect(() => ProductFactory.create({ ...baseProps, name: '' })).toThrow(InvalidValueError);
    expect(() => ProductFactory.create({ ...baseProps, name: '   ' })).toThrow(InvalidValueError);
  });

  it('reconstitute() preserves the provided id and timestamps', () => {
    const id = 'existing-uuid';
    const now = new Date('2026-01-01T00:00:00Z');
    const product = ProductFactory.reconstitute({
      id,
      name: 'Red Gel Polish',
      brand: 'OPI',
      color: 'red',
      isAvailable: true,
      createdAt: now,
      updatedAt: now,
    });
    expect(product.id).toBe(id);
    expect(product.createdAt).toEqual(now);
  });
});