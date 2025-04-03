import { isBrowser, isLinux, isMacOS, isNode, isWindows, isWorker } from '@/env';

it('env', () => {
  expect(isBrowser()).toBe(true);
  expect(isNode()).toBe(true);
  expect(isWorker()).toBe(false);
});

describe('isMacOS', () => {
  it('应在 macOS 浏览器环境中返回 true', () => {
    // @ts-ignore
    global.navigator = { platform: 'MacIntel' };
    expect(isMacOS()).toBe(true);
  });

  it('应在 macOS Node.js 环境中返回 true', () => {
    // @ts-ignore
    global.process = { platform: 'darwin' };
    expect(isMacOS()).toBe(true);
  });
});

describe('isLinux', () => {
  it('应在 Linux 浏览器环境中返回 true', () => {
    // @ts-ignore
    global.navigator = { platform: 'Linux x86_64' };
    expect(isLinux()).toBe(true);
  });

  it('应在 Linux Node.js 环境中返回 true', () => {
    // @ts-ignore
    global.process = { platform: 'linux' };
    expect(isLinux()).toBe(true);
  });

  it('应在非 Linux 环境中返回 false', () => {
    // @ts-ignore
    global.navigator = { platform: 'Win32' };
    expect(isLinux()).toBe(false);
  });
});

describe('isWindows', () => {
  it('应在 Windows 浏览器环境中返回 true', () => {
    // @ts-ignore
    global.navigator = { platform: 'Win32' };
    expect(isWindows()).toBe(true);
  });

  it('应在 Windows Node.js 环境中返回 true', () => {
    // @ts-ignore
    global.process = { platform: 'win32' };
    expect(isWindows()).toBe(true);
  });

  it('应在非 Windows 环境中返回 false', () => {
    // @ts-ignore
    global.navigator = { platform: 'MacIntel' };
    expect(isWindows()).toBe(false);
  });
});
