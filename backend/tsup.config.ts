import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    main: 'src/main.ts',
    seed: 'src/infrastructure/db/seeders/index.ts',
  },
  format: ['esm'],
  target: 'node22',
  // Sem `dts`: gerar .d.ts corre o compilador de TypeScript uma segunda vez e
  // é o pico de memória do build. Isto é uma aplicação, não uma biblioteca —
  // ninguém a importa como package, o runtime só corre `node dist/main.js`.
  // Com 957 MiB no droplet, este passo era morto pelo OOM killer.
  // Os tipos continuam verificados pelo `pnpm typecheck` (tsc --noEmit) no CI.
  dts: false,
  // Sourcemaps ficam: são baratos e dão stack traces legíveis em produção.
  sourcemap: true,
  splitting: false,
  clean: true,
})
