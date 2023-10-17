import { defineConfig } from 'tsup'


export default defineConfig((options) => {
  return {
    entry: ['src/index.ts'],
    splitting: false,
    format: ['esm', 'cjs'],
    sourcemap: true,
    clean: true,
    minify: !options.watch,
    dts: true
  }
})