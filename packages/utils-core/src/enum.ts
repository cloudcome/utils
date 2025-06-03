import type { AnyObject, MergeIntersection, UnionToIntersection, UnionToTuple } from './types';

export type EnumKey = string;
export type EnumValue = number | string;
export type EnumMetaAppend = {
  key?: string;
  value?: string | number;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [key: string]: any;
};
export type EnumMeta<A extends EnumMetaAppend> = A & {
  value: EnumValue;
};
export type EnumDescription<A extends EnumMetaAppend> = Record<EnumKey, EnumMeta<A>>;

const enumError = Symbol('enumKeyError');

type _StartWithDollarSign<T extends string> = T extends `$${infer R}` ? R : never;

type _CheckDefinition<O extends AnyObject> = {
  // [K in keyof O & string]: K extends Capitalize<K> ? O[K] : `错误：枚举键名 ${K} 必须大写字母开头`;
  [K in keyof O & string]: K extends Capitalize<K>
    ? K extends `$${infer R}`
      ? O[K] & { [enumError]: `错误：枚举键名 ${K} 不能以 $ 符号开头` }
      : O[K]
    : O[K] & { [enumError]: `错误：枚举键名 ${K} 必须以大写字母开头` };
};

type _ToOriginDefProp<T extends AnyObject> = {
  [K in keyof T as `$${K & string}`]: MergeIntersection<T[K] & { readonly key: K }>;
};

type _KVRecord<T> = T extends Record<string, AnyObject>
  ? {
      readonly [K in keyof T]: T[K]['value'];
    }
  : never;

type _VKRecord<T> = T extends Record<string, AnyObject>
  ? MergeIntersection<
      UnionToIntersection<
        {
          [K in keyof T]: {
            [P in keyof T[K] as P extends 'value' ? T[K][P] & (string | number) : never]: K;
          };
        }[keyof T]
      >
    >
  : never;

export type EnumExpose<A extends EnumMetaAppend, E extends EnumDescription<A>> = _ToOriginDefProp<E> &
  _KVRecord<E> & {
    readonly definition: E;
    readonly descriptions: MergeIntersection<A & { key: keyof E }>[];
    readonly keys: UnionToTuple<keyof E>;
    readonly length: UnionToTuple<keyof E>['length'];
    readonly values: UnionToTuple<E[keyof E]['value']>;
    readonly kvRecord: _KVRecord<E>;
    readonly vkRecord: _VKRecord<E>;
    toKeyRecord: <P extends keyof A>(prop: P) => Record<keyof E, A[P]>;
    toValueRecord: <P extends keyof A>(prop: P) => Record<E[keyof E]['value'], A[P]>;
  };

/**
 * 定义一个枚举类型，如果需要类型提示，需要使用 declareEnum 函数定义枚举。
 * @template A - 枚举元数据附加类型，扩展自 EnumMetaAppend
 * @template E - 枚举描述类型，键为枚举键名，值为枚举元数据
 * @param {_CheckDefinition<E>} definition - 枚举定义对象
 * @returns {EnumExpose<A, E>} 返回枚举的完整暴露对象
 * @example
 * ```typescript
 * const Status = defineEnum({
 *   Pending: { value: 0, label: '待处理' },
 *   Approved: { value: 1, label: '已批准' }
 * });
 * ```
 *
 * @property {E} definition - 原始枚举定义对象
 * @property {Array<MergeIntersection<A & { key: keyof E }>>} descriptions - 枚举项的完整描述数组
 * @property {UnionToTuple<keyof E>} keys - 枚举键名的元组
 * @property {"UnionToTuple<keyof E>[\"length\"]"} length - 枚举项的数量
 * @property {UnionToTuple<E[keyof E]["value"]>} values - 枚举值的元组
 * @property {Record<keyof E, E[keyof E]["value"]>} kvRecord - 键到值的映射记录
 * @property {Record<E[keyof E]["value"], E[keyof E]>} vkRecord - 值到键的映射记录
 * @property {function} toKeyRecord - 根据属性名创建键到属性值的映射记录
 * @property {function} toValueRecord - 根据属性名创建值到属性值的映射记录
 */
function defineEnum<A extends EnumMetaAppend, const E extends EnumDescription<A>>(
  definition: _CheckDefinition<E>,
): EnumExpose<A, E> {
  const keys = Object.keys(definition);

  return {
    ...[...Object.entries(definition)].reduce((acc, [key, dfn]) => {
      if (key[0].toUpperCase() !== key[0]) {
        throw new Error(`错误：枚举键名 ${key} 必须以大写字母开头`);
      }

      if (key.startsWith('$')) {
        throw new Error(`错误：枚举键名 ${key} 不能以 $ 符号开头`);
      }

      // @ts-ignore
      acc[key] = dfn.value;
      // @ts-ignore
      acc[`$${key}`] = { key, ...dfn };
      return acc;
    }, {}),
    definition,
    descriptions: keys.map((key) => ({
      key,
      ...definition[key],
    })),
    keys,
    length: keys.length,
    values: keys.map((key) => definition[key as keyof E].value),
    kvRecord: keys.reduce((acc, key) => {
      // @ts-ignore
      acc[key] = definition[key].value;
      return acc;
    }, {}),
    vkRecord: keys.reduce((acc, key) => {
      // @ts-ignore
      acc[definition[key].value] = key;
      return acc;
    }, {}),
    toKeyRecord<P extends keyof A>(prop: P) {
      return keys.reduce((acc, key) => {
        // @ts-ignore
        acc[key] = definition[key][prop];
        return acc;
      }, {});
    },
    toValueRecord<P extends keyof A>(prop: P) {
      return keys.reduce(
        (acc, key) => {
          // @ts-ignore
          acc[definition[key].value] = definition[key][prop];
          return acc;
        },
        {} as Record<E[keyof E]['value'], A[P]>,
      );
    },
  } as unknown as EnumExpose<A, E>;
}

/**
 * 声明一个枚举工厂函数
 * @template A - 枚举元数据附加类型，扩展自 EnumMetaAppend
 * @returns {Object} 返回包含 define 方法的对象
 *
 * @property {function} define - 定义枚举的函数
 *   @template E - 枚举描述类型
 *   @param {_CheckDefinition<E>} definition - 枚举定义对象
 *   @returns {EnumExpose<A, E>} 返回枚举的完整暴露对象
 *   @example
 *   ```typescript
 *   const createStatusEnum = declareEnum<{ label: string }>();
 *   const Status = createStatusEnum.define({
 *     Pending: { value: 0, label: '待处理' },
 *     Approved: { value: 1, label: '已批准' }
 *   });
 *   ```
 */
export function declareEnum<A extends EnumMetaAppend>() {
  return {
    define<const E extends EnumDescription<A>>(definition: _CheckDefinition<E>): EnumExpose<A, E> {
      return defineEnum(definition);
    },
  };
}
