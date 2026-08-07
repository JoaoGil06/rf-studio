import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { CodegenConfig } from '@graphql-codegen/cli';

const TYPEDEFS_DIR = '../backend/src/infrastructure/graphql/schema/typedefs';

/**
 * Read the backend's SDL straight from its TypeScript source, without executing it.
 *
 * Why this is hand-rolled rather than a `schema: '<glob>.ts'` entry: the backend
 * declares its SDL as `export const xTypeDefs = \`#graphql … \`` — an *untagged*
 * template literal. `#graphql` is an editor syntax-highlighting hint; it is not a
 * form `graphql-tag-pluck` recognises (verified — pluck returns 0 definitions for
 * these files, and its only magic-comment hook, `gqlMagicComment`, matches a
 * *leading* `/* graphql *\/` comment). With nothing plucked, the code-file loader
 * falls back to dynamically importing each module, which additionally fails on
 * Windows: @graphql-tools hands Node a raw `D:\…` path and Node rejects it with
 * ERR_UNSUPPORTED_ESM_URL_SCHEME.
 *
 * Extracting the literal as text keeps the property that made the file-based
 * source worth choosing: `pnpm codegen` runs offline and in CI, with no Postgres,
 * no API process, and no backend build step.
 *
 * If the backend ever switches these to `/* GraphQL *\/`-tagged literals, delete
 * this function and go back to a plain `schema: '<glob>.ts'` entry.
 */
function readBackendSdl(): string[] {
  return readdirSync(TYPEDEFS_DIR)
    .filter((file) => file.endsWith('.graphql.ts'))
    .map((file) => {
      const source = readFileSync(join(TYPEDEFS_DIR, file), 'utf8');
      const literal = /`#graphql([\s\S]*?)`/.exec(source);
      if (!literal?.[1]) {
        throw new Error(
          `codegen: no \`#graphql\` template literal found in ${file}. ` +
            `If the backend changed how it declares SDL, update readBackendSdl().`,
        );
      }
      return literal[1];
    });
}

const config: CodegenConfig = {
  schema: readBackendSdl(),
  documents: ['src/**/*.{ts,tsx}', '!src/graphql/generated/**'],
  ignoreNoDocuments: true,
  generates: {
    './src/graphql/generated/': {
      preset: 'client',
      config: {
        // Required, not cosmetic: `verbatimModuleSyntax` rejects generated code
        // that imports types without the `type` keyword.
        useTypeImports: true,
        scalars: { ID: 'string' },
      },
    },
  },
};

export default config;
