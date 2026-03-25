import { InvalidValueError } from '../../errors/invalidValueError.js';
import { ValueObject } from '../value-object.abstract.js';

export class Phone extends ValueObject<string> {
  constructor(value: string) {
    const trimmed = value.trim();

    if (!trimmed) throw new InvalidValueError(`Invalid phone: ${value}`);

    super(trimmed);
  }
}
