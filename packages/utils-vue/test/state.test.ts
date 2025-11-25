import { describe, expect, it } from 'vitest';
import { toRaw, toValue } from 'vue';
import { useOnceState } from '../src/state';

describe('useOnceValue', () => {
  it('应该使用正确的初始值初始化', () => {
    const { state } = useOnceState(10);
    expect(state.value).toBe(10);
  });

  it('应该允许更改一次值', () => {
    const { state, change } = useOnceState(10);
    change(20);
    expect(state.value).toBe(20);
  });

  it('不应该允许多次更改值', () => {
    const { state, change } = useOnceState(10);
    change(20);
    change(30);
    expect(state.value).toBe(20); // 应该保持20，而不是改为30
  });

  it('如果新值与当前值相等，则不应更改', () => {
    const { state, change } = useOnceState(10);
    change(10); // 相同的值
    expect(state.value).toBe(10);

    // 应该仍然允许更改为不同的值
    change(20);
    expect(state.value).toBe(20);
  });

  it('应该支持自定义相等函数', () => {
    const { state, change } = useOnceState(10, {
      equal: (a, b) => Math.abs(a - b) < 5, // 将5个单位内的值视为相等
    });

    change(12); // 在10的5个单位内，应被视为相等
    expect(state.value).toBe(10);

    change(20); // 超出5个单位，应该更改
    expect(state.value).toBe(20);
  });

  it('使用自定义相等函数后不应再更改', () => {
    const { state, change } = useOnceState(10, {
      equal: (a, b) => Math.abs(a - b) < 5,
    });

    change(20); // 这应该会改变值
    expect(state.value).toBe(20);

    change(30); // 这不应该改变值，因为已经更改过一次了
    expect(state.value).toBe(20);
  });

  it('应该能与对象一起使用', () => {
    const obj1 = { x: 1 };
    const obj2 = { x: 2 };
    const obj3 = { x: 3 };

    const { state, change } = useOnceState(obj1);
    expect(state.value).toBe(obj1);

    change(obj2);
    expect(state.value).toBe(obj2);

    change(obj3);
    expect(state.value).toBe(obj2);
  });

  it('应该支持自定义对象相等性比较', () => {
    const obj1 = { x: 1, y: 1 };
    const obj2 = { x: 1, y: 2 }; // 内容相同，但不是同一个对象
    const obj3 = { x: 2, y: 3 };

    const { state, change } = useOnceState(obj1, {
      equal: (a, b) => a.x === b.x, // 按x属性比较
    });

    change(obj2); // x值相同，不应更改
    expect(state.value).toBe(obj1);

    change(obj3); // x值不同，应该更改
    expect(state.value).toBe(obj3);
  });
});
