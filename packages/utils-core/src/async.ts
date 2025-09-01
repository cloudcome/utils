import { fnNoop } from './fn';
import type { AnyArray, AnyAsyncFunction } from './types';

/**
 * 表示异步任务的类型
 * @template T - 任务返回值的类型
 */
type AsyncTask<T> = {
  /** 任务索引 */
  idx: number;
  /** 异步任务函数 */
  afn: () => Promise<T>;
  /** Promise 的解析器对象 */
  pwr?: PromiseWithResolvers<T>;
};

/**
 * 异步任务队列的配置选项
 */
export type AsyncQueueOptions = {
  /**
   * 并发限制数，0 表示无限制
   * @default 0
   */
  limit?: number;
};

/**
 * 异步任务队列，用于管理和控制异步任务的执行
 * @template T - 任务返回值的类型
 */
export class AsyncQueue<T> {
  #tasks: AsyncTask<T>[] = [];
  #length = 0;

  /**
   * 创建一个异步任务队列
   * @param asyncFns - 要执行的异步函数数组
   * @param options - 队列配置选项
   */
  constructor(
    asyncFns: Array<() => Promise<T>>,
    readonly options?: AsyncQueueOptions,
  ) {
    asyncFns.forEach((afn, idx) => {
      this.#add('push', afn);
    });
  }

  get length() {
    return this.#length;
  }

  get limit() {
    return this.options?.limit || 0;
  }

  #add(method: 'unshift' | 'push', afn: () => Promise<T>, pwr?: PromiseWithResolvers<T>) {
    this.#tasks[method]({
      idx: this.#length++,
      afn: afn,
      pwr: pwr,
    });
  }

  #addAndRun(method: 'unshift' | 'push', afn: () => Promise<T>) {
    // 明确终止了
    if (this.#stopLength >= 0) {
      throw new Error('异步队列已被终止，无法添加新的任务');
    }

    const pwr = Promise.withResolvers<T>();
    this.#add(method, afn, pwr);

    if (this.#startPwr && this.#running === 0) {
      this.#run();
    }

    return pwr.promise;
  }

  async push(afn: () => Promise<T>) {
    return this.#addAndRun('push', afn);
  }

  async unshift(afn: () => Promise<T>) {
    return this.#addAndRun('unshift', afn);
  }

  #startResolved = 0;
  #startRejected = 0;
  get startSettled() {
    return this.#startResolved === this.#startLength || this.#startRejected > 0;
  }

  #startResults: T[] = [];
  #startPwr: PromiseWithResolvers<T[]> | null = null;
  #startLength = 0;

  /**
   * 启动队列中的任务执行
   * @returns 返回一个 Promise，在所有启动任务完成后解析为结果数组
   */
  async start(): Promise<T[]> {
    if (this.#startPwr) return this.#startPwr.promise;

    // 固化启动时长度，便于判断 start 异步结果
    this.#startLength = this.#length;
    this.#startPwr = Promise.withResolvers<T[]>();

    if (this.#startLength === 0) {
      this.#startPwr.resolve([]);
    } else {
      this.#run();
    }

    return this.#startPwr.promise;
  }

  #running = 0;
  #run() {
    while (this.limit === 0 || this.#running < this.limit) {
      const task = this.#tasks.shift();

      // 无任务可执行
      if (!task) break;

      this.#running++;

      task
        .afn()
        .then((result) => {
          this.#running--;
          task.pwr?.resolve(result);

          // 属于启动任务
          if (task.idx < this.#startLength) {
            this.#startResults[task.idx] = result;
            this.#startResolved++;
          }

          // 所有启动任务都已执行完毕
          if (this.#startResolved === this.#startLength) {
            this.#startPwr?.resolve(this.#startResults);
          }

          this.#stopResults[task.idx] = result;
          this.#stopResolved++;

          // 所有停止任务都已执行完毕
          if (this.#stopResolved === this.#stopLength) {
            this.#stopPwr?.resolve(this.#stopResults);
          } else {
            this.#run();
          }
        })
        .catch((reason) => {
          this.#running--;
          task.pwr?.reject(reason);

          // 属于启动任务
          if (task.idx < this.#startLength) {
            this.#startRejected++;
            this.#startPwr?.reject(reason);
          }

          // 属于停止任务
          if (this.#stopLength > 0) {
            this.#stopRejected++;
            this.#stopPwr?.reject(reason);
          }
        });
    }
  }
  #stopResolved = 0;
  #stopRejected = 0;
  get stopSettled() {
    return this.#stopResolved === this.#stopLength || this.#stopRejected > 0;
  }

  #stopLength = -1;
  #stopResults: T[] = [];

  #stopPwr?: PromiseWithResolvers<T[]> | null = null;

  /**
   * 终止队列中的任务执行，终止队列后不再可以追加异步任务
   * @returns 返回一个 Promise，在所有启动任务完成后解析为结果数组
   */
  async stop() {
    if (this.#stopPwr) {
      return this.#stopPwr.promise;
    }

    this.#stopLength = this.#length;
    this.#stopPwr = Promise.withResolvers<T[]>();

    if (this.#stopLength === 0) {
      this.#stopPwr.resolve([]);
    } else {
      this.#run();
    }

    return this.#stopPwr.promise;
  }
}

