import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src'],
  format: ['esm'],
  loader: {
    '.sql': 'text'
  },
  target: 'es2022',
  sourcemap: true,
  clean: true,
})