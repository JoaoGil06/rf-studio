import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogoutUseCase } from './logout.usecase.js';
import type { IJwtAdapter } from '../../interfaces/jwt-adapter.interface.js';
import { UnathorizedError } from '../../../domain/@shared/errors/unathorizedError.js';

const mockJwtAdapter: IJwtAdapter = {
  sign: vi.fn(),
  verify: vi.fn(),
};

const makeUseCase = () => new LogoutUseCase(mockJwtAdapter);

describe('LogoutUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns { success: true } when the token is valid', async () => {
    vi.mocked(mockJwtAdapter.verify).mockReturnValue({
      sub: 'user-uuid',
      roleId: 'role-uuid',
      email: 'jane@example.com',
    });

    const result = await makeUseCase().execute('valid-token');

    expect(result).toEqual({ success: true });
    expect(mockJwtAdapter.verify).toHaveBeenCalledWith('valid-token');
  });

  it('throws UnathorizedError when the token is null', async () => {
    await expect(makeUseCase().execute(null)).rejects.toThrow(UnathorizedError);
    expect(mockJwtAdapter.verify).not.toHaveBeenCalled();
  });

  it('throws UnathorizedError when the token is invalid', async () => {
    vi.mocked(mockJwtAdapter.verify).mockImplementation(() => {
      throw new UnathorizedError('Invalid or expired token');
    });

    await expect(makeUseCase().execute('bad-token')).rejects.toThrow(UnathorizedError);
  });
});
