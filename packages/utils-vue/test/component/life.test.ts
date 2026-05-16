import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { onBeforeMount, onBeforeUnmount, onMounted } from 'vue';
import { useMount, useMounted } from '../../src/component';

describe('hook-page', () => {
  it('应该正确触发 useMount 生命周期', async () => {
    const fn = vi.fn<() => void>();
    const cleanup = vi.fn<() => void>();
    const beforeMountFn = vi.fn<() => void>(() => cleanup);
    const wrapper = mount({
      template: '<div>test</div>',
      setup() {
        onBeforeMount(fn);
        onBeforeUnmount(fn);
        useMount(beforeMountFn);
      },
    });

    await wrapper.vm.$nextTick();
    expect(beforeMountFn).toHaveBeenCalledTimes(1);
    wrapper.unmount();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('应该正确触发 useMounted 生命周期', async () => {
    const fn = vi.fn<() => void>();
    const cleanup = vi.fn<() => void>();
    const mountedFn = vi.fn<() => void>(() => cleanup);
    const wrapper = mount({
      template: '<div>test</div>',
      setup() {
        onMounted(fn);
        onBeforeUnmount(fn);
        useMounted(mountedFn);
      },
    });

    await wrapper.vm.$nextTick();
    expect(mountedFn).toHaveBeenCalledTimes(1);
    wrapper.unmount();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('应该支持异步回调函数', async () => {
    const cleanup = vi.fn<() => void>();
    const asyncFn = vi.fn<() => void>(async () => cleanup);

    const wrapper = mount({
      template: '<div>test</div>',
      setup() {
        useMount(asyncFn);
      },
    });

    await wrapper.vm.$nextTick();
    expect(asyncFn).toHaveBeenCalledTimes(1);
    wrapper.unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
