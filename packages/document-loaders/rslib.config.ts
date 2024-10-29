import { defineConfig } from '@rslib/core';

const shared = {
  source: {
    tsconfigPath: './tsconfig.build.json',
  },
};

export default defineConfig({
  lib: [
    {
      ...shared,
      format: 'esm',
      dts: {
        bundle: true,
      },
      output: {
        distPath: {
          root: './dist/esm',
        },
      },
    },
    {
      ...shared,
      format: 'cjs',
      dts: false,
      output: {
        distPath: {
          root: './dist/cjs',
        },
      },
    },
  ],
  output: {
    target: 'node',
  },
});
