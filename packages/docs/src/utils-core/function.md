---
outline: deep
---

# function

函数工具，提供防抖、节流、单次执行等函数包装器。

## 导入

```typescript
import {
  fnNoop,
  fnDebounce,
  fnThrottle,
  fnOnce,
  fnRetry,
  type DebounceOptions,
  type ThrottleOptions,
  type FnRetryOptions,
} from '@cloudcome/utils-core/function';
```

## 类型定义

### DebounceOptions

防抖函数的配置选项。

```typescript
type DebounceOptions = {
  wait: number;
  leading?: boolean;
};
```

**属性说明**

| 属性    | 类型      | 默认值  | 描述                         |
| ------- | --------- | ------- | ---------------------------- |
| wait    | `number`  | -       | 等待时间（毫秒）             |
| leading | `boolean` | `false` | 是否在等待开始时立即执行一次 |

### ThrottleOptions

节流函数的配置选项。

```typescript
type ThrottleOptions = {
  wait: number;
  leading?: boolean;
  trailing?: boolean;
};
```

**属性说明**

| 属性     | 类型      | 默认值  | 描述                               |
| -------- | --------- | ------- | ---------------------------------- |
| wait     | `number`  | -       | 等待时间（毫秒）                   |
| leading  | `boolean` | `false` | 是否在第一次调用时立即执行         |
| trailing | `boolean` | `false` | 是否在调用结束后等待一段时间再执行 |

### FnRetryOptions

重试函数的配置选项。

```typescript
type FnRetryOptions = {
  maxAttempts?: number;
  delay?: number;
  skipRetry?: (error: unknown) => boolean;
};
```

**属性说明**

| 属性        | 类型                          | 默认值 | 描述                                                                             |
| ----------- | ----------------------------- | ------ | -------------------------------------------------------------------------------- |
| maxAttempts | `number`                      | `3`    | 最大尝试次数                                                                     |
| delay       | `number`                      | `0`    | 每次重试之间的延迟时间（毫秒）                                                   |
| skipRetry   | `(error: unknown) => boolean` | -      | 自定义跳过重试条件，返回 `true` 时跳过重试（即不重试该错误）；默认所有错误均重试 |

## 函数

### fnNoop

空操作函数，不执行任何操作。

```typescript
function fnNoop(): void;
```

**示例**

```typescript
fnNoop(); // 不执行任何操作

// 常用作默认回调
const callback = optionalCallback || fnNoop;
```

### fnDebounce

创建一个防抖函数，在指定的等待时间后执行。如果在等待时间内再次调用，则重新计时。

```typescript
function fnDebounce<F extends AnyFunction>(
  fn: F,
  wait: number | DebounceOptions,
): ((...args: Parameters<F>) => void) & { cancel: () => void };
```

**参数**

| 参数 | 类型                        | 描述                           |
| ---- | --------------------------- | ------------------------------ |
| fn   | `F`                         | 需要防抖的函数                 |
| wait | `number \| DebounceOptions` | 等待时间（毫秒）或配置选项对象 |

**返回值**

`((...args: Parameters<F>) => void) & { cancel: () => void }` - 防抖后的函数，签名与原函数参数一致但返回值始终为 `void`，带有 `cancel` 方法用于取消防抖

**示例**

```typescript
const debouncedFn = fnDebounce(() => {
  console.log('执行');
}, 100);

debouncedFn(); // 不会立即执行
debouncedFn(); // 重新计时
// 100ms 后输出: 执行

debouncedFn.cancel(); // 取消防抖

// 使用 leading 选项
const debouncedFn2 = fnDebounce(
  () => {
    console.log('执行');
  },
  { wait: 100, leading: true },
);

debouncedFn2(); // 立即输出: 执行
debouncedFn2(); // 重新计时
```

### fnThrottle

创建一个节流函数，在指定的等待时间内最多执行一次。

