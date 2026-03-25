import { InvalidValueError } from '../../errors/invalidValueError.js';
import { ValueObject } from '../value-object.abstract.js';

export class Email extends ValueObject<string> {
  constructor(value: string) {
    const lowerCaseValue = value.toLowerCase().trim();

    if (!lowerCaseValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lowerCaseValue)) {
      throw new InvalidValueError(`Invalid email: ${value}`);
    }

    super(lowerCaseValue);
  }
}
