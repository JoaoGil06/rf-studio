import { randomUUID } from 'crypto';
import { Product } from '../product.entity.js';
import { InvalidValueError } from '../../../@shared/errors/invalidValueError.js';
import { CreateProductProps, ReconstituteProductProps } from './product.factory.types.js';

const assertNonEmptyName = (name: string): void => {
  if (name.trim().length === 0) {
    throw new InvalidValueError('Product name cannot be empty');
  }
};

export class ProductFactory {
  public static create(props: CreateProductProps): Product {
    assertNonEmptyName(props.name);
    const now = new Date();
    return Product._instantiate({
      id: randomUUID(),
      name: props.name,
      brand: props.brand,
      color: props.color ?? null,
      isAvailable: props.isAvailable ?? true,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: ReconstituteProductProps): Product {
    assertNonEmptyName(props.name);
    return Product._instantiate({
      id: props.id,
      name: props.name,
      brand: props.brand,
      color: props.color,
      isAvailable: props.isAvailable,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }
}