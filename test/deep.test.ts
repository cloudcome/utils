import { type DeepItem, type DeepList, deepEach, deepFind } from '@/deep';
import { describe, expect, it } from 'vitest';

interface TestDeepItem extends DeepItem {
  id: string;
}

const deepList: TestDeepItem[] = [
  {
    id: '1',
    children: [
      {
        id: '1-1',
        children: [
          {
            id: '1-1-1',
          },
        ],
      },
      {
        id: '1-2',
        children: [
          {
            id: '1-2-1',
          },
        ],
      },
    ],
  },
];

describe('deepEach', () => {
  it('应正确执行深度优先遍历', () => {
    const results: string[] = [];

    deepEach(deepList, (info) => {
      results.push(info.item.id);
    });

    expect(results).toEqual(['1', '1-1', '1-1-1', '1-2', '1-2-1']);
  });

  it('应正确执行广度优先遍历', () => {
    const results: string[] = [];

    deepEach(
      deepList,
      (info) => {
        results.push(info.item.id);
      },
      true,
    );

    expect(results).toEqual(['1', '1-1', '1-2', '1-1-1', '1-2-1']);
  });

  it('应支持提前终止深度遍历', () => {
    const results: string[] = [];

    deepEach(deepList, (info) => {
      results.push(info.item.id);
      if (info.item.id === '1-1-1') return false;
    });

    expect(results).toEqual(['1', '1-1', '1-1-1']);
  });

  it('应支持提前终止深度遍历', () => {
    const results: string[] = [];

    deepEach(
      deepList,
      (info) => {
        results.push(info.item.id);
        if (info.item.id === '1-2') return false;
      },
      true,
    );

    expect(results).toEqual(['1', '1-1', '1-2']);
  });

  it('深度优先信息', () => {
    const idList: string[] = [];
    const parentList: (TestDeepItem | null)[] = [];
    const levelList: number[] = [];
    const pathList: string[][] = [];

    deepEach(deepList, ({ item, index, list, parent, level, path }) => {
      idList.push(item.id);
      parentList.push(parent);
      levelList.push(level);
      pathList.push(path.map((item) => item.id));
    });

    let i = 0;
    // console.log(idList);
    expect(idList[i++]).toEqual('1');
    expect(idList[i++]).toEqual('1-1');
    expect(idList[i++]).toEqual('1-1-1');
    expect(idList[i++]).toEqual('1-2');
    expect(idList[i++]).toEqual('1-2-1');
    expect(idList[i++]).toEqual(undefined);
    let j = 0;
    // console.log(parentList);
    expect(parentList[j++]).toEqual(null);
    expect(parentList[j++]?.id).toEqual('1');
    expect(parentList[j++]?.id).toEqual('1-1');
    expect(parentList[j++]?.id).toEqual('1');
    expect(parentList[j++]?.id).toEqual('1-2');
    expect(parentList[j++]).toEqual(undefined);
    let k = 0;
    // console.log(levelList);
    expect(levelList[k++]).toEqual(1);
    expect(levelList[k++]).toEqual(2);
    expect(levelList[k++]).toEqual(3);
    expect(levelList[k++]).toEqual(2);
    expect(levelList[k++]).toEqual(3);
    expect(levelList[k++]).toEqual(undefined);

    expect(pathList).toEqual([
      //
      ['1'],
      ['1', '1-1'],
      ['1', '1-1', '1-1-1'],
      ['1', '1-2'],
      ['1', '1-2', '1-2-1'],
    ]);
  });

  it('广度优先信息', () => {
    const idList: string[] = [];
    const parentList: (TestDeepItem | null)[] = [];
    const levelList: number[] = [];
    const pathList: string[][] = [];

    deepEach(
      deepList,
      ({ item, index, list, parent, level, path }) => {
        idList.push(item.id);
        parentList.push(parent);
        levelList.push(level);
        pathList.push(path.map((item) => item.id));
      },
      true,
    );

    let i = 0;
    // console.log(idList);
    expect(idList[i++]).toEqual('1');
    expect(idList[i++]).toEqual('1-1');
    expect(idList[i++]).toEqual('1-2');
    expect(idList[i++]).toEqual('1-1-1');
    expect(idList[i++]).toEqual('1-2-1');
    expect(idList[i++]).toEqual(undefined);
    let j = 0;
    // console.log(parentList);
    expect(parentList[j++]).toEqual(null);
    expect(parentList[j++]?.id).toEqual('1');
    expect(parentList[j++]?.id).toEqual('1');
    expect(parentList[j++]?.id).toEqual('1-1');
    expect(parentList[j++]?.id).toEqual('1-2');
    expect(parentList[j++]).toEqual(undefined);
    let k = 0;
    // console.log(levelList);
    expect(levelList[k++]).toEqual(1);
    expect(levelList[k++]).toEqual(2);
    expect(levelList[k++]).toEqual(2);
    expect(levelList[k++]).toEqual(3);
    expect(levelList[k++]).toEqual(3);
    expect(levelList[k++]).toEqual(undefined);

    expect(pathList).toEqual([
      //
      ['1'],
      ['1', '1-1'],
      ['1', '1-2'],
      ['1', '1-1', '1-1-1'],
      ['1', '1-2', '1-2-1'],
    ]);
  });
});

describe('deepFind', () => {
  it('深度优先', () => {
    const expected = deepList[0].children?.[1].children?.[0];
    const found2 = deepFind(deepList, (info) => info.item.id === '1-2-1');

    expect(found2?.item).toBe(expected);
    expect(found2?.item.id).toEqual('1-2-1');
    expect(found2?.index).toEqual(0);
    expect(found2?.list).toBe(deepList[0].children?.[1].children);
    expect(found2?.parent).not.toBe(null);
    expect(found2?.parent?.id).toEqual('1-2');
    expect(found2?.level).toEqual(3);
    expect(found2?.path.map((el) => el.id)).toEqual(['1', '1-2', '1-2-1']);
  });

  it('广度优先', () => {
    const expected = deepList[0].children?.[1].children?.[0];
    const found2 = deepFind(deepList, (info) => info.item.id === '1-2-1', true);

    expect(found2?.item).toBe(expected);
    expect(found2?.item.id).toEqual('1-2-1');
    expect(found2?.index).toEqual(0);
    expect(found2?.list).toBe(deepList[0].children?.[1].children);
    expect(found2?.parent).not.toBe(null);
    expect(found2?.parent?.id).toEqual('1-2');
    expect(found2?.level).toEqual(3);
    expect(found2?.path.map((el) => el.id)).toEqual(['1', '1-2', '1-2-1']);
  });

  it('应返回 undefined 如果没有找到满足条件的节点', () => {
    const found = deepFind(deepList, (info) => info.item.id === 'nonexistent');
    expect(found).toBeUndefined();
  });
});
