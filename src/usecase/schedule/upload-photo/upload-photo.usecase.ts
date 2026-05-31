import { randomUUID } from 'crypto';
import { fileTypeFromBuffer } from 'file-type';
import { InvalidValueError } from '../../../domain/@shared/errors/invalidValueError.js';
import { IStorageAdapter } from '../../interfaces/storage-adapter.interface.js';
import { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { UploadPhotoInputDto, UploadPhotoOutputDto } from './upload-photo.dto.js';
import { uploadPhotoSchema } from './upload-photo.schema-validator.js';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export class UploadPhotoUseCase {
  private readonly storageAdapter: IStorageAdapter;
  private readonly validationAdapter: IValidationAdapter;

  constructor(storageAdapter: IStorageAdapter, validationAdapter: IValidationAdapter) {
    this.storageAdapter = storageAdapter;
    this.validationAdapter = validationAdapter;
  }

  async execute(input: UploadPhotoInputDto): Promise<UploadPhotoOutputDto> {
    this.validationAdapter.validate<UploadPhotoInputDto>(uploadPhotoSchema, {
      filename: input.filename,
      mimetype: input.mimetype,
    });

    if (input.buffer.byteLength === 0) {
      throw new InvalidValueError('Uploaded file is empty');
    }

    if (input.buffer.byteLength > MAX_BYTES) {
      throw new InvalidValueError('Uploaded file exceeds the 5MB limit');
    }

    // Validação se o upload é uma imagem
    const detected = await fileTypeFromBuffer(input.buffer);
    if (!detected || !detected.mime.startsWith('image/'))
      throw new InvalidValueError('Only image uploads are allowed');

    const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `schedules/photos/${randomUUID()}-${safeName}`;

    const { url } = await this.storageAdapter.upload({
      key,
      body: input.buffer,
      contentType: input.mimetype,
    });

    return { url };
  }
}
