import { isArray, isObject, isUndefined, typeIs } from './is';
import type { AnyArray, AnyObject, MaybePromise } from './types';

/**
 * 遍历对象的每个键值对，并对每个键值对执行提供的回调函数。
 *
 * @param obj - 要遍历的对象。
 * @param iterator - 对每个键值对执行的回调函数。如果回调函数返回 false，则提前终止遍历。
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2, c: 3 };
 * const results: [string, number][] = [];
 * objectEach(obj, (val, key) => {
 *   results.push([key, val]);
 * });
 * console.log(results); // [['a', 1], ['b', 2], ['c', 3]]
 * ```
 */
export function objectEach<O extends AnyObject, K extends keyof O & (string | number)>(
  obj: O,
  iterator: (this: O, val: O[K], key: K) => false | unknown,
): void {
  for (const [key, val] of Object.entries(obj)) {
    if (iterator.call(obj, val as O[K], key as K) === false) {
      break;
    }
  }
}

/**
 * 异步遍历对象的每个键值对，并对每个键值对执行提供的回调函数。
 *
 * @param obj - 要遍历的对象。
 * @param iterator - 对每个键值对执行的异步回调函数。如果回调函数返回 false，则提前终止遍历。
 * @returns 返回一个 Promise，当所有异步操作完成后，Promise 会被 resolve。
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2, c: 3 };
 * const results: [string, number][] = [];
 * await objectEachAsync(obj, async (val, key) => {
 *   results.push([key, val]);
 * });
 * console.log(results); // [['a', 1], ['b', 2], ['c', 3]]
 * ```
 */
export async function objectEachAsync<O extends AnyObject, K extends keyof O & (string | number)>(
  obj: O,
  iterator: (this: O, val: O[K], key: K) => MaybePromise<false | unknown>,
): Promise<void> {
  for (const [key, val] of Object.entries(obj)) {
    if ((await iterator.call(obj, val as O[K], key as K)) === false) {
      break;
    }
  }
}

export interface MergeRule {
  /**
   * 处理冲突
   * @param target - 目标对象
   * @param source - 源对象
   * @param key - 键名
   * @returns 返回 true 表示继续处理，否则返回 false
   */
  next: (info: {
    target: AnyObject | AnyArray;
    source: AnyObject | AnyArray;
    key: string | number;
  }) => boolean;

  /**
   * 处理赋值
   * @param target - 目标对象
   * @param source - 源对象
   * @param key - 键名
   * @returns 返回处理后的值
   */
  assign: (info: {
    target: AnyObject | AnyArray;
    source: AnyObject | AnyArray;
    key: string | number;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    merge: () => any;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  }) => any;
}

function internal_objectMerge(
  mergeRule: MergeRule,
  target: AnyObject | AnyArray,
  ...sources: (AnyObject | AnyArray)[]
) {
  const seen = new WeakMap<AnyObject | AnyArray, AnyObject | AnyArray>();
  const { assign, next } = mergeRule;
  const align = (target: AnyObject | AnyArray, source: AnyObject | AnyArray) => {
    const targetType = typeIs(target);
    const sourceType = typeIs(source);

    if (targetType === sourceType) {
      return target;
    }

    return sourceType === 'array' ? [] : {};
  };
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const each = (source: AnyObject | AnyArray, iterator: (val: any, key: string | number) => void) => {
    if (isObject(source)) {
      objectEach(source, iterator);
    } else {
      source.forEach(iterator);
    }
  };

  const merge = (target: AnyObject | AnyArray, source: AnyObject | AnyArray): AnyObject | AnyArray => {
    // 如果循环引用了，则直接返回目标对象
    if (seen.has(source)) {
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      return seen.get(source)!;
    }

    // 对齐目标对象和源对象
    const merged = align(target, source);

    // 存储循环引用
    seen.set(source, merged);

    // 遍历源对象
    each(source, (value, key) => {
      if (!next({ target: merged, source, key })) {
        return;
      }

      if (isObject(value) || isArray(value)) {
        // @ts-expect-error
        merged[key] = assign({
          target: merged,
          source,
          key,
          // @ts-expect-error
          merge: () => merge(merged[key], value),
        });
      } else {
        // @ts-expect-error
        merged[key] = assign({
          target: merged,
          source,
          key,
          merge: () => value,
        });
      }
    });

    return merged;
  };

  let returnTarget = target;

  for (const source of sources) {
    returnTarget = merge(target, source);
  }

  return returnTarget;
}

