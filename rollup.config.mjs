import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import del from 'rollup-plugin-delete';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/cjs/index.js',
      format: 'cjs',
    },
    plugins: [
      typescript({
        exclude: ['test', '**/*.test.ts'],
        declaration: true,
        declarationDir: 'dist/cjs/types',
      }),
      terser(),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/cjs/index.d.ts',
      format: 'cjs',
    },
    plugins: [dts(), del({ hook: 'buildEnd', targets: './dist/cjs/types' })],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/esm/index.mjs',
      format: 'esm',
    },

    plugins: [
      typescript({
        exclude: ['test', '**/*.test.ts'],
        declaration: true,
        declarationDir: 'dist/esm/types',
      }),
      terser(),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/esm/index.d.mts',
      format: 'esm',
    },
    plugins: [dts(), del({ hook: 'buildEnd', targets: './dist/esm/types' })],
  },
];
