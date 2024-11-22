import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  source: {
    entry: {
      index: {
        filename: 'index.js',
        import: './src/index.ts',
      },
    },
    tsconfigPath: './tsconfig.build.json',
  },
  output: {
    target: 'node',
    minify: false,
  },
  tools: {
    rspack: {
      module: {
        parser: {
          javascript: {
            dynamicImportMode: 'eager',
          },
        },
      },
      resolve: {
        extensionAlias: {
          '.js': ['.js', '.ts'],
        },
      },
    },
  },
});
