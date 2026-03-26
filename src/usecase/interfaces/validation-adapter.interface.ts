export interface IValidationAdapter {
  validate<T>(schema: unknown, data: unknown): T;
}
