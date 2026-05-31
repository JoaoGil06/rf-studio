import { dirname, join } from 'path';
import {
  IStorageAdapter,
  UploadParams,
} from '../../usecase/interfaces/storage-adapter.interface.js';
import { mkdir, writeFile, unlink } from 'fs/promises';

export interface LocalStorageConfig {
  assetsDir: string; // absolute path to the assets root, e.g. <projectRoot>/assets
  publicBaseUrl: string; // base URL the assets are served under, e.g. http://localhost:8000/assets
}

export class LocalStorageAdapter implements IStorageAdapter {
  private readonly config: LocalStorageConfig;

  constructor(config: LocalStorageConfig) {
    this.config = config;
  }

  async upload(params: UploadParams): Promise<{ url: string }> {
    const destination = join(this.config.assetsDir, params.key);

    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, params.body);

    const base = this.config.publicBaseUrl.replace(/\/$/, '');

    return { url: `${base}/${params.key}` };
  }

  async delete(url: string): Promise<void> {
    const base = this.config.publicBaseUrl.replace(/\/$/, '');
    if (!url.startsWith(`${base}/`)) {
      // URL not managed by this adapter — nothing to delete.
      return;
    }

    const key = url.slice(base.length + 1); // strip "<base>/"
    const target = join(this.config.assetsDir, key);

    try {
      await unlink(target);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
