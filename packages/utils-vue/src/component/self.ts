import { type Ref, ref } from 'vue';
import type {
  ComponentExposed,
  ComponentProps,
} from 'vue-component-type-helpers';

/**
 * 创建一个响应式引用，用于暴露组件实例
 * @template T 组件类型
 * @param {T} Comp 组件定义
 * @returns 返回一个可响应式访问的组件实例引用
 * @example
 * const compRef = useExpose(MyComponent)
 */
export function useExpose<T>(_Comp: T) {
  // 这里必须类型断言，否则构建会失败
  return ref<ComponentExposed<T> | null>(
    null,
  ) as Ref<ComponentExposed<T> | null>;
}

/**
 * 将字符串的首字母转换为小写
 * @template S 字符串类型
 * @typedef {S extends `${infer First}${infer Rest}` ? `${Lowercase<First>}${Rest}` : S} LowercaseFirst
 */
type LowercaseFirst<S extends string> = S extends `${infer First}${infer Rest}`
  ? `${Lowercase<First>}${Rest}`
  : S;

/**
 * 从组件props中提取事件类型
 * @template T 组件props类型
 * @typedef {Object} PickEmits
 * @property {Object} [K in keyof T as K extends `on${infer Rest}`...] 转换后的emit事件名
 *   - @property {Function} [...args: P] 事件回调函数
 */
type PickEmits<T> = {
  [K in keyof T as K extends `on${infer Rest}`
    ? // biome-ignore lint/suspicious/noExplicitAny: 必须使用 any
      T[K] extends (...args: any[]) => any
      ? LowercaseFirst<Rest>
      : never
    : // biome-ignore lint/suspicious/noExplicitAny: 必须使用 any
      never]: T[K] extends (...args: infer P) => any
    ? (...args: P) => unknown
    : never;
};

/**
 * 创建一个组件emit事件监听器
 * @template T 组件类型
 * @template E 从组件props中提取的事件类型
 * @template K 事件名
 * @param {T} Comp 组件定义
 * @param {K} event 事件名称
 * @param {E[K]} listener 事件监听函数
 * @returns {E[K]} 返回传入的事件监听函数
 * @example
 * const handleClick = useEmit(MyComponent, 'click', (payload) => {
 *   console.log('click event', payload)
 * })
 */
export function useEmit<
  T,
  E extends PickEmits<Required<ComponentProps<T>>>,
  K extends keyof E,
>(_Comp: T, _event: K, listener: E[K]) {
  return listener;
}

type PickMethods<T> = {
  // biome-ignore lint/suspicious/noExplicitAny: 必须使用 any
  [K in keyof T]: T[K] extends (...args: unknown[]) => any ? T[K] : never;
};

/**
 * 从组件props中提取方法并返回指定方法
 * @template T 组件类型
 * @template M 从组件props中提取的方法类型
 * @template K 方法名类型
 * @param {T} Comp 组件定义
 * @param {K} name 方法名称
 * @param {M[K]} method 要返回的方法
 * @returns {M[K]} 返回传入的方法
 * @example
 * const handleUpdate = useMethod(MyComponent, 'update', (value) => {
 *   console.log('update value', value)
 * })
 */
export function useMethod<
  T,
  M extends PickMethods<Required<ComponentProps<T>>>,
  K extends keyof M,
>(_Comp: T, _name: K, method: M[K]) {
  return method;
}
