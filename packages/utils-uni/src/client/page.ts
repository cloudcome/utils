import type { AnyObject } from '@cloudcome/utils-core/types';
import type { HookListenerWithDispose } from '@cloudcome/utils-vue/component';
import { _runLifeHook } from '@cloudcome/utils-vue/shared';
import { onLoad, onPageHide, onPageShow, onUnload } from '@dcloudio/uni-app';
import { type Reactive, reactive } from 'vue';

/**
 * 用于获取页面参数的 hook 函数
 * @template T - 页面参数对象的类型，继承自 AnyObject
 * @param {function} [onPageLoad] - 页面加载时的回调函数
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
export function usePageQuery<T extends AnyObject>(
  onPageLoad?: (query: Reactive<T>) => void,
) {
  const query = reactive<T>({} as T);

  onLoad((_query) => {
    Object.assign(query, _query);
    onPageLoad?.(query);
  });

  return query;
}

/**
 * 用于处理页面加载生命周期的 hook 函数
 *
 * 该函数会在页面加载时执行传入的回调函数，并在页面卸载时执行清理操作（如果提供了清理函数）。
 * 它是 uni-app 中 onLoad 和 onUnload 生命周期的封装。
 *
 * @param {HookListenerWithDispose} load - 页面加载时的回调函数，可以返回一个清理函数
 *
 * @example
 * // 基本用法
 * usePageLoad(() => {
 *   console.log('页面已加载');
 * });
 *
 * @example
 * // 带清理函数的用法
 * usePageLoad(() => {
 *   console.log('页面已加载');
 *
 *   // 返回一个清理函数，在页面卸载时执行
 *   return () => {
 *     console.log('页面将要卸载');
 *   };
 * });
 *
 * @example
 * // 异步用法
 * usePageLoad(async () => {
 *   const data = await fetchData();
 *   console.log('获取到数据:', data);
 *
 *   return () => {
 *     console.log('清理资源');
 *   };
 * });
 */
export function usePageLoad(load: HookListenerWithDispose) {
  _runLifeHook(onLoad, onUnload, load);
}

/**
 * 用于处理页面显示生命周期的 hook 函数
 *
 * 该函数会在页面显示时执行传入的回调函数，并在页面隐藏时执行清理操作（如果提供了清理函数）。
 * 它是 uni-app 中 onPageShow 和 onPageHide 生命周期的封装。
 *
 * @param {HookListenerWithDispose} pageShow - 页面显示时的回调函数，可以返回一个清理函数
 *
 * @example
 * // 基本用法
 * usePageShow(() => {
 *   console.log('页面已显示');
 * });
 *
 * @example
 * // 带清理函数的用法
 * usePageShow(() => {
 *   console.log('页面已显示');
 *
 *   // 返回一个清理函数，在页面隐藏时执行
 *   return () => {
 *     console.log('页面将要隐藏');
 *   };
 * });
 */
export function usePageShow(pageShow: HookListenerWithDispose) {
  _runLifeHook(onPageShow, onPageHide, pageShow);
}
