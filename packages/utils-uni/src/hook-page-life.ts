import type { AnyObject } from '@cloudcome/utils-core/types';
import { onLoad as onLoadHook } from '@dcloudio/uni-app';
import { reactive, unref } from 'vue';

/**
 * 用于获取页面参数的 hook 函数
 * @template T - 页面参数对象的类型，继承自 AnyObject
 * @param {function} [onLoad] - 页面加载时的回调函数
 * @param {T} onLoad.query - 页面参数对象
 * @returns {T} 响应式的页面参数对象
 * @example
 * // 基本用法
 * const query = usePageQuery();
 *
 * // 带回调的用法
 * const query = usePageQuery((query) => {
 *   console.log('页面参数:', query);
 * });
 *
 * // 指定参数类型
 * interface PageParams {
 *   id: string;
 *   name?: string;
 * }
 * const query = usePageQuery<PageParams>();
 */
export function usePageQuery<T extends AnyObject>(onLoad?: (query: T) => void) {
  const query = reactive<T>({} as T);

  onLoadHook((_query) => {
    Object.assign(query, _query);
    onLoad?.(query as T);
  });

  return query;
}
