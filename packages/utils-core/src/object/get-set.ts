import { isArray, isObject, isUndefined } from '@/type';
import type { AnyArray, AnyObject } from '@/types';

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
export type TObjectNode<V = unknown | undefined> = {
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
};

/**
 * 根据属性路径获取属性值
 * @param {O} obj
 * @param {string | string[] | P} path
 * @returns {TObjectNode<O>}
 * 根据属性路径获取属性值。
 *
 * @template O - 目标对象的类型。
 * @template P - 属性路径的类型。
 * @param {O} obj - 要操作的目标对象。
 * @param {P | string | string[]} path - 属性路径，可以是字符串或字符串数组。支持点分隔符（如 "a.b.c"）或数组形式（如 ["a", "b", "c"]）。
 * @returns {TObjectNode<O>} 返回一个包含父级、键名路径、键名和键值的对象节点。
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
): TObjectNode<O> {
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
export type TObjectSetOptions<O extends AnyObject> = {
  /**
   * 在设置值之前调用的钩子函数。
   * 如果返回 `false`，则阻止设置值。
   *
   * @param {TObjectNode<O> & { key: string }} node - 当前节点信息。
   * @returns {boolean | undefined | void} 返回 `false` 时阻止设置值。
   */
  // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
  beforeSet(node: TObjectNode<O> & { key: string }): boolean | undefined | void;

  /**
   * 当遇到未定义的中间节点时调用的钩子函数。
   * 返回值将用于创建中间节点。
   *
   * @param {TObjectNode<O>} node - 当前节点信息。
   * @returns {AnyObject | AnyArray | undefined | void} 返回值将用于创建中间节点。
   */
  // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
  undefinedSet(node: TObjectNode<O>): AnyObject | AnyArray | undefined | void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const defaultObjectSetOptions: TObjectSetOptions<any> = {
  beforeSet: () => true,
  undefinedSet: () => ({}),
};

/**
 * 根据属性路径设置属性值
 * @param {AnyObject} obj
 * @param {string} path
 * @param {V} val
 * @param {Partial<TObjectSetOptions<O>>} options
 * @returns {TObjectNode<O, V>}
 * 根据属性路径设置属性值。
 *
 * @template O - 目标对象的类型。
 * @template V - 要设置的值的类型。
 * @param {O} obj - 要操作的目标对象。
 * @param {string | string[]} path - 属性路径，可以是字符串或字符串数组。支持点分隔符（如 "a.b.c"）或数组形式（如 ["a", "b", "c"]）。
 * @param {V} val - 要设置的值。
 * @param {Partial<TObjectSetOptions<O>>} [options] - 可选配置项，用于控制设置行为。
 * @returns {TObjectNode<V>} 返回一个包含父级、键名路径、键名和键值的对象节点。
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
  options?: Partial<TObjectSetOptions<O>>,
): TObjectNode<V> {
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
