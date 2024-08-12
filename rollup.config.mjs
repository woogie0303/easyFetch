import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs',
      format: 'cjs',
    },
  ],
  plugins: [
    nodeResolve(),
    commonjs({ extensions: ['.js', '.ts'] }),
    typescript({
      exclude: ['test', '**/*.test.ts'],
      compilerOptions: { declaration: true, declarationDir: './types' },
    }),
  ],
};
