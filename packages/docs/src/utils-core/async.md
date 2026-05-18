---
outline: deep
---

# async

异步任务队列与共享执行工具。

## 导入

```typescript
import {
  AsyncQueue,
  asyncLimit,
  asyncShared,
  type AsyncQueueOptions,
  type AsyncSharedOptions,
} from '@cloudcome/utils-core/async';
```

## 类型定义

### AsyncQueueOptions

异步任务队列的配置选项。

```typescript
type AsyncQueueOptions = {
  limit?: number;
};
```

**属性说明**

| 属性  | 类型     | 默认值 | 描述                       |
| ----- | -------- | ------ | -------------------------- |
| limit | `number` | `0`    | 并发限制数，`0` 表示无限制 |

### AsyncSharedOptions\<I, O\>

异步共享函数的配置选项。

```typescript
type AsyncSharedOptions<I extends AnyArray, O> = {
  trailing?: boolean;
  maxAge?: number;
  onTrigger?: (...inputs: I) => unknown;
  onExecute?: (...args: I) => unknown;
  onSuccess?: (output: O) => unknown;
  onError?: (error: unknown) => unknown;
  onFinally?: () => unknown;
};
```

**属性说明**

| 属性      | 类型                          | 默认值  | 描述                                                       |
| --------- | ----------------------------- | ------- | ---------------------------------------------------------- |
| trailing  | `boolean`                     | `false` | 是否在调用结束后再执行（只在运行期间有再次调用时才会生效） |
| maxAge    | `number`                      | -       | 缓存结果的最大有效期（毫秒）                               |
| onTrigger | `(...inputs: I) => unknown`   | -       | 在调用共享函数时触发的回调                                 |
| onExecute | `(...args: I) => unknown`     | -       | 在执行异步函数时触发的回调                                 |
| onSuccess | `(output: O) => unknown`      | -       | 在异步函数成功执行后触发的回调                             |
| onError   | `(error: unknown) => unknown` | -       | 在异步函数执行失败时触发的回调                             |
| onFinally | `() => unknown`               | -       | 在异步函数执行完成（无论成功或失败）时触发的回调           |

## 类

### AsyncQueue\<T\>

异步任务队列，用于管理和控制异步任务的执行。

```typescript
class AsyncQueue<T> {
  constructor(asyncFns: Array<() => Promise<T>>, options?: AsyncQueueOptions);

  get length(): number;
  get limit(): number;
  get startSettled(): boolean;
  get stopSettled(): boolean;

  push(afn: () => Promise<T>): Promise<T>;
  unshift(afn: () => Promise<T>): Promise<T>;
  start(): Promise<T[]>;
  stop(): Promise<T[]>;
}
```

**构造函数**

| 参数     | 类型                      | 描述                 |
| -------- | ------------------------- | -------------------- |
| asyncFns | `Array<() => Promise<T>>` | 要执行的异步函数数组 |
| options  | `AsyncQueueOptions`       | 可选，队列配置选项   |

**属性**

| 属性         | 类型      | 描述                                 |
| ------------ | --------- | ------------------------------------ |
| length       | `number`  | 队列中的任务总数                     |
| limit        | `number`  | 并发限制数                           |
| startSettled | `boolean` | 启动任务是否已全部完成（成功或失败） |
| stopSettled  | `boolean` | 停止任务是否已全部完成（成功或失败） |

**方法**

| 方法           | 返回值         | 描述                                             |
| -------------- | -------------- | ------------------------------------------------ |
| `push(afn)`    | `Promise<T>`   | 向队列尾部追加任务并执行                         |
| `unshift(afn)` | `Promise<T>`   | 向队列头部插入任务并执行                         |
| `start()`      | `Promise<T[]>` | 启动队列中的任务执行，返回所有启动任务的结果数组 |
| `stop()`       | `Promise<T[]>` | 终止队列，不再接受新任务，返回所有任务的结果数组 |

**示例**

```typescript
const tasks = [
  () => promiseDelay(100).then(() => 1),
  () => promiseDelay(200).then(() => 2),
  () => promiseDelay(300).then(() => 3),
];

const queue = new AsyncQueue(tasks, { limit: 2 });

// 动态追加任务
queue.push(() => promiseDelay(100).then(() => 4));

// 启动执行
const results = await queue.start();
console.log(results); // [1, 2, 3, 4]
```

## 函数

### asyncLimit

使用给定的并发限制执行异步函数。

```typescript
function asyncLimit<T>(asyncFns: Array<() => Promise<T>>, limit: number): Promise<T[]>;
```

**参数**

| 参数     | 类型                      | 描述                         |
| -------- | ------------------------- | ---------------------------- |
| asyncFns | `Array<() => Promise<T>>` | 异步函数数组                 |
| limit    | `number`                  | 并发限制数量，`0` 表示不限制 |

**返回值**

`Promise<T[]>` - 所有异步函数执行完毕后的结果数组

**示例**

```typescript
const tasks = [
  () => fetch('/api/1').then((r) => r.json()),
  () => fetch('/api/2').then((r) => r.json()),
  () => fetch('/api/3').then((r) => r.json()),
];

// 最多同时执行 2 个请求
const results = await asyncLimit(tasks, 2);
```

### asyncShared

创建一个共享执行结果的异步函数，避免重复请求。

```typescript
function asyncShared<I extends AnyArray, O>(
  af: (...inputs: I) => Promise<O>,
  options?: AsyncSharedOptions<I, O>,
): (...inputs: I) => Promise<O>;
```

**参数**

| 参数    | 类型                           | 描述             |
| ------- | ------------------------------ | ---------------- |
| af      | `(...inputs: I) => Promise<O>` | 要共享的异步函数 |
| options | `AsyncSharedOptions<I, O>`     | 可选，配置选项   |

**返回值**

`(...inputs: I) => Promise<O>` - 共享执行结果的异步函数

**示例**

```typescript
const fetchData = async (id: number) => {
  return fetch(`/api/data/${id}`).then((r) => r.json());
};

const sharedFetch = asyncShared(fetchData, { maxAge: 1000 });

// 多次调用会共享同一个请求
const [result1, result2] = await Promise.all([sharedFetch(1), sharedFetch(1)]);
// 只发起了一次请求，result1 和 result2 相同
```