/**
 * 使用给定的并发限制执行异步函数
 *
 * 此函数的目的是控制一组异步函数的并发执行数量，通过创建一个AsyncQueue实例来管理这些异步函数的执行
 * 它确保在任何给定时间只有最多`limit`数量的异步函数被执行，以避免潜在的性能问题或资源竞争
 *
 * @param asyncFns 一个包含异步函数的数组，每个异步函数都不需要参数，并返回一个Promise
 * @param limit 并发限制的数量，表示同时执行的异步函数的最大数量，0 表示不限制
 * @returns 返回一个Promise，当所有异步函数都执行完毕后，该Promise将被解析
 */
export function asyncLimit<T>(asyncFns: Array<() => Promise<T>>, limit: number) {
  const aq = new AsyncQueue<T>(asyncFns, { limit });
  return aq.start();
}

/**
 * 异步共享函数的配置选项
 */
export type AsyncSharedOptions<I extends AnyArray, O> = {
  /**
   * 是否在调用结束后再执行（只在运行期间有再次调用时才会生效）
   * @type {boolean}
   * @default false
   * @example
   * const sharedFn = asyncShared(fetchData, { trailing: true });
   * // 如果在 fetchData 执行期间多次调用 sharedFn，则会在 fetchData 结束后再次执行
   */
  trailing?: boolean;

  /**
   * 缓存结果的最大有效期（毫秒）
   * @type {number}
   * @example
   * const sharedFn = asyncShared(fetchData, { maxAge: 1000 });
   * // 在 1 秒内调用 sharedFn 会直接返回缓存结果
   */
  maxAge?: number;

  /**
   * 在调用共享函数时触发的回调函数
   * @param inputs - 传递给共享函数的参数
   * @example
   * const options: AsyncSharedOptions<typeof fetchData> = {
   *   onTrigger: (...args) => console.log('Calling with:', args)
   * };
   */
  onTrigger?: (...inputs: I) => unknown;

  /**
   * 在执行异步函数时触发的回调函数
   * @param args - 传递给异步函数的参数
   * @example
   * const options: AsyncSharedOptions<typeof fetchData> = {
   *   onExecute: (...args) => console.log('Executing with:', args)
   * };
   */
  onExecute?: (...args: I) => unknown;

  /**
   * 在异步函数成功执行后触发的回调函数
   * @param output - 异步函数的返回结果
   * @example
   * const options: AsyncSharedOptions<typeof fetchData> = {
   *   onSuccess: (result) => console.log('Success:', result)
   * };
   */
  onSuccess?: (output: O) => unknown;

  /**
   * 在异步函数执行失败时触发的回调函数
   * @param error - 异步函数抛出的错误
   * @example
   * const options: AsyncSharedOptions<typeof fetchData> = {
   *   onError: (error) => console.error('Error:', error)
   * };
   */
  onError?: (error: unknown) => unknown;

  /**
   * 在异步函数执行完成（无论成功或失败）时触发的回调函数
   * @example
   * const options: AsyncSharedOptions<typeof fetchData> = {
   *   onFinally: () => console.log('Execution completed')
   * };
   */
  onFinally?: () => unknown;
};

/**
 * 创建一个共享执行结果的异步函数
 * @template F - 异步函数类型
 * @param {F} af - 要共享的异步函数
 * @param {AsyncSharedOptions} [options] - 配置选项
 * @returns {F} 返回一个新的异步函数，该函数会共享执行结果
 * @example
 * const fetchData = async (id) => {
 *   // 模拟异步操作
 *   return await fetch(`/api/data/${id}`);
 * };
 *
 * const sharedFetch = asyncShared(fetchData, { maxAge: 1000 });
 *
 * // 多次调用会共享同一个请求
 * const result1 = await sharedFetch(1);
 * const result2 = await sharedFetch(1); // 上次请求完成后 1000ms 内直接返回缓存结果
 */
export function asyncShared<I extends AnyArray, O>(
  af: (...inputs: I) => Promise<O>,
  options?: AsyncSharedOptions<I, O>,
) {
  let executedPromise: Promise<O> | undefined;
  let executing = false;
  let executingInputs: I | undefined;
  let executedTime = 0;

  const _sharedAf = async (from: 'trigger' | 'trailing', ...inputs: I) => {
    executingInputs = inputs;

    // 如果正在运行，则复用运行结果
    if (executing && executedPromise) {
      return executedPromise;
    }

    // 如果已运行结束空闲时，判断是否在等待时间内
    if (executedPromise && Date.now() - executedTime < (options?.maxAge || 0)) {
      return executedPromise;
    }

    // 否则直接执行
    executing = true;
    options?.onExecute?.(...executingInputs);
    executedPromise = af(...executingInputs);
    executingInputs = undefined;
    executedPromise
      .then((res) => {
        options?.onSuccess?.(res);
      })
      .catch((err) => {
        options?.onError?.(err);
      })
      .finally(() => {
        executing = false;
        executedTime = Date.now();
        options?.onFinally?.();

        // 执行期间多次调用，则重新执行
        if (executingInputs && options?.trailing) {
          _sharedAf('trailing', ...executingInputs);
        }
      });

    return executedPromise;
  };

  return function sharedAf(...inputs: I): Promise<O> {
    options?.onTrigger?.(...inputs);
    const p = _sharedAf('trigger', ...inputs);
    // 必须捕获错误，否则单测错误边界时会抛错
    p.catch(fnNoop);
    return p;
  };
}

// const af1 = asyncShared(async () => {
//   return 1;
// });
// const n = await af1();

// const af2 = asyncShared(async (a: number) => {
//   return a + 1;
// });
// const n2 = await af2(2);
