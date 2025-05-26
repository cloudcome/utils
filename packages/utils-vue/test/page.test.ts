import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { onBeforeMount, onBeforeUnmount, onMounted } from 'vue';
import { usePageMount, usePageMounted } from '../src/page';

describe('hook-page', () => {
  it('应该正确触发 usePageMount 生命周期', async () => {
    const fn = vi.fn();
    const cleanup = vi.fn();
    const beforeMountFn = vi.fn(() => cleanup);
    const wrapper = mount({
      template: '<div>test</div>',
      setup() {
        onBeforeMount(fn);
        onBeforeUnmount(fn);
        usePageMount(beforeMountFn);
      },
    });

    await wrapper.vm.$nextTick();
    expect(beforeMountFn).toHaveBeenCalledTimes(1);
    wrapper.unmount();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('应该正确触发 usePageMounted 生命周期', async () => {
    const fn = vi.fn();
    const cleanup = vi.fn();
    const mountedFn = vi.fn(() => cleanup);
    const wrapper = mount({
      template: '<div>test</div>',
      setup() {
        onMounted(fn);
        onBeforeUnmount(fn);
        usePageMounted(mountedFn);
      },
    });

    await wrapper.vm.$nextTick();
    expect(mountedFn).toHaveBeenCalledTimes(1);
    wrapper.unmount();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('应该支持异步回调函数', async () => {
    const cleanup = vi.fn();
    const asyncFn = vi.fn(async () => cleanup);

    const wrapper = mount({
      template: '<div>test</div>',
      setup() {
        usePageMount(asyncFn);
      },
    });

    await wrapper.vm.$nextTick();
    expect(asyncFn).toHaveBeenCalledTimes(1);
    wrapper.unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
