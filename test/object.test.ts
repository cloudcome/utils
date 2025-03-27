import { objectEach, objectMerge } from '@/object';
import { describe, expect, it } from 'vitest';

describe('objectEach', () => {
  it('应正确遍历对象的每个键值对', () => {
    const obj = { a: 1, b: 2, c: 3 };
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const results: any[] = [];
    objectEach(obj, (val, key) => {
      results.push([key, val]);
    });
    expect(results).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);
  });

  it('应支持提前终止遍历', () => {
    const obj = { a: 1, b: 2, c: 3 };
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const results: any[] = [];
    objectEach(obj, (val, key) => {
      results.push([key, val]);
      if (key === 'b') {
        return false;
      }
    });
    expect(results).toEqual([
      ['a', 1],
      ['b', 2],
    ]);
  });
});

describe('objectMerge', () => {
  it('应正确合并两个对象', () => {
    const obj1 = { a: 1, b: { x: 10 } };
    const obj2 = { b: { y: 20 }, c: 3 };
    const merged = objectMerge(obj1, obj2);
    expect(merged).toEqual({ a: 1, b: { x: 10, y: 20 }, c: 3 });
  });

  it('应正确处理循环引用', () => {
    const obj1 = { a: 1 };
    const obj2 = { c: obj1 };
    // { a: 1, b: <{b: obj1}> }
    // @ts-expect-error
    obj1.b = obj2;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const merged = objectMerge({}, obj1) as any;
    expect(merged.a).toBe(1);
    expect(merged.b.c).toBe(merged);
  });

  it('应正确合并多个对象', () => {
    const obj1 = { a: 1 };
    const obj2 = { b: 2 };
    const obj3 = { c: 3 };
    const merged = objectMerge(obj1, obj2, obj3);
    expect(merged).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('应正确合并数组', () => {
    const obj1 = { a: [1, 2, 3] };
    const obj2 = { a: [3, 4] };
    const merged = objectMerge(obj1, obj2);
    expect(merged).toEqual({ a: [3, 4, 3] });
  });

  it('不同类型的值应被覆盖，返回数组', () => {
    const obj1 = { a: 1 };
    const obj2 = [1];
    const merged = objectMerge(obj1, obj2);
    expect(merged).toEqual([1]);
  });

  it('不同类型的值应被覆盖，返回对象', () => {
    const obj1 = { a: 1 };
    const obj2 = [1];
    const merged = objectMerge(obj2, obj1);
    expect(merged).toEqual({ a: 1 });
  });
});
