/**
 * @file vite.config.mts
 * @ref https://vitejs.dev/
 */

import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';
import { defineConfig } from 'vitest/config';
import pkg from './package.json';

export default defineConfig((env) => {
  const isTest = env.mode === 'test';

  return {
    resolve: {
      tsconfigPaths: true,
    },
    define: {
      PKG_NAME: JSON.stringify(isTest ? 'pkg-name-for-test' : pkg.name),
      PKG_VERSION: JSON.stringify(isTest ? 'pkg-version-for-test' : pkg.version),
      PKG_DESCRIPTION: JSON.stringify(isTest ? 'pkg-description-for-test' : pkg.description),
      IS_TEST: JSON.stringify(isTest),
    },
    build: {
      target: 'node20',
      minify: false,
      sourcemap: true,
      copyPublicDir: false,
      reportCompressedSize: false,
      lib: {
        entry:
          // expose-start
          {
            index: 'src/index.ts',
            client: './src/client.ts',
            cloud: './src/cloud.ts',
            database: './src/database.ts',
          },
        // expose-end
      },
      rolldownOptions: {
        output: [
          {
            format: 'esm',
            entryFileNames: '[name].mjs',
            chunkFileNames: '[name].mjs',
          },
          {
            format: 'cjs',
            entryFileNames: '[name].cjs',
            chunkFileNames: '[name].cjs',
          },
        ],
      },
    },
    test: {
      globals: true,
      coverage: {
        all: true,
        include: ['src/**/*.ts'],
        reporter: ['lcov', 'text'],
      },
    },
    // esbuild: {
    //   drop: isProd ? ['console', 'debugger'] : [],
    // },
    plugins: [
      externalizeDeps({
        deps: true,
        devDeps: true,
        peerDeps: true,
        optionalDeps: true,
        nodeBuiltins: true,
      }),
      dts({
        entryRoot: 'src',
      }),
    ],
  };
});
