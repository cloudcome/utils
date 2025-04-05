import { Emitter } from '@/emitter';
import { vi } from 'vitest';

type TestEvents = {
  click: [x: number, y: number];
  change: [value: string];
};

describe('Emitter', () => {
  let emitter: Emitter<TestEvents>;

  beforeEach(() => {
    emitter = new Emitter<TestEvents>();
  });

  it('应正确注册和触发事件', () => {
    const clickHandler = vi.fn();
    emitter.on('click', clickHandler);
    emitter.emit('click', 10, 20);
    expect(clickHandler).toHaveBeenCalledWith(10, 20);
  });

  it('应按注册顺序触发监听器', () => {
    const calls: number[] = [];
    emitter.on('click', () => calls.push(1));
    emitter.on('click', () => calls.push(2));
    emitter.emit('click', 0, 0);
    expect(calls).toEqual([1, 2]);
  });

  it('应在监听器返回 false 时中断触发', () => {
    const handler1 = vi.fn().mockReturnValue(false);
    const handler2 = vi.fn();
    emitter.on('click', handler1);
    emitter.on('click', handler2);
    emitter.emit('click', 0, 0);
    expect(handler1).toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

  it('应移除特定事件的特定监听器', () => {
    const handler = vi.fn();
    emitter.on('click', handler);
    emitter.off('click', handler);
    emitter.emit('click', 0, 0);
    expect(handler).not.toHaveBeenCalled();
  });

  it('应移除特定事件的所有监听器', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    emitter.on('click', handler1);
    emitter.on('click', handler2);
    emitter.off('click');
    emitter.emit('click', 0, 0);
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

  it('应移除所有事件的所有监听器', () => {
    const clickHandler = vi.fn();
    const changeHandler = vi.fn();
    emitter.on('click', clickHandler);
    emitter.on('change', changeHandler);
    emitter.off();
    emitter.emit('click', 0, 0);
    emitter.emit('change', 'test');
    expect(clickHandler).not.toHaveBeenCalled();
    expect(changeHandler).not.toHaveBeenCalled();
  });
});
