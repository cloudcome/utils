import { type Ref, computed, effectScope, onScopeDispose, ref, toValue, watch } from 'vue';

/**
 * 创建一个延迟更新的响应式值
 *
 * 该函数创建一个基于原始响应式值的延迟更新值，当原始值发生变化时，
 * 延迟值会在指定的延迟时间后更新。如果在延迟期间原始值再次变化，
 * 则会重新计算延迟时间。
 *
 * @param initialValue 原始响应式值，类型为Ref<T>
 * @param delay 延迟时间，可以是数字或响应式数字，默认为100毫秒
 * @returns 返回一个计算属性，其值会在延迟后更新为原始值
 */
export function useLazyValue<T>(initialValue: Ref<T>, delay?: number | Ref<number>) {
  const scope = effectScope();
  const lazyValue = ref(initialValue.value);
  let changedAt = 0;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let t: any;

  scope.run(() => {
    watch(initialValue, (value) => {
      const delayValue = toValue(delay) || 100;
      clearTimeout(t);

      if (changedAt > 0 && Date.now() - changedAt > delayValue) {
        lazyValue.value = value;
      } else {
        t = setTimeout(() => {
          lazyValue.value = value;
        }, delayValue);
      }

      changedAt = Date.now();
    });
  });

  onScopeDispose(() => {
    clearTimeout(t);
    scope.stop();
  });

  return computed<T>(() => {
    return lazyValue.value;
  });
}
