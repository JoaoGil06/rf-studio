import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    main: 'src/main.ts',
    seed: 'src/infrastructure/db/seeders/index.ts',
  },
  format: ['esm'],
  target: 'node22',
  dts: true,
  sourcemap: true,
  splitting: false,
  clean: true,
})
