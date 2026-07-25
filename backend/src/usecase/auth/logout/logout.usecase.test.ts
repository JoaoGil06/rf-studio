import { describe, it, expect } from 'vitest';
import { LogoutUseCase } from './logout.usecase.js';

describe('LogoutUseCase', () => {
  it('returns { success: true }', async () => {
    const result = await new LogoutUseCase().execute();
    expect(result).toEqual({ success: true });
  });
});
