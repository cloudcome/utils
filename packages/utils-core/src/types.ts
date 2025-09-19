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
 * 原始值类型
 * @description 包含 JavaScript 中的所有原始类型，包括 string、number、boolean、bigint、symbol、null、undefined，以及 void 和 never
 * @example
 * ```typescript
 * type Primitive = PrimitiveValue;
 * // string | number | boolean | bigint | symbol | null | undefined | void | never
 * ```
 */
// biome-ignore lint/suspicious/noConfusingVoidType: void 类型在此处是必要的，用于表示无返回值的函数类型
export type PrimitiveValue = string | number | boolean | bigint | symbol | null | undefined | void | never;

/**
 * 引用类型值
 * @description 表示所有非原始类型的值，即除了 PrimitiveValue 之外的所有类型
 * @example
 * ```typescript
 * const obj: ReferenceValue = { a: 1 };
 * const arr: ReferenceValue = [1, 2, 3];
 * const func: ReferenceValue = () => {};
 * ```
 */
export type ReferenceValue = object;

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
 * @example
 * ```typescript
 * type PartialObj = DeepPartial<{ a: 1, b: { c: 2 } }>;
 * // { a?: 1 | undefined, b?: { c?: 2 | undefined } | undefined }
 * ```
 */
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

/**
 * 将联合类型转换为交叉类型
 * @ref https://juejin.cn/post/6994102811218673700#heading-24
 * @template T - 联合类型
 * @example
 * ```typescript
 * type Result = UnionToIntersection<{ a: 1 } | { b: 2 }>;
 * // { a: 1 } & { b: 2 }
 * ```
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type UnionToIntersection<T> = (T extends any ? (arg: T) => void : never) extends (arg: infer U) => void
  ? U
  : never;

/**
 * 从联合类型中提取最后一个类型
 * @template U - 联合类型
 */
type _UnionLast<U> = UnionToIntersection<U extends U ? (x: U) => 0 : never> extends (x: infer L) => 0 ? L : never;

/**
 * 将联合类型转换为元组类型
 * @template U - 联合类型
 * @template Last - 联合类型中的最后一个类型
 * @example
 * ```ts
 * type T3 = UnionToTuple<'a' | 'b' | 'c' | 'd'>;
 * // ['a', 'b', 'c', 'd']
 * ```
 */
export type UnionToTuple<U, Last = _UnionLast<U>> = [U] extends [never]
  ? []
  : [...UnionToTuple<Exclude<U, Last>>, Last];

/**
 * 将交叉类型合并为一个对象类型
 * @template A - 交叉类型
 * @example
 * ```typescript
 * type Merged = MergeIntersection<{ a: string } & { b: number }>;
 * // { a: string; b: number }
 * ```
 */
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

/**
 * 判断是否是空对象
 * @example
 * ```typescript
 * type Result = IsEmptyObject<{}>; // true
 * type Result2 = IsEmptyObject<{ a: 1 }>; // false
 * ```
 */
export type IsEmptyObject<T> = keyof T extends never ? true : false;

/**
 * 判断对象是否只有一个属性
 * @example
 * ```typescript
 * type Result = IsOnlyProperty<{ a: 1 }, 'a'>; // true
 * type Result2 = IsOnlyProperty<{ a: 1, b: 2 }, 'a'>; // false
 * ```
 */
export type IsOnlyProperty<T, P> = keyof T extends P ? true : false;

/**
 * 判断对象是否具有指定属性
 * @example
 * ```typescript
 * type Result = HasProperty<{ a: 1, b: 2 }, 'a'>; // true
 * type Result2 = HasProperty<{ a: 1, b: 2 }, 'c'>; // false
 * ```
 */
export type HasProperty<T, K> = K extends keyof T ? true : false;

/**
 * 精确匹配类型
 * @description 检查类型 T 是否精确匹配给定的形状 Shape。如果 T 包含 Shape 中不存在的额外属性，则不匹配。
 * @template T - 要检查的类型
 * @template Shape - 期望的形状/结构
 * @example
 * ```typescript
 * type Result1 = Exact<{ a: 1 }, { a: 1 }>; // { a: 1 }
 * type Result2 = Exact<{ a: 1; b: 2 }, { a: 1 }>; // never
 * type Result3 = Exact<{ a: 1 }, { a: 1; b: 2 }>; // never
 * ```
 */
export type Exact<T, Shape> = T extends Shape ? (Exclude<keyof T, keyof Shape> extends never ? T : never) : never;
