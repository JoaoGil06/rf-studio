import { InvalidValueError } from '../../errors/invalidValueError.js';
import { ValueObject } from '../value-object.abstract.js';

export type ServiceCategoryValue = 'nails' | 'eyebrows';

const ALLOWED: ReadonlySet<ServiceCategoryValue> = new Set(['nails', 'eyebrows']);

export class ServiceCategory extends ValueObject<ServiceCategoryValue> {
  constructor(value: string) {
    const normalisedValue = value.trim().toLowerCase();

    if (!ALLOWED.has(normalisedValue as ServiceCategoryValue)) {
      throw new InvalidValueError(`Invalid Service Category: ${value}`);
    }

    super(normalisedValue as ServiceCategoryValue);
  }
}
