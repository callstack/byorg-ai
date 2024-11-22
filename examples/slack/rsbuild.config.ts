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
      ignoreWarnings: [
        /the request of a dependency is an expression/,
        /Can't resolve 'bufferutil'/,
        /Can't resolve 'utf-8-validate'/,
      ],
    },
  },
});
