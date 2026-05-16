import type { MaybePromise } from '@cloudcome/utils-core/types';
import { onActivated, onBeforeMount, onBeforeUnmount, onDeactivated, onMounted, onUnmounted } from 'vue';
import { _runLifeHook } from '@/shared';

export type HookListener = () => MaybePromise<unknown>;
export type HookListenerWithDispose = () => MaybePromise<undefined | HookListener>;

/**
 * 页面挂载前生命周期钩子
 *
 * @param beforeMount - 在组件挂载前执行的回调函数，可以返回一个清理函数
 *
 * @example
 * ```ts
 * useMount(() => {
 *   console.log('组件即将挂载');
 *   // 可以返回一个清理函数，在组件卸载前执行
 *   return () => {
 *     console.log('组件即将卸载');
 *   };
 * });
 * ```
 */
export function useMount(beforeMount: HookListenerWithDispose) {
  _runLifeHook(onBeforeMount, onBeforeUnmount, beforeMount);
}

/**
 * 页面挂载后生命周期钩子
 *
 * @param mounted - 在组件挂载后执行的回调函数，可以返回一个清理函数
 *
 * @example
 * ```ts
 * useMounted(() => {
 *   console.log('组件已挂载');
 *   // 可以返回一个清理函数，在组件卸载前执行
 *   return () => {
 *     console.log('组件即将卸载');
 *   };
 * });
 * ```
 */
export function useMounted(mounted: HookListenerWithDispose) {
  _runLifeHook(onMounted, onUnmounted, mounted);
}

/**
 * 页面激活时生命周期钩子
 *
 * @param activated - 在组件被激活时执行的回调函数，可以返回一个清理函数
 *
 * @example
 * ```ts
 * useActivated(() => {
 *   console.log('组件已激活');
 *   // 可以返回一个清理函数，在组件失活前执行
 *   return () => {
 *     console.log('组件即将失活');
 *   };
 * });
 * ```
 */
export function useActivated(activated: HookListenerWithDispose) {
  _runLifeHook(onActivated, onDeactivated, activated);
}
