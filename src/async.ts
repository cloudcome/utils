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
 * 异步队列的配置选项
 */
export interface AsyncQueueOptions {
  /**
   * 并发限制数，0 表示无限制
   * @default 0
   */
  limit?: number;
  /**
   * 是否允许无限添加任务
   * @default false
   */
  infinity?: boolean;
}

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
      this.#add(afn);
    });
  }

  get length() {
    return this.#length;
  }

  get limit() {
    return this.options?.limit || 0;
  }

  get infinity() {
    return this.options?.infinity || false;
  }

  #add(afn: () => Promise<T>, pwr?: PromiseWithResolvers<T>) {
    // const pwr = Promise.withResolvers<T>();
    this.#tasks.push({
      idx: this.#length++,
      afn: afn,
      pwr: pwr,
    });
  }

  async add(afn: () => Promise<T>) {
    // 明确终止了
    if (this.#stopLength > 0) {
      throw new Error('异步队列已被终止，无法添加新的任务');
    }

    const pwr = Promise.withResolvers<T>();
    this.#add(afn, pwr);

    if (this.#startPwr && this.#running === 0) {
      this.#run();
    }

    return pwr.promise;
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

  #stopLength = 0;
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
