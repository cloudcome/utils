import { isBrowser, isLinux, isMacOS, isNode, isWindows, isWorker } from '@/env';

beforeAll(() => {
  // @ts-ignore
  global.TEST_MOCK = {
    IS_BROWSER: false,
    IS_NODE: false,
  };
});

beforeEach(() => {
  TEST_MOCK.IS_NODE = false;
  TEST_MOCK.IS_NODE = false;
});

it('env', () => {
  expect(isBrowser()).toBe(false);
  expect(isNode()).toBe(false);
  expect(isWorker()).toBe(false);
});

describe('isMacOS', () => {
  it('应在 macOS 浏览器环境中返回 true', () => {
    TEST_MOCK.IS_BROWSER = true;
    // @ts-ignore
    global.navigator = { platform: 'MacIntel' };
    expect(isMacOS()).toBe(true);
  });

  it('应在 macOS Node.js 环境中返回 true', () => {
    TEST_MOCK.IS_NODE = true;
    // @ts-ignore
    global.process = { platform: 'darwin' };
    expect(isMacOS()).toBe(true);
  });
});

describe('isLinux', () => {
  it('应在 Linux 浏览器环境中返回 true', () => {
    TEST_MOCK.IS_BROWSER = true;
    // @ts-ignore
    global.navigator = { platform: 'Linux x86_64' };
    expect(isLinux()).toBe(true);
  });

  it('应在 Linux Node.js 环境中返回 true', () => {
    TEST_MOCK.IS_NODE = true;
    // @ts-ignore
    global.process = { platform: 'linux' };
    expect(isLinux()).toBe(true);
  });
});

describe('isWindows', () => {
  it('应在 Windows 浏览器环境中返回 true', () => {
    TEST_MOCK.IS_BROWSER = true;
    // @ts-ignore
    global.navigator = { platform: 'Win32' };
    expect(isWindows()).toBe(true);
  });

  it('应在 Windows Node.js 环境中返回 true', () => {
    TEST_MOCK.IS_NODE = true;
    // @ts-ignore
    global.process = { platform: 'win32' };
    expect(isWindows()).toBe(true);
  });
});
