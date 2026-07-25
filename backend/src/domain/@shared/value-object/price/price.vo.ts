import { InvalidValueError } from '../../errors/invalidValueError.js';
import { ValueObject } from '../value-object.abstract.js';

export class Price extends ValueObject<number> {
  constructor(value: number) {
    if (!Number.isFinite(value)) {
      throw new InvalidValueError(`Invalid price: ${value}`);
    }
    if (value < 0) {
      throw new InvalidValueError(`Price cannot be negative: ${value}`);
    }
    super(Math.round(value * 100) / 100);
  }
}
