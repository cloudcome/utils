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
export type AnyArray = Array<unknown>;

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

/**
 * 深度部分类型
 */
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

// https://juejin.cn/post/6994102811218673700#heading-24

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type UnionToIntersection<T> = (T extends any ? (arg: T) => void : never) extends (arg: infer U) => void
  ? U
  : never;
// type T0 = UnionToIntersection<{ key1: string } | { key2: number }>;

/**
 * 从联合类型中提取最后一个类型
 * @template U - 联合类型
 */
type _UnionLast<U> = UnionToIntersection<U extends U ? (x: U) => 0 : never> extends (x: infer L) => 0 ? L : never;

/**
 * 将联合类型转换为元组类型
 * @template U - 联合类型
 * @template Last - 联合类型中的最后一个类型
 */
export type UnionToTuple<U, Last = _UnionLast<U>> = [U] extends [never]
  ? []
  : [...UnionToTuple<Exclude<U, Last>>, Last];

// type T2 = LastInUnion<'a' | 'b' | 'c' | 'd'>;
// type T3 = UnionToTuple<'a' | 'b' | 'c' | 'd'>;
// ['a', 'b', 'c', 'd']

// https://juejin.cn/post/7187963986875252795#heading-4
// type Merged = MergeIntersection<{ a: string } & { b: number }>;
// { a: string; b: number }
export type MergeIntersection<A> = A extends infer T ? { [Key in keyof T]: T[Key] } : never;

/**
 * 以小写字母开头的字符串类型
 */
export type LowercaseStartString =
  `${'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'}${string}`;

/**
 * 以大写字母开头的字符串类型
 */
export type UppercaseStartString =
  `${'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z'}${string}`;
