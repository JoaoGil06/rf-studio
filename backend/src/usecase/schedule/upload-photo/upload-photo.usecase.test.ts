import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UploadPhotoUseCase } from './upload-photo.usecase.js';
import type { IStorageAdapter } from '../../interfaces/storage-adapter.interface.js';
import { ZodAdapter } from '../../../infrastructure/adapters/zod.adapter.js';
import { InvalidValueError } from '../../../domain/@shared/errors/invalidValueError.js';

const makeStorage = (): IStorageAdapter => ({
  upload: vi.fn().mockResolvedValue({ url: 'http://localhost:8000/assets/schedules/photos/x.jpg' }),
  delete: vi.fn(),
});

// A complete 1x1 transparent PNG. file-type reads past the 8-byte signature into
// the IHDR chunk to confirm a real PNG, so a truncated signature is not enough.
const PNG_BYTES = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

describe('UploadPhotoUseCase', () => {
  let storage: IStorageAdapter;
  let useCase: UploadPhotoUseCase;

  beforeEach(() => {
    storage = makeStorage();
    useCase = new UploadPhotoUseCase(storage, new ZodAdapter());
  });

  it('uploads a real image (detected by content) and returns its url', async () => {
    const result = await useCase.execute({
      buffer: PNG_BYTES,
      filename: 'before.png',
      mimetype: 'application/octet-stream', // declared type is now ignored
    });

    expect(storage.upload).toHaveBeenCalledOnce();
    expect(result.url).toContain('/assets/schedules/photos/');
  });

  it('rejects a non-image buffer regardless of declared mimetype', async () => {
    await expect(
      useCase.execute({
        buffer: Buffer.from('not-an-image'),
        filename: 'a.jpg',
        mimetype: 'image/jpeg', // claims image, content says otherwise
      }),
    ).rejects.toBeInstanceOf(InvalidValueError);
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it('rejects an empty file', async () => {
    await expect(
      useCase.execute({ buffer: Buffer.alloc(0), filename: 'a.png', mimetype: 'image/png' }),
    ).rejects.toBeInstanceOf(InvalidValueError);
  });
});
