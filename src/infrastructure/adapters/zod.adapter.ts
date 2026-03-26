import type { ZodSchema } from 'zod';
import type { IValidationAdapter } from '../../usecase/interfaces/validation-adapter.interface.js';
import { InvalidValueError } from '../../domain/@shared/errors/invalidValueError.js';

export class ZodAdapter implements IValidationAdapter {
  validate<T>(schema: ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new InvalidValueError(result.error.issues.map((error) => error.message).join(', '));
    }
    return result.data;
  }
}
