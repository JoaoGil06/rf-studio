import { randomUUID } from 'crypto';
import { Service } from '../service.entity.js';
import { Price } from '../../../@shared/value-object/price/price.vo.js';
import { ServiceCategory } from '../../../@shared/value-object/service-category/service-category.vo.js';
import { InvalidValueError } from '../../../@shared/errors/invalidValueError.js';
import { CreateServiceProps, ReconstituteServiceProps } from './service.factory.types.js';

const assertPositiveInt = (value: number): void => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new InvalidValueError(`durationMinutes must be a positive integer: ${value}`);
  }
};

export class ServiceFactory {
  public static create(props: CreateServiceProps): Service {
    assertPositiveInt(props.durationMinutes);
    const now = new Date();
    return Service._instantiate({
      id: randomUUID(),
      name: props.name,
      category: new ServiceCategory(props.category),
      price: new Price(props.price),
      durationMinutes: props.durationMinutes,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: ReconstituteServiceProps): Service {
    assertPositiveInt(props.durationMinutes);
    return Service._instantiate({
      id: props.id,
      name: props.name,
      category: new ServiceCategory(props.category),
      price: new Price(props.price),
      durationMinutes: props.durationMinutes,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }
}
