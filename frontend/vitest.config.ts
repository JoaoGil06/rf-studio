import { defineConfig, mergeConfig } from 'vitest/config';
// Explicit `.ts` extension: this file is covered by tsconfig.node.json, which is
// `module: "nodenext"` — unlike `src/`, extensionless relative imports are an
// error here. `allowImportingTsExtensions` makes this form legal.
import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      coverage: {
        provider: 'v8',
        exclude: ['src/graphql/generated/**', 'src/test/**', '**/*.d.ts'],
      },
    },
  }),
);
