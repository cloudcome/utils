/**
 * 任意对象
 */
export type AnyObject = Record<PropertyKey, unknown>;

/**
 * 返回对象的所有键名，并且键名都是字符串类型
 * @example
 * ```typescript
 * type Keys = KeysOf<{ a: 1, 2: 2, [Symbol()]: 3 }>
 * // 'a' | '2'
 * ```
 */
export type KeysOf<T> = { [P in keyof T]: P extends string ? P : P extends number ? `${P}` : never }[keyof T];

/**
 * 任意数组
 */
export type AnyArray = unknown[];

/**
 * 任意函数
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type AnyFunction = (...args: any[]) => any;

/**
 * 任意异步函数
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type AnyAsyncFunction = (...args: any[]) => Promise<any>;

/**
 * 可能是 Promise 的类型
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * 可能是可执行的类型
 */
export type MaybeCallable<T> = T | (() => T);
