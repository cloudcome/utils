import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createEventHook } from '../src/event';

describe('createEventCenter 事件中心', () => {
  // 定义测试事件类型
  type TestEvents = {
    'test-event': [string, number];
    'another-event': [boolean];
  };

  it('应该正确创建事件中心实例', () => {
    const eventCenter = createEventHook<TestEvents>();

    expect(eventCenter).toBeDefined();
    expect(typeof eventCenter.on).toBe('function');
    expect(typeof eventCenter.off).toBe('function');
    expect(typeof eventCenter.emit).toBe('function');
    expect(typeof eventCenter.useEvent).toBe('function');
  });

  it('应该正确注册和触发事件', () => {
    const eventCenter = createEventHook<TestEvents>();
    const mockListener = vi.fn();

    eventCenter.on('test-event', mockListener);
    eventCenter.emit('test-event', 'hello', 123);

    expect(mockListener).toHaveBeenCalledTimes(1);
    expect(mockListener).toHaveBeenCalledWith('hello', 123);
  });

  it('应该正确取消事件监听', () => {
    const eventCenter = createEventHook<TestEvents>();
    const mockListener = vi.fn();

    eventCenter.on('test-event', mockListener);
    eventCenter.off('test-event', mockListener);
    eventCenter.emit('test-event', 'hello', 123);

    expect(mockListener).not.toHaveBeenCalled();
  });

  it('应该正确处理 useEventCenter 在 mount 阶段', async () => {
    const eventCenter = createEventHook<TestEvents>({ stage: 'mount' });
    const mockListener = vi.fn();
    const wrapper = mount({
      template: '<div>test</div>',
      setup() {
        eventCenter.useEvent('another-event', mockListener);
      },
    });

    await wrapper.vm.$nextTick();

    eventCenter.emit('another-event', true);

    expect(mockListener).toHaveBeenCalledTimes(1);
    expect(mockListener).toHaveBeenCalledWith(true);

    wrapper.unmount();

    eventCenter.emit('another-event', false);
    expect(mockListener).toHaveBeenCalledTimes(1);
    expect(mockListener).toHaveBeenCalledWith(true);
  });

  it('应该正确处理 useEventCenter 在 mounted 阶段', async () => {
    const eventCenter = createEventHook<TestEvents>({ stage: 'mounted' });
    const mockListener = vi.fn();
    const wrapper = mount({
      template: '<div>test</div>',
      setup() {
        eventCenter.useEvent('another-event', mockListener);
      },
    });

    await wrapper.vm.$nextTick();

    eventCenter.emit('another-event', true);

    expect(mockListener).toHaveBeenCalledTimes(1);
    expect(mockListener).toHaveBeenCalledWith(true);

    wrapper.unmount();

    eventCenter.emit('another-event', false);
    expect(mockListener).toHaveBeenCalledTimes(1);
    expect(mockListener).toHaveBeenCalledWith(true);
  });

  it('应该支持自定义事件发射器', () => {
    const customEmitter = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    };
    const eventCenter = createEventHook<TestEvents>({ emitter: customEmitter });

    const mockListener = vi.fn();
    eventCenter.on('test-event', mockListener);
    eventCenter.emit('test-event', 'hello', 123);
    eventCenter.off('test-event', mockListener);

    expect(customEmitter.on).toHaveBeenCalled();
    expect(customEmitter.emit).toHaveBeenCalled();
    expect(customEmitter.off).toHaveBeenCalled();
  });
});
