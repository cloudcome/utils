/**
 * @file vite.config.mts
 * @ref https://vitejs.dev/
 */

import dts from "vite-plugin-dts";
import { externalizeDeps } from "vite-plugin-externalize-deps";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import pkg from "./package.json";

export default defineConfig((env) => {
	const isProd = env.mode === "production";
	const isTest = env.mode === "test";

	return {
		base: "/",
		server: {
			port: 15170,
		},
		preview: {
			port: 15171,
		},
		define: {
			PKG_NAME: JSON.stringify(isTest ? "pkg-name-for-test" : pkg.name),
			PKG_VERSION: JSON.stringify(
				isTest ? "pkg-version-for-test" : pkg.version,
			),
			PKG_DESCRIPTION: JSON.stringify(
				isTest ? "pkg-description-for-test" : pkg.description,
			),
			IS_TEST: JSON.stringify(isTest),
		},
		build: {
			minify: false,
			sourcemap: true,
			copyPublicDir: false,
			reportCompressedSize: false,
			lib: {
				entry:
					// expose-start
					{
						index: "src/index.ts",
					},
				// expose-end
			},
			rollupOptions: {
				output: [
					{
						format: "esm",
						entryFileNames: "[name].mjs",
						chunkFileNames: "[name].mjs",
					},
					{
						format: "cjs",
						entryFileNames: "[name].cjs",
						chunkFileNames: "[name].cjs",
					},
				],
			},
		},
		test: {
			globals: true,
			coverage: {
				all: true,
				include: ["src/**/*.ts"],
				reporter: ["lcov", "text"],
			},
		},
		// esbuild: {
		// 	drop: isProd ? ["console", "debugger"] : [],
		// },
		plugins: [
			tsconfigPaths(),
			externalizeDeps({
				deps: true,
				devDeps: true,
				peerDeps: true,
				optionalDeps: true,
				nodeBuiltins: true,
			}),
			dts({
				include: "src",
			}),
		],
	};
});
