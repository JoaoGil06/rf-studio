import { readFile } from 'node:fs/promises';
import { IFeatureFlagProvider } from '../../usecase/interfaces/feature-flag-provider.interface.js';

export class JsonFileFeatureFlagProvider implements IFeatureFlagProvider {
  constructor(private readonly filePath: string) {}

  async isEnabled(key: string): Promise<boolean> {
    try {
      const raw = await readFile(this.filePath, 'utf-8');
      const flags = JSON.parse(raw) as Record<string, unknown>;
      return flags[key] === true;
    } catch {
      return false; // fail-safe: unreadable/invalid config => feature off
    }
  }
}
