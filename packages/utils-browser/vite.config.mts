/**
 * @file vite.config.mts
 * @ref https://vitejs.dev/
 */

import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';
import { defineConfig } from 'vitest/config';
import pkg from './package.json';

export default defineConfig((env) => {
  const isProd = env.mode === 'production';
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
      target: 'ES2024',
      minify: false,
      sourcemap: true,
      copyPublicDir: false,
      reportCompressedSize: false,
      lib: {
        entry:
          // expose-start
          {
            index: 'src/index.ts',
            base64: './src/base64.ts',
            cache: './src/cache.ts',
            canvas: './src/canvas.ts',
            clipboard: './src/clipboard.ts',
            cookie: './src/cookie.ts',
            dom: './src/dom.ts',
            download: './src/download.ts',
            image: './src/image.ts',
            timer: './src/timer.ts',
            video: './src/video.ts',
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
      environment: 'jsdom',
      environmentOptions: {
        jsdom: {
          // 加载外部资源
          resources: 'usable',
        },
      },
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
        entryRoot: "src",
      }),
    ],
  };
});
