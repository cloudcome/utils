import { isNullish } from './type';

/**
 * 判断当前环境是否为浏览器环境
 * @returns 如果是浏览器环境返回 true，否则返回 false
 */
export function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * 判断当前环境是否为 Node.js 环境
 * @returns 如果是 Node.js 环境返回 true，否则返回 false
 */
export function isNode() {
  return typeof process !== 'undefined' && !isNullish(process.versions) && !isNullish(process.versions.node);
}

/**
 * 判断当前环境是否为 Web Worker 环境
 * @returns 如果是 Web Worker 环境返回 true，否则返回 false
 * @remarks
 * 使用 @ts-ignore 忽略 self 的类型检查，因为 self 在 Web Worker 中可用但在其他环境中可能未定义
 */
export function isWorker() {
  // @ts-ignore
  return typeof self !== 'undefined' && self.importScripts != null;
}

/**
 * 判断当前操作系统是否为 macOS
 * @returns 如果是 macOS 返回 true，否则返回 false
 * @remarks
 * 在浏览器环境中通过 navigator.platform 检测，在 Node.js 环境中通过 process.platform 检测
 */
export function isMacOS() {
  return isBrowser() ? /^mac/i.test(navigator.platform) : isNode() ? /^darwin/i.test(process.platform) : false;
}

/**
 * 判断当前操作系统是否为 Linux
 * @returns 如果是 Linux 返回 true，否则返回 false
 * @remarks
 * 在浏览器环境中通过 navigator.platform 检测，在 Node.js 环境中通过 process.platform 检测
 */
export function isLinux() {
  return isBrowser() ? /^linux/i.test(navigator.platform) : isNode() ? /^linux/i.test(process.platform) : false;
}

/**
 * 判断当前操作系统是否为 Windows
 * @returns 如果是 Windows 返回 true，否则返回 false
 * @remarks
 * 在浏览器环境中通过 navigator.platform 检测，在 Node.js 环境中通过 process.platform 检测
 */
export function isWindows() {
  return isBrowser() ? /^win/i.test(navigator.platform) : isNode() ? /^win/i.test(process.platform) : false;
}
