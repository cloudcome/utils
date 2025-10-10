import { isFunction } from '@cloudcome/utils-core/type';
import type { AnyFunction, MaybePromise } from '@cloudcome/utils-core/types';

export type HookListener = () => MaybePromise<unknown>;
export type HookListenerWithDispose = () => MaybePromise<unknown | HookListener>;

/**
 * 运行生命周期钩子函数的工具函数
 *
 * @protected 内部方法
 * @template T - 泛型参数（未在函数中使用）
 * @param enterHook - 进入时执行的钩子函数，接收一个回调函数作为参数
 * @param leaveHook - 离开时执行的钩子函数，接收一个回调函数作为参数
 * @param onEnter - 进入时的监听器，可以返回一个清理函数
 *
 * @example
 * _runLifeHook(
 *   (hook) => onMounted(hook),     // 在组件挂载时执行进入逻辑
 *   (hook) => onUnmounted(hook),   // 在组件卸载时执行离开逻辑
 *   () => {
 *     // 执行进入时的逻辑
 *     console.log('组件已挂载');
 *
 *     // 返回一个清理函数，在离开时执行
 *     return () => {
 *       console.log('组件将要卸载');
 *     };
 *   }
 * );
 */
export function _runLifeHook<T>(
  enterHook: (hook: AnyFunction) => unknown,
  leaveHook: (hook: AnyFunction) => unknown,
  onEnter: HookListenerWithDispose,
) {
  // 存储离开时需要执行的清理函数
  let onLeave: HookListener | undefined;

  // 注册进入钩子，在 enterHook 触发时执行
  enterHook(async () => {
    // 执行进入时的监听器逻辑
    const enterResult = await onEnter();

    // 如果返回结果是一个函数，则将其作为离开时的清理函数保存
    if (isFunction(enterResult)) {
      onLeave = enterResult;
    }
  });

  // 注册离开钩子，在 leaveHook 触发时执行
  leaveHook(() => {
    // 如果存在清理函数，则执行它
    onLeave?.();
  });
}
