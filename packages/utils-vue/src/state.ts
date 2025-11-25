import { computed, ref } from 'vue';

export type UseOnceValueOptions<T> = {
  equal?: (a: T, b: T) => boolean;
};

/**
 * 只改变一次的值
 * @param value 初始值
 * @param options 选项
 * @returns 包含 change 方法和 value 响应式值的对象
 */
export function useOnceState<T>(value: T, options?: UseOnceValueOptions<T>) {
  let lastValue = value;
  const changed = ref(false);
  const { equal = Object.is } = options || {};

  return {
    change(newValue: T) {
      if (equal(newValue, lastValue)) {
        return;
      }

      if (changed.value) {
        return;
      }

      changed.value = true;
      lastValue = newValue;
    },
    // 这里需要使用 computed 确保返回的是原始值，而不是 reactive 包装后的对象
    state: computed(() => {
      // changed 使用响应式是为确保 computed 能够响应式更新
      if (!changed.value) {
        return value;
      }

      return lastValue;
    }),
  };
}
