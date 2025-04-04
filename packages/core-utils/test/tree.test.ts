import { type TreeItem, deepFlat, treeEach, treeFind, treeFrom } from '@/tree';
import { describe, expect, it } from 'vitest';

interface TestTreeItem extends TreeItem {
  id: string;
}

const treeList: TestTreeItem[] = [
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

describe('treeEach', () => {
  it('应正确执行深度优先遍历', () => {
    const results: string[] = [];

    treeEach(treeList, (info) => {
      results.push(info.item.id);
    });

    expect(results).toEqual(['1', '1-1', '1-1-1', '1-2', '1-2-1']);
  });

  it('应正确执行广度优先遍历', () => {
    const results: string[] = [];

    treeEach(
      treeList,
      (info) => {
        results.push(info.item.id);
      },
      true,
    );

    expect(results).toEqual(['1', '1-1', '1-2', '1-1-1', '1-2-1']);
  });

  it('应支持提前终止深度遍历', () => {
    const results: string[] = [];

    treeEach(treeList, (info) => {
      results.push(info.item.id);
      if (info.item.id === '1-1-1') return false;
    });

    expect(results).toEqual(['1', '1-1', '1-1-1']);
  });

  it('应支持提前终止深度遍历', () => {
    const results: string[] = [];

    treeEach(
      treeList,
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
    const parentList: (TestTreeItem | null)[] = [];
    const levelList: number[] = [];
    const pathList: string[][] = [];

    treeEach(treeList, ({ item, index, list, parent, level, path }) => {
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
    const parentList: (TestTreeItem | null)[] = [];
    const levelList: number[] = [];
    const pathList: string[][] = [];

    treeEach(
      treeList,
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

describe('treeFind', () => {
  it('深度优先', () => {
    const expected = treeList[0].children?.[1].children?.[0];
    const found2 = treeFind(treeList, (info) => info.item.id === '1-2-1');

    expect(found2?.item).toBe(expected);
    expect(found2?.item.id).toEqual('1-2-1');
    expect(found2?.index).toEqual(0);
    expect(found2?.list).toBe(treeList[0].children?.[1].children);
    expect(found2?.parent).not.toBe(null);
    expect(found2?.parent?.id).toEqual('1-2');
    expect(found2?.level).toEqual(3);
    expect(found2?.path.map((el) => el.id)).toEqual(['1', '1-2', '1-2-1']);
  });

  it('广度优先', () => {
    const expected = treeList[0].children?.[1].children?.[0];
    const found2 = treeFind(treeList, (info) => info.item.id === '1-2-1', true);

    expect(found2?.item).toBe(expected);
    expect(found2?.item.id).toEqual('1-2-1');
    expect(found2?.index).toEqual(0);
    expect(found2?.list).toBe(treeList[0].children?.[1].children);
    expect(found2?.parent).not.toBe(null);
    expect(found2?.parent?.id).toEqual('1-2');
    expect(found2?.level).toEqual(3);
    expect(found2?.path.map((el) => el.id)).toEqual(['1', '1-2', '1-2-1']);
  });

  it('应返回 undefined 如果没有找到满足条件的节点', () => {
    const found = treeFind(treeList, (info) => info.item.id === 'nonexistent');
    expect(found).toBeUndefined();
  });
});

describe('treeFlat', () => {
  it('深度优先', () => {
    const shallowList = deepFlat(treeList, ({ item }) => item.id);
    expect(shallowList).toEqual(['1', '1-1', '1-1-1', '1-2', '1-2-1']);
  });

  it('广度优先', () => {
    const shallowList = deepFlat(treeList, ({ item }) => item.id, true);
    expect(shallowList).toEqual(['1', '1-1', '1-2', '1-1-1', '1-2-1']);
  });
});

describe('treeFrom', () => {
  it('应从扁平列表构建树形结构', () => {
    const list = [
      { id: 1, parentId: 0, name: 'Root' },
      { id: 2, parentId: 1, name: 'Child 1' },
      { id: 3, parentId: 1, name: 'Child 2' },
      { id: 4, parentId: 2, name: 'Grandchild 1' },
    ];

    const tree = treeFrom(list, {
      getSelfKey: (item) => item.id,
      getParentKey: (item) => (item.parentId === 0 ? null : item.parentId),
      appendChild: (parent, info) => {
        const parentItem = parent.item as typeof parent.item & { children: (typeof parent.item)[] };
        if (!parentItem.children) parentItem.children = [];
        parentItem.children.push(info.item);
      },
    });

    expect(tree).toEqual([
      {
        id: 1,
        parentId: 0,
        name: 'Root',
        children: [
          {
            id: 2,
            parentId: 1,
            name: 'Child 1',
            children: [{ id: 4, parentId: 2, name: 'Grandchild 1' }],
          },
          { id: 3, parentId: 1, name: 'Child 2' },
        ],
      },
    ]);
  });

  it('应处理游离节点', () => {
    const list = [
      { id: 2, parentId: 3, name: 'Child 1' },
      { id: 1, parentId: 0, name: 'Root' },
      { id: 3, parentId: 1, name: 'Child 2' },
    ];

    const tree = treeFrom(list, {
      getSelfKey: (item) => item.id,
      getParentKey: (item) => (item.parentId === 0 ? null : item.parentId),
      appendChild: (parent, info) => {
        const parentItem = parent.item as typeof parent.item & { children: (typeof parent.item)[] };
        if (!parentItem.children) parentItem.children = [];
        parentItem.children.push(info.item);
      },
    });

    expect(tree).toEqual([
      {
        id: 1,
        parentId: 0,
        name: 'Root',
        children: [
          {
            id: 3,
            parentId: 1,
            name: 'Child 2',
            children: [{ id: 2, parentId: 3, name: 'Child 1' }],
          },
        ],
      },
    ]);
  });

  it('应返回 undefined 如果未找到根节点', () => {
    const list = [
      { id: 11, parentId: 2, name: 'Child 1' },
      { id: 12, parentId: 1, name: 'Child 2' },
      { id: 13, parentId: 3, name: 'Child 3' },
      { id: 1, parentId: 0, name: 'Root' },
      { id: 2, parentId: 0, name: 'Root' },
    ];

    const tree = treeFrom(list, {
      getSelfKey: (item) => item.id,
      getParentKey: (item) => (item.parentId === 0 ? null : item.parentId),
      appendChild: (parent, info) => {
        const parentItem = parent.item as typeof parent.item & { children: (typeof parent.item)[] };
        if (!parentItem.children) parentItem.children = [];
        parentItem.children.push(info.item);
      },
    });

    expect(tree).toEqual([
      {
        id: 1,
        parentId: 0,
        name: 'Root',
        children: [
          {
            id: 12,
            parentId: 1,
            name: 'Child 2',
          },
        ],
      },
      {
        id: 2,
        parentId: 0,
        name: 'Root',
        children: [
          {
            id: 11,
            parentId: 2,
            name: 'Child 1',
          },
        ],
      },
    ]);
  });
});
