import type { HookListenerWithDispose } from '@cloudcome/utils-vue/page';
import { _runLifeHook } from '@cloudcome/utils-vue/shared';
import { onHide, onShow } from '@dcloudio/uni-app';

/**
 * 应用显示状态生命周期钩子函数
 *
 * 该函数用于监听应用从后台进入前台的生命周期事件。
 * 当应用从后台切换到前台时触发 onShow 回调，
 * 当应用从前台切换到后台时触发 onHide 回调。
 *
 * @param appShow - 应用显示状态变化时的回调函数，可以返回一个清理函数
 *
 * @example
 * // 基本用法
 * useAppShow(() => {
 *   console.log('应用进入前台');
 *
 *   // 可选：返回一个清理函数，在应用进入后台时执行
 *   return () => {
 *     console.log('应用进入后台');
 *   };
 * });
 *
 * @example
 * // 带有异步操作的用法
 * useAppShow(async () => {
 *   // 应用进入前台时刷新数据
 *   await refreshUserData();
 *
 *   // 返回清理函数
 *   return () => {
 *     // 应用进入后台时保存数据
 *     saveUserData();
 *   };
 * });
 */
export function useAppShow(appShow: HookListenerWithDispose) {
  _runLifeHook(onShow, onHide, appShow);
}