/**
 * 合并多个对象或数组。如果遇到循环引用，则直接返回目标对象。
 *
 * @param target - 目标对象或数组。
 * @param sources - 要合并的源对象或数组。
 * @returns 合并后的对象或数组。
 *
 * @example
 * ```typescript
 * const obj1 = { a: 1, b: { x: 10 } };
 * const obj2 = { b: { y: 20 }, c: 3 };
 * const merged = objectMerge(obj1, obj2);
 * console.log(merged); // { a: 1, b: { x: 10, y: 20 }, c: 3 }
 * ```
 */
export function objectMerge(target: AnyObject | AnyArray, ...sources: (AnyObject | AnyArray)[]) {
  return internal_objectMerge(
    {
      next() {
        return true;
      },
      assign({ merge }) {
        return merge();
      },
    },
    target,
    ...sources,
  );
}

/**
 * 为对象设置默认值。如果目标对象中的属性为 `undefined`，则使用默认对象中的属性值。
 * 支持多个默认对象，优先级从左到右依次降低。
 * 如果目标对象中的属性已经是对象或数组，则递归地设置默认值。
 *
 * @param target - 目标对象或数组。
 * @param sources - 默认对象或数组。
 * @returns 合并后的对象或数组。
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: undefined };
 * const defaults = { a: 4, b: 2, c: 3 };
 * const result = objectDefaults(obj, defaults);
 * console.log(result); // { a: 1, b: 2, c: 3 }
 *
 * const obj2 = { a: 1, b: 2 };
 * const defaults2 = { a: 5, b: 3, c: 4 };
 * const result2 = objectDefaults(obj2, defaults2);
 * console.log(result2); // { a: 1, b: 2, c: 4 }
 *
 * const obj3 = { a: { x: 1 }, b: undefined };
 * const defaults3 = { a: { x: 4, z: 3 }, b: { y: 2 } };
 * const result3 = objectDefaults(obj3, defaults3);
 * console.log(result3); // { a: { x: 1, z: 3 }, b: { y: 2 } }
 * ```
 */
export function objectDefaults(target: AnyObject | AnyArray, ...sources: (AnyObject | AnyArray)[]) {
  return internal_objectMerge(
    {
      next({ target, source, key }) {
        // @ts-expect-error
        return target[key] === undefined || isObject(target[key]) || isArray(target[key]);
      },
      assign({ merge }) {
        return merge();
      },
    },
    target,
    ...sources,
  );
}

/**
 * 从对象中选择指定键的属性，返回一个新的对象。
 *
 * @param object - 要从中选择属性的对象。
 * @param keys - 要选择的键数组。
 * @returns 包含指定键属性的新对象。
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2, c: 3 };
 * const result = objectPick(obj, ['a', 'c']);
 * console.log(result); // { a: 1, c: 3 }
 * ```
 */
export function objectPick<T extends AnyObject, K extends keyof T>(object: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in object) {
      result[key] = object[key];
    }
  }
  return result;
}

/**
 * 从对象中排除指定键的属性，返回一个新的对象。
 *
 * @param object - 要从中排除属性的对象。
 * @param keys - 要排除的键数组。
 * @returns 排除指定键属性后的新对象。
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2, c: 3, d: 4 };
 * const result = objectOmit(obj, ['a', 'd']);
 * console.log(result); // { b: 2, c: 3 }
 * ```
 */
export function objectOmit<T extends AnyObject, K extends keyof T>(object: T, keys: K[]): Omit<T, K> {
  const result = {} as Omit<T, K>;
  for (const key in object) {
    if (!keys.includes(key as unknown as K)) {
      // @ts-expect-error
      result[key] = object[key];
    }
  }
  return result;
}

/**
 * 遍历对象的每个键值对，并对每个键值对执行提供的映射函数，返回一个新的对象。
 *
 * @param object - 要遍历的对象。
 * @param mapper - 对每个键值对执行的映射函数。
 * @returns 返回一个新的对象，其中每个值都是通过映射函数处理后的结果。
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2, c: 3 };
 * const result = objectMap(obj, (val, key) => String(val * 2));
 * console.log(result); // { a: '2', b: '4', c: '6' }
 * ```
 */
export function objectMap<T extends AnyObject, V>(
  object: T,
  mapper: (value: T[keyof T], key: keyof T) => V,
): Record<keyof T, V> {
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => [
      key,
      mapper(
        // @ts-expect-error
        value,
        key as keyof T,
      ),
    ]),
  ) as Record<keyof T, V>;
}

