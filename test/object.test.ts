import { objectDefaults, objectEach, objectEachAsync, objectMap, objectMerge, objectOmit, objectPick } from '@/object';
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

describe('objectEachAsync', () => {
  it('应正确异步遍历对象的每个键值对', async () => {
    const obj = { a: 1, b: 2, c: 3 };
    const results: [string, number][] = [];
    await objectEachAsync(obj, async (val, key) => {
      results.push([key, val]);
    });
    expect(results).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);
  });

  it('应支持提前终止异步遍历', async () => {
    const obj = { a: 1, b: 2, c: 3 };
    const results: [string, number][] = [];
    await objectEachAsync(obj, async (val, key) => {
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

// 新增 objectDefaults 单测
describe('objectDefaults', () => {
  it('应正确设置默认值', () => {
    const obj = { a: 1, b: undefined };
    const defaults = { a: 4, b: 2, c: 3 };
    const result = objectDefaults(obj, defaults);
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('应支持多个默认对象', () => {
    const obj = { a: 1, b: undefined };
    const defaults1 = { a: 4, b: 2, c: 3 };
    const defaults2 = { a: 5, d: 4 };
    const result = objectDefaults(obj, defaults1, defaults2);
    expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 });
  });

  it('不应覆盖已定义的值', () => {
    const obj = { a: 1, b: 2 };
    const defaults = { a: 5, b: 3, c: 4 };
    const result = objectDefaults(obj, defaults);
    expect(result).toEqual({ a: 1, b: 2, c: 4 });
  });

  it('应处理嵌套对象', () => {
    const obj = { a: { x: 1 }, b: undefined };
    const defaults = { a: { x: 4, z: 3 }, b: { y: 2 } };
    const result = objectDefaults(obj, defaults);
    expect(result).toEqual({ a: { x: 1, z: 3 }, b: { y: 2 } });
  });
});

describe('objectPick', () => {
  it('应正确选择指定键的对象', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = objectPick(obj, ['a', 'c']);
    expect(result).toEqual({ a: 1, c: 3 });
  });

  it('应忽略不存在的键', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 };
    const result = objectPick(obj, ['a', 'd']);
    expect(result).toEqual({ a: 1, d: 4 });
  });

  it('应返回空对象如果键数组为空', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = objectPick(obj, []);
    expect(result).toEqual({});
  });
});

describe('objectOmit', () => {
  it('应正确排除指定键的对象', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = objectOmit(obj, ['a', 'c']);
    expect(result).toEqual({ b: 2 });
  });

  it('应忽略不存在的键', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 };
    const result = objectOmit(obj, ['a', 'd']);
    expect(result).toEqual({ b: 2, c: 3 });
  });

  it('应返回原对象如果键数组为空', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = objectOmit(obj, []);
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });
});

describe('objectMap', () => {
  it('应正确映射对象的每个键值对', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = objectMap(obj, (val, key) => val * 2);
    expect(result).toEqual({ a: 2, b: 4, c: 6 });
  });

  it('应支持将值映射为不同类型的值', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = objectMap(obj, (val, key) => String(val * 2));
    expect(result).toEqual({ a: '2', b: '4', c: '6' });
  });

  it('应返回空对象如果输入对象为空', () => {
    const obj = {};
    const result = objectMap(obj, (val, key) => val);
    expect(result).toEqual({});
  });
});