```typescript
function fnThrottle<F extends AnyFunction>(
  fn: F,
  wait: number | ThrottleOptions,
): ((...args: Parameters<F>) => void) & { cancel: () => void };
```

**参数**

| 参数 | 类型                        | 描述                           |
| ---- | --------------------------- | ------------------------------ |
| fn   | `F`                         | 需要节流的函数                 |
| wait | `number \| ThrottleOptions` | 等待时间（毫秒）或配置选项对象 |

**返回值**

`((...args: Parameters<F>) => void) & { cancel: () => void }` - 节流后的函数，签名与原函数参数一致但返回值始终为 `void`，带有 `cancel` 方法用于取消节流

**示例**

```typescript
const throttledFn = fnThrottle(() => {
  console.log('执行');
}, 100);

throttledFn(); // 开始计时
throttledFn(); // 忽略
// 100ms 后输出: 执行

throttledFn.cancel(); // 取消节流

// 使用 leading 和 trailing
const throttledFn2 = fnThrottle(
  () => {
    console.log('执行');
  },
  { wait: 100, leading: true, trailing: true },
);

throttledFn2(); // 立即输出: 执行
throttledFn2(); // 忽略，但会在 100ms 后输出: 执行
```

### fnOnce

创建一个只执行一次的函数，后续调用返回第一次的结果。

```typescript
function fnOnce<F extends AnyFunction>(fn: F): (...args: Parameters<F>) => ReturnType<F>;
```

**参数**

| 参数 | 类型 | 描述                 |
| ---- | ---- | -------------------- |
| fn   | `F`  | 需要只执行一次的函数 |

**返回值**

`(...args: Parameters<F>) => ReturnType<F>` - 只执行一次的函数，参数签名与原函数一致，第一次调用后缓存并返回结果

**示例**

```typescript
const onceFn = fnOnce(() => {
  console.log('只会输出一次');
  return 42;
});

console.log(onceFn()); // 输出: 只会输出一次  42
console.log(onceFn()); // 输出: 42（不执行函数体）
```

### fnRetry

创建一个带重试能力的函数，失败时自动重试直到成功或耗尽次数。

```typescript
function fnRetry<F extends AnyFunction>(
  fn: F,
  options?: FnRetryOptions,
): (...args: Parameters<F>) => Promise<Awaited<ReturnType<F>>>;
```

**参数**

| 参数    | 类型             | 描述           |
| ------- | ---------------- | -------------- |
| fn      | `F`              | 需要重试的函数 |
| options | `FnRetryOptions` | 重试配置选项   |

**返回值**

`(...args: Parameters<F>) => Promise<Awaited<ReturnType<F>>>` - 带重试能力的函数，参数签名与原函数一致，返回值为 `Promise`，类型为原函数返回值的 `Awaited` 解包。

**重试逻辑**

1. 最多尝试 `maxAttempts` 次（默认 3 次）
2. 每次失败后等待 `delay` 毫秒（默认 0，即不等待）
3. 如果提供了 `skipRetry` 回调，仅当回调返回 `false` 时才重试（即返回 `true` 时跳过重试）；默认所有错误均重试
4. 所有尝试均失败后，抛出最后一次捕获的错误

**示例**

```typescript
// 基本用法：最多重试 3 次，每次间隔 1 秒
const fetchData = fnRetry(
  async () => {
    return await api.request('/data');
  },
  { maxAttempts: 3, delay: 1000 },
);

// 第1次失败 → 等待1s → 第2次失败 → 等待1s → 第3次成功 → 返回结果
const result = await fetchData();
```

```typescript
// 使用 skipRetry 自定义跳过重试条件
const fetchWithRetry = fnRetry(
  async () => {
    return await api.request('/data');
  },
  {
    maxAttempts: 5,
    delay: 500,
    skipRetry: (error) => {
      // 4xx 错误跳过重试，网络错误和 5xx 错误继续重试
      if (error instanceof NetworkError) return false;
      if (error.status >= 500) return false;
      return true; // 4xx 错误跳过重试
    },
  },
);
```
