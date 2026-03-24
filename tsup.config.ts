import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['esm'],
  target: 'node22',
  dts: true,
  sourcemap: true,
  splitting: false,
  clean: true,
})
