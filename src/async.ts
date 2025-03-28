type AsyncTask<T> = {
  idx: number;
  afn: () => Promise<T>;
  pwr?: PromiseWithResolvers<T>;
};

class AsyncQueue<T> {
  #tasks: AsyncTask<T>[] = [];
  #length = 0;

  constructor(
    asyncFns: Array<() => Promise<T>>,
    readonly options: {
      limit: number;
      infinity?: boolean;
    },
  ) {
    asyncFns.forEach((afn, idx) => {
      this.#add(afn);
    });
  }

  get length() {
    return this.#length;
  }

  get limit() {
    return this.options.limit;
  }

  get infinity() {
    return this.options.infinity;
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
    const pwr = Promise.withResolvers<T>();
    this.#add(afn, pwr);

    if (this.#startPwr && this.#running === 0) {
      this.#run();
    }

    return pwr;
  }

  #startResolved = 0;
  #startRejected = 0;
  get startSettled() {
    return this.#startResolved === this.#startLength || this.#startRejected > 0;
  }

  #startResults: T[] = [];
  #startPwr: PromiseWithResolvers<T[]> | null = null;
  #startLength = 0;
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

          this.#run();
        })
        .catch((reason) => {
          this.#running--;
          task.pwr?.reject(reason);

          // 属于启动任务
          if (task.idx < this.#startLength) {
            this.#startRejected++;
            this.#startPwr?.reject(reason);
          }
        });
    }
  }
}

export function createAsyncQueue() {}

export function asyncLimit<T>(asyncFns: Array<() => Promise<T>>, limit: number) {
  const aq = new AsyncQueue<T>(asyncFns, { limit });
  return aq.start();
}
