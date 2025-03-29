import { isNumber } from './is';
import type { AnyFunction } from './types';

/**
 * 一个空操作函数，不执行任何操作。
 *
 * @example
 * ```typescript
 * fnNoop(); // 不执行任何操作
 * ```
 */
export function fnNoop() {
  //
}

/**
 * 防抖函数的配置选项。
 */
export interface FnControllerOptions {
  /**
   * 等待时间（毫秒）。
   * @default 0
   */
  wait?: number;
  /**
   * 是否在等待开始时立即执行一次
   * @default false
   */
  leading?: boolean;
}

/**
 * 创建一个防抖函数，该函数会在指定的等待时间后执行，如果在等待时间内再次调用，则重新计时。
 *
 * @param fn - 需要防抖的函数。
 * @param wait - 等待时间（毫秒）或包含 `wait` 和 `leading` 选项的对象。
 * @returns 返回一个防抖函数，该函数具有 `cancel` 方法，用于取消防抖操作。
 *
 * @example
 * ```typescript
 * const debouncedFn = fnDebounce(() => {
 *   console.log('Debounced!');
 * }, 100);
 *
 * debouncedFn(); // 不会立即执行
 * debouncedFn(); // 重新计时
 * debouncedFn.cancel(); // 取消防抖操作
 * ```
 */
export function fnDebounce<F extends AnyFunction>(fn: F, wait: number | FnControllerOptions = 0) {
  const options: FnControllerOptions = isNumber(wait) ? { wait } : wait;
  let canceled = false;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let timer: any;
  let leading = false;

  const fnController = function (...args: Parameters<F>) {
    if (canceled) {
      return;
    }

    if (options.leading && !leading) {
      leading = true;
      // @ts-expect-error
      fn.apply(this, args);
      return;
    }

    clearTimeout(timer);
    timer = setTimeout(() => {
      if (canceled) return;

      // @ts-expect-error
      fn.apply(this, args);
    }, options.wait);
  };

  fnController.cancel = () => {
    clearTimeout(timer);
    canceled = true;
  };

  return fnController;
}
