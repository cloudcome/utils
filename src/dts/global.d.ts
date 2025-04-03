/**
 * @file global.d.ts
 */

/**
 * package.json name
 */
declare const PKG_NAME: string;

/**
 * package.json version
 */
declare const PKG_VERSION: string;

/**
 * package.json description
 */
declare const PKG_DESCRIPTION: string;

declare const IS_TEST: string;

interface TEST_MOCK {
  IS_BROWSER: boolean;
  IS_NODE: boolean;
}

declare const TEST_MOCK: TEST_MOCK;
