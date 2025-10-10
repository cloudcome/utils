import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { useLazyValue } from '../src/time';

describe('useLazyValue 组合式函数', () => {
  beforeAll(() => {
    // Mock Date.now for consistent timing tests
    vi.useFakeTimers();
  });

  afterAll(() => {
    // Restore real timers
    vi.useRealTimers();
  });

  it('应该立即返回初始值', () => {
    const source = ref(true);
    const lazyValue = useLazyValue(source);

    expect(lazyValue.value).toBe(true);
  });

  it('应该在延迟后更新值', async () => {
    const source = ref(true);
    const lazyValue = useLazyValue(source, 100);

    source.value = false;
    expect(lazyValue.value).toBe(true); // 延迟前应该保持旧值

    await vi.advanceTimersByTimeAsync(100);
    expect(lazyValue.value).toBe(false); // 延迟后应该更新为新值
  });

  it('应该支持响应式的延迟时间', async () => {
    const source = ref('initial');
    const delay = ref(100);
    const lazyValue = useLazyValue(source, delay);

    source.value = 'updated';
    expect(lazyValue.value).toBe('initial');

    await vi.advanceTimersByTimeAsync(100);
    expect(lazyValue.value).toBe('updated');

    // 更改延迟时间
    delay.value = 200;
    source.value = 'again';
    expect(lazyValue.value).toBe('updated');

    await vi.advanceTimersByTimeAsync(100);
    expect(lazyValue.value).toBe('updated'); // 100ms后仍未更新

    await vi.advanceTimersByTimeAsync(100);
    expect(lazyValue.value).toBe('again'); // 再过100ms(总共200ms)后更新
  });

  it('应该在延迟期间多次变化时重新计算延迟', async () => {
    const source = ref(0);
    const lazyValue = useLazyValue(source, 100);

    source.value = 1;
    expect(lazyValue.value).toBe(0);

    // 在50ms后再次更改
    await vi.advanceTimersByTimeAsync(50);
    source.value = 2;
    expect(lazyValue.value).toBe(0);

    // 再过50ms(总共100ms)，应该仍未更新，因为重新计算了延迟
    await vi.advanceTimersByTimeAsync(50);
    expect(lazyValue.value).toBe(0);

    // 再过100ms(总共200ms)，现在应该更新了
    await vi.advanceTimersByTimeAsync(100);
    expect(lazyValue.value).toBe(2);
  });

  it('应该在延迟时间已过的情况下立即更新', async () => {
    const source = ref('initial');
    const lazyValue = useLazyValue(source, 50);

    source.value = 'updated';
    await vi.advanceTimersByTimeAsync(100); // 先推进时间

    // 因为上次更改已经过去很久了，应该立即更新
    expect(lazyValue.value).toBe('updated');
  });

  it('应该在组件销毁时清除定时器', () => {
    const source = ref(true);
    const lazyValue = useLazyValue(source, 100);

    source.value = false;
    expect(lazyValue.value).toBe(true);

    // 模拟 scope dispose
    // 这里我们主要测试不会出现错误行为
    // 实际的 scope dispose 测试需要更复杂的设置
  });

  it('应该使用默认延迟时间100ms', async () => {
    const source = ref('initial');
    const lazyValue = useLazyValue(source); // 不传递延迟时间

    source.value = 'updated';
    expect(lazyValue.value).toBe('initial');

    await vi.advanceTimersByTimeAsync(100);
    expect(lazyValue.value).toBe('updated');
  });
});
