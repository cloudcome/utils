import { deepEach } from '@/deep';
import { describe, expect, it } from 'vitest';

describe('deepEach', () => {
  const deepList = [{ value: 1, children: [{ value: 2 }, { value: 3 }] }, { value: 4 }];

  it('应正确执行深度优先遍历', () => {
    const results: number[] = [];

    deepEach(deepList, (info) => {
      results.push(info.item.value);
    });

    expect(results).toEqual([1, 2, 3, 4]);
  });

  it('应正确执行广度优先遍历', () => {
    const results: number[] = [];

    deepEach(
      deepList,
      (info) => {
        results.push(info.item.value);
      },
      true,
    );

    expect(results).toEqual([1, 4, 2, 3]);
  });

  it('应支持提前终止深度遍历', () => {
    const results: number[] = [];

    deepEach(deepList, (info) => {
      results.push(info.item.value);
      if (info.item.value === 2) return false;
    });

    expect(results).toEqual([1, 2]);
  });

  it('应支持提前终止深度遍历', () => {
    const results: number[] = [];

    deepEach(
      deepList,
      (info) => {
        results.push(info.item.value);
        if (info.item.value === 4) return false;
      },
      true,
    );

    expect(results).toEqual([1, 4]);
  });
});