// @ref https://stackoverflow.com/a/67609485

type Idx<T, K> = K extends keyof T
  ? T[K]
  : number extends keyof T
    ? K extends `${number}`
      ? T[number]
      : never
    : never;

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${'' extends P ? '' : '.'}${P}`
    : never
  : never;

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]];

export type ObjectPath<O, D extends number = 4> = [D] extends [never]
  ? never
  : O extends object
    ? {
        [K in keyof O]-?: K extends string | number ? `${K}` | Join<K, ObjectPath<O[K], Prev[D]>> : never;
      }[keyof O]
    : '';

export type ObjectLeafPath<O, D extends number = 4> = [D] extends [never]
  ? never
  : O extends object
    ? {
        [K in keyof O]-?: K extends string | number
          ? O[K] extends string | number
            ? `${K}` | Join<K, ObjectLeafPath<O[K], Prev[D]>>
            : Join<K, ObjectLeafPath<O[K], Prev[D]>>
          : never;
      }[keyof O]
    : '';

export type ObjectPathValue<O, P extends ObjectPath<O, 4>> = P extends `${infer Key}.${infer Rest}`
  ? Rest extends ObjectPath<Idx<O, Key>, 4>
    ? ObjectPathValue<Idx<O, Key>, Rest>
    : never
  : Idx<O, P>;

function pathToKeys(path: string | string[]) {
  // 下文用到该数组时会进行修改操作，因此复制一份
  if (isArray(path)) return [...path];

  let pathFinal = path.replace(/\[(\w+)\]/g, '.$1');
  pathFinal = pathFinal.replace(/^\./, '');
  return pathFinal.split('.');
}

function isObjectOrArray(v: unknown) {
  return isObject(v) || isArray(v);
}

/**
 * 表示对象节点的信息。
 *
 * @template V - 键值的类型。
 */
export interface ObjectNode<V = unknown | undefined> {
  /**
   * 当前节点的父级对象。
   */
  parent: unknown | undefined;

  /**
   * 当前节点的键名路径。
   */
  keys: string[];

  /**
   * 当前节点的键名。
   */
  key: string | undefined;

  /**
   * 当前节点的键值。
   */
  value: V;
}

/**
 * 根据属性路径获取属性值
 * @param {O} obj
 * @param {string | string[] | P} path
 * @returns {ObjectNode<O>}
 * 根据属性路径获取属性值。
 *
 * @template O - 目标对象的类型。
 * @template P - 属性路径的类型。
 * @param {O} obj - 要操作的目标对象。
 * @param {P | string | string[]} path - 属性路径，可以是字符串或字符串数组。支持点分隔符（如 "a.b.c"）或数组形式（如 ["a", "b", "c"]）。
 * @returns {ObjectNode<O>} 返回一个包含父级、键名路径、键名和键值的对象节点。
 *
 * @example
 * ```typescript
 * const obj = { a: { b: { c: 42 } } };
 * const result = objectGet(obj, 'a.b.c');
 * console.log(result.value); // 输出 42
 * ```
 */
export function objectGet<O extends AnyObject, P extends ObjectPath<O>>(
  obj: O,
  path: P | string | string[],
): ObjectNode<O> {
  const keys = pathToKeys(path);
  const lastKey = keys.pop();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let parent: any = obj;
  const keysFinal: string[] = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    keysFinal.push(key);
    if (!isObjectOrArray(parent)) break;

    // @ts-ignore
    parent = parent[key];
  }

  return {
    parent: parent,
    keys: keysFinal,
    key: lastKey,
    // @ts-ignore
    value: isObjectOrArray(parent) && lastKey ? parent[lastKey] : undefined,
  };
}

// /**
//  * 根据路径获取对象叶子节点值
//  * @param {O} obj
//  * @param {P} path
//  * @returns {ObjectNode<O>}
//  */
// export function objectLeaf<O extends AnyObject, P extends ObjectLeafPath<O>>(obj: O, path: P) {
//   return objectGet(obj, path);
// }

/**
 * 配置选项，用于控制 `objectSet` 的行为。
 *
 * @template O - 目标对象的类型。
 */
export interface ObjectSetOptions<O extends AnyObject> {
  /**
   * 在设置值之前调用的钩子函数。
   * 如果返回 `false`，则阻止设置值。
   *
   * @param {ObjectNode<O> & { key: string }} node - 当前节点信息。
   * @returns {boolean | undefined | void} 返回 `false` 时阻止设置值。
   */
  // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
  beforeSet(node: ObjectNode<O> & { key: string }): boolean | undefined | void;

  /**
   * 当遇到未定义的中间节点时调用的钩子函数。
   * 返回值将用于创建中间节点。
   *
   * @param {ObjectNode<O>} node - 当前节点信息。
   * @returns {AnyObject | AnyArray | undefined | void} 返回值将用于创建中间节点。
   */
  // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
  undefinedSet(node: ObjectNode<O>): AnyObject | AnyArray | undefined | void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const defaultObjectSetOptions: ObjectSetOptions<any> = {
  beforeSet: () => true,
  undefinedSet: () => ({}),
};

/**
 * 根据属性路径设置属性值
 * @param {AnyObject} obj
 * @param {string} path
 * @param {V} val
 * @param {Partial<ObjectSetOptions<O>>} options
 * @returns {ObjectNode<O, V>}
 * 根据属性路径设置属性值。
 *
 * @template O - 目标对象的类型。
 * @template V - 要设置的值的类型。
 * @param {O} obj - 要操作的目标对象。
 * @param {string | string[]} path - 属性路径，可以是字符串或字符串数组。支持点分隔符（如 "a.b.c"）或数组形式（如 ["a", "b", "c"]）。
 * @param {V} val - 要设置的值。
 * @param {Partial<ObjectSetOptions<O>>} [options] - 可选配置项，用于控制设置行为。
 * @returns {ObjectNode<V>} 返回一个包含父级、键名路径、键名和键值的对象节点。
 *
 * @example
 * ```typescript
 * const obj = {};
 * objectSet(obj, 'a.b.c', 42);
 * console.log(obj); // 输出 { a: { b: { c: 42 } } }
 *
 * objectSet(obj, 'a.b.c', 100, {
 *   beforeSet: (node) => node.key === 'c',
 * });
 * console.log(obj); // 输出 { a: { b: { c: 100 } } }
 * ```
 */
export function objectSet<O extends AnyObject, V>(
  obj: O,
  path: string | string[],
  val: V,
  options?: Partial<ObjectSetOptions<O>>,
): ObjectNode<V> {
  const { beforeSet, undefinedSet } = Object.assign({}, defaultObjectSetOptions, options);
  const keys = pathToKeys(path);
  const lastKey = keys.pop();
  let parent = obj;
  let stopped = false;
  const keysFinal: string[] = [];

  for (const key of keys) {
    let val = parent[key];
    keysFinal.push(key);

    if (isUndefined(val)) {
      const seted = undefinedSet({
        parent: parent,
        keys: keysFinal,
        key: key,
        value: val,
      });

      if (!seted) {
        stopped = true;
        break;
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      val = parent[key] = seted;
    }

    // @ts-ignore
    parent = val;
  }

  if (!stopped && !isUndefined(lastKey)) {
    keysFinal.push(lastKey);

    if (
      beforeSet({
        parent: parent,
        keys: keysFinal,
        key: lastKey,
        value: parent[lastKey],
      })
    ) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      parent[lastKey] = val;
    }
  }

  return {
    keys: keysFinal,
    parent: parent,
    key: lastKey,
    value: val,
  };
}

/**
 * 检查一个对象是否为空对象（不包含任何自有属性，包括符号属性）。
 *
 * @param obj - 要检查的对象
 * @returns 如果对象没有自有属性（包括符号属性）则返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * isEmptyObject({}); // true
 * isEmptyObject({ a: 1 }); // false
 * isEmptyObject(Object.create(null)); // true
 * isEmptyObject({ [Symbol('key')]: 'value' }); // false
 * ```
 */
export function isEmptyObject(obj: AnyObject): boolean {
  return Object.getOwnPropertyNames(obj).length === 0 && Object.getOwnPropertySymbols(obj).length === 0;
}

/**
 * 检查一个对象是否为纯对象（通过对象字面量或Object构造函数创建，而非其他构造函数的实例）。
 *
 * @param obj - 要检查的对象
 * @returns 如果是纯对象则返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * isPlainObject({}); // true
 * isPlainObject(Object.create(null)); // true
 * isPlainObject(new Date()); // false
 * isPlainObject([]); // false
 * isPlainObject(() => {}); // false
 * ```
 */
export function isPlainObject(obj: AnyObject): boolean {
  const proto: unknown = Object.getPrototypeOf(obj);

  // 对象无原型
  if (!proto) return true;

  // 是否对象直接实例
  return proto === Object.prototype;
}
