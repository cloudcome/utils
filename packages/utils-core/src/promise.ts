import { isObject, isPromise } from './type';

/**
 * 检查给定的值是否为 Promise 类似对象。
 * @param unknown - 要检查的值。
 * @returns 如果值是 Promise 类似对象，则返回 `true`，否则返回 `false`。
 */
export function isPromiseLike<T>(unknown: unknown): unknown is Promise<T> {
  return (
    isPromise(unknown) ||
    (isObject(unknown) &&
      typeof (unknown as unknown as Promise<T>).then === 'function')
  );
}

/**
 * 等待一定时间后解决 Promise
 * @param ms - 等待的毫秒数，默认为 0
 * @param ctrl - 可选的 AbortController，用于提前终止等待
 * @returns 一个 Promise，等待指定时间后解决
 */
export async function promiseDelay(ms = 0, ctrl?: AbortController) {
  return new Promise<void>((resolve) => {
    const t = setTimeout(resolve, ms);

    if (ctrl) {
      ctrl.signal.addEventListener('abort', () => {
        clearTimeout(t);
        resolve();
      });
    }
  });
}

/**
 * 使 Promise 在指定时间内执行，超时则拒绝
 * @param promise - 要执行的 Promise
 * @param ms - 超时的毫秒数
 * @returns 如果 Promise 在指定时间内解决，则返回其结果；否则抛出 "timeout" 错误
 * @throws {Error} 如果 Promise 超时，抛出 "timeout" 错误
 */
export async function promiseTimeout<T>(promise: Promise<T>, ms: number) {
  const ctrl = new AbortController();
  const result = await Promise.race([
    promise,
    promiseDelay(ms, ctrl).then(() => {
      throw new Error('timeout');
    }),
  ]);
  ctrl.abort();
  return result;
}

/**
 * 在指定条件满足时解决 Promise
 * @param condition - 一个返回布尔值的函数，用于检查条件是否满足
 * @param ms - 检查条件的时间间隔（毫秒），默认为 10
 * @returns 一个 Promise，在条件满足时解决
 */
export function promiseWhen(condition: () => boolean, ms = 10) {
  return new Promise<void>((resolve, _reject) => {
    const check = () => {
      if (condition()) {
        resolve();
      } else {
        setTimeout(check, ms);
      }
    };

    check();
  });
}

/**
 * 创建一个与给定 Promise 共享状态的新 Promise。
 * 新的 Promise 不具备 resolve 或 reject 的能力，它仅反映原始 Promise 的状态。
 * @param promise - 要共享状态的原始 Promise。
 * @returns 一个新的 Promise，其状态与给定的 Promise 完全相同。
 * @example
 * const { promise: p1 } = Promise.withResolvers();
 * const sp1 = sharedPromise(p1);
 * const sp2 = sharedPromise(p1);
 * // 此时 sp1、sp2 完全共享 p1 的状态，自身并不具备 resolve 或 reject 的能力
 */
export function promiseShared<T>(promise: Promise<T>) {
  return new Promise<T>((resolve, reject) => {
    promise.then(resolve, reject);
  });
}

/**
 * 创建一个最小等待时间的函数
 * @param {number} ms - 最小等待时间（毫秒）
 * @returns {function} 返回一个异步函数，该函数会确保从 createMinDelayPromise 调用到其执行的时间至少为 ms 毫秒
 * @example
 * const end = createMinDelayPromise(1000);
 * // 执行一些操作
 * await end(); // 确保从 createMinDelayPromise 调用到这里的总时间至少为 1000 毫秒
 */
export function createMinDelayPromise(ms: number) {
  const startTime = Date.now();
  /**
   * 确保最小等待时间的结束函数
   * @async
   * @function end
   * @returns {Promise<void>} 在达到最小等待时间后解决
   */
  return async function end() {
    const endTime = Date.now();
    const waitTime = ms - (endTime - startTime);
    if (waitTime > 0) {
      await promiseDelay(waitTime);
    }
  };
}
