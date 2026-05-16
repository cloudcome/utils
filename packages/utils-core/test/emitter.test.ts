import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Emitter } from '@/emitter';

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
    const clickHandler = vi.fn<() => void>();
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
    const handler1 = vi.fn<() => void>().mockReturnValue(false);
    const handler2 = vi.fn<() => void>();
    emitter.on('click', handler1);
    emitter.on('click', handler2);
    emitter.emit('click', 0, 0);
    expect(handler1).toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

  it('应移除特定事件的特定监听器', () => {
    const handler = vi.fn<() => void>();
    emitter.on('click', handler);
    emitter.off('click', handler);
    emitter.emit('click', 0, 0);
    expect(handler).not.toHaveBeenCalled();
  });

  it('应移除特定事件的所有监听器', () => {
    const handler1 = vi.fn<() => void>();
    const handler2 = vi.fn<() => void>();
    emitter.on('click', handler1);
    emitter.on('click', handler2);
    emitter.off('click');
    emitter.emit('click', 0, 0);
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

  it('应移除所有事件的所有监听器', () => {
    const clickHandler = vi.fn<() => void>();
    const changeHandler = vi.fn<() => void>();
    emitter.on('click', clickHandler);
    emitter.on('change', changeHandler);
    emitter.off();
    emitter.emit('click', 0, 0);
    emitter.emit('change', 'test');
    expect(clickHandler).not.toHaveBeenCalled();
    expect(changeHandler).not.toHaveBeenCalled();
  });

  it('一次性监听', () => {
    const handler = vi.fn<() => void>();
    emitter.once('click', handler);
    emitter.emit('click', 0, 0);
    expect(handler).toHaveBeenCalledWith(0, 0);
    emitter.emit('click', 1, 1);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('支持 symbol 事件', () => {
    const sym = Symbol('aa');
    const handler = vi.fn<() => void>();
    const emitter = new Emitter();
    emitter.on(sym, handler);
    emitter.emit(sym, 0, 0);
    expect(handler).toHaveBeenCalledWith(0, 0);
  });

  it('支持有泛型参数的继承', () => {
    class E3 extends Emitter<{
      aa: [a1: number, a2: number];
    }> {
      constructor() {
        super();
        this.emit('aa', 10, 20);
        this.on('aa', (a1, a2) => {
          console.log(a1, a2);
        });
      }
    }
    const e3 = new E3();
    const handler = vi.fn<() => void>();
    e3.on('aa', handler);
    e3.emit('aa', 10, 20);
    expect(handler).toHaveBeenCalledWith(10, 20);
  });

  it('支持无泛型参数的继承', () => {
    class E4 extends Emitter {
      constructor() {
        super();
        this.emit('aa', 10, 20);
        this.on('aa', (a1, a2) => {
          console.log(a1, a2);
        });
      }
    }
    const e4 = new E4();
    const handler = vi.fn<() => void>();
    e4.on('aa', handler);
    e4.emit('aa', 10, 20);
    expect(handler).toHaveBeenCalledWith(10, 20);
  });
});
