// 这里的 AnyObject 类型是为了解决以下场景的兼容性
// interface Cache {
//   id?: string | (() => string)
// }

// interface Options {
//   cache?: string | (() => string) | Cache
// }

// function isObject<T>(unknown: T): unknown is AnyObject<T> {
//   return typeof unknown === 'object' && unknown !== null;
// }

// function test(options: Options) {
//   const cache = options.cache;

//   if (isObject(cache)) {
//     // 如果不对 AnyObject 类型进行修正的话，这里会出现 object | function 联合类型
//     cache;
//   } else {
//     cache;
//   }
// }
/**
 * 任意对象
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type AnyObject<T = any> = T extends AnyFunction ? never : T extends object ? T : never;

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
