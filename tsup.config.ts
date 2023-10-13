import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  format: 'esm',
  sourcemap: true,
  clean: true,
  watch: true
})