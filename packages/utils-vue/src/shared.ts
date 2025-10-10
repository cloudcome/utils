import { isFunction } from '@cloudcome/utils-core/type';
import type { AnyFunction, MaybePromise } from '@cloudcome/utils-core/types';
import { effectScope, onScopeDispose } from 'vue';

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

/**
 * 运行作用域钩子函数的工具函数
 *
 * 该函数创建一个独立的响应式作用域，在该作用域内执行传入的回调函数，
 * 并在适当的时机自动清理资源。这确保了响应式副作用的隔离和自动回收。
 *
 * @protected 内部方法
 * @param runner - 需要在作用域内执行的回调函数，可以返回一个清理函数
 *
 * @example
 * // 基本用法
 * _runScope(() => {
 *   // 在这里创建的响应式副作用会被限制在当前作用域内
 *   const stop = watch(someRef, (val) => {
 *     console.log(val);
 *   });
 *
 *   // 返回一个清理函数，在作用域销毁时执行
 *   return () => {
 *     stop();
 *   };
 * });
 *
 * @example
 * // 异步用法
 * _runScope(async () => {
 *   const data = await fetchData();
 *
 *   // 根据获取的数据创建响应式监听
 *   const stop = watch(() => data.value, (val) => {
 *     console.log(val);
 *   });
 *
 *   // 返回清理函数
 *   return () => {
 *     stop();
 *   };
 * });
 */
export function _runScope(runner: HookListenerWithDispose) {
  // 创建一个独立的响应式作用域，用于收集和管理响应式副作用
  const scope = effectScope();
  // 存储用户提供的清理函数
  let dispose: HookListener | undefined;

  // 在创建的作用域内执行回调函数
  scope.run(async () => {
    // 执行传入的回调函数并等待其完成（支持异步操作）
    const result = await runner();

    // 如果回调函数返回了一个函数，则将其作为清理函数保存
    if (isFunction(result)) {
      dispose = result;
    }
  });

  // 注册作用域销毁时的回调函数
  onScopeDispose(() => {
    // 如果存在用户提供的清理函数，则执行它
    dispose?.();
    // 停止并清理整个作用域内的所有响应式副作用
    scope.stop();
  });
}
