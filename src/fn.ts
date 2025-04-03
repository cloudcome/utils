import { isNumber } from './type';
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
export interface FnDebounceOptions {
  /**
   * 等待时间（毫秒）。
   */
  wait: number;
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
export function fnDebounce<F extends AnyFunction>(fn: F, wait: number | FnDebounceOptions) {
  const options: FnDebounceOptions = isNumber(wait) ? { wait } : wait;
  let canceled = false;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let timer: any;
  let leading = false;

  const debounced = function (this: unknown, ...args: Parameters<F>) {
    if (canceled) return;

    // 第一次执行
    if (options.leading && !leading) {
      leading = true;
      fn.apply(this, args);
      return;
    }

    // 最后一次执行
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (canceled) return;

      fn.apply(this, args);
    }, options.wait);
  };

  debounced.cancel = () => {
    clearTimeout(timer);
    canceled = true;
  };

  return debounced;
}

export interface FnThrottleOptions {
  /**
   * 等待时间（毫秒）。
   */
  wait: number;

  /**
   * 是否在第一次调用时立即执行
   * @default false
   */
  leading?: boolean;

  /**
   * 是否在调用结束后等待一段时间再执行
   * @default false
   */
  trailing?: boolean;
}

/**
 * 创建一个节流函数，该函数会在指定的等待时间内最多执行一次，如果在等待时间内再次调用，则忽略后续调用。
 *
 * @param fn - 需要节流的函数。
 * @param wait - 等待时间（毫秒）或包含 `wait`、`leading` 和 `trailing` 选项的对象。
 * @returns 返回一个节流函数，该函数具有 `cancel` 方法，用于取消节流操作。
 *
 * @example
 * ```typescript
 * const throttledFn = fnThrottle(() => {
 *   console.log('Throttled!');
 * }, 100);
 *
 * throttledFn(); // 立即执行
 * throttledFn(); // 忽略
 * throttledFn.cancel(); // 取消节流操作
 * ```
 */
export function fnThrottle<F extends AnyFunction>(fn: F, wait: number | FnThrottleOptions) {
  const options = isNumber(wait) ? { wait } : wait;
  const waitFinal = options.wait;
  let lastTime = 0;
  let canceled = false;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let timer: any;

  const throttled = function (this: unknown, ...args: Parameters<F>) {
    if (canceled) return;

    const now = Date.now();

    // 第一次执行
    if (options.leading && lastTime === 0) {
      lastTime = now;
      fn.apply(this, args);
    }

    // 中间控频执行
    else if (lastTime > 0 && now - lastTime >= waitFinal) {
      lastTime = now;
      fn.apply(this, args);
    }

    // 首次计时
    else if (lastTime === 0) {
      lastTime = now;
    }

    // 最后一次执行
    if (options.trailing) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, args);
      }, waitFinal);
    }
  };

  throttled.cancel = () => {
    canceled = true;
    clearTimeout(timer);
  };

  return throttled;
}

/**
 * 创建一个只执行一次的函数，无论调用多少次，实际执行的函数体也只会执行一次。
 *
 * @param fn - 需要只执行一次的函数。
 * @returns 返回一个只执行一次的函数，该函数在第一次调用后会缓存结果并返回缓存的结果。
 *
 * @example
 * ```typescript
 * const onceFn = fnOnce(() => {
 *   console.log('This will be logged only once.');
 *   return 42;
 * });
 *
 * console.log(onceFn()); // 输出: This will be logged only once. 42
 * console.log(onceFn()); // 输出: 42
 * ```
 */
export function fnOnce<F extends AnyFunction>(fn: F) {
  let called = false;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let result: any;

  return function (this: unknown, ...args: Parameters<F>) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }

    return result;
  };
}
