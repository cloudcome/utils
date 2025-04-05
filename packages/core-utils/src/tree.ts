import { arrayEach } from './array';
import { isArray, isNullish, isUndefined } from './type';
import type { AnyObject } from './types';

/**
 * 表示深度遍历中的节点对象，包含子节点列表。
 */
export interface TreeItem extends AnyObject {
  /**
   * 子节点列表。
   */
  children?: TreeItem[];
}

/**
 * 表示深度遍历中的节点列表。
 *
 * @template I - 节点对象的类型，必须继承自 `TreeItem`。
 */
export type TreeList<I extends TreeItem> = I[];

/**
 * 表示深度遍历中的遍历器状态。
 *
 * @template I - 节点对象的类型，必须继承自 `TreeItem`。
 */
export interface TreeWalker<I extends TreeItem> {
  /**
   * 当前层级的节点列表。
   */
  list: TreeList<I>;

  /**
   * 当前节点的父节点，如果为根节点则为 `null`。
   */
  parent: I | null;

  /**
   * 当前节点的层级，从 1 开始计数。
   */
  level: number;

  /**
   * 从根节点到当前节点的路径。
   */
  path: TreeList<I>;
}

/**
 * 表示深度遍历中的节点信息。
 *
 * @template I - 节点对象的类型，必须继承自 `TreeItem`。
 */
export interface TreeInfo<I extends TreeItem> extends TreeWalker<I> {
  /**
   * 当前节点。
   */
  item: I;

  /**
   * 当前节点在 `list` 中的索引。
   */
  index: number;
}

/**
 * 深度遍历的同步迭代器函数类型。
 *
 * @template I - 节点对象的类型，必须继承自 `TreeItem`。
 * @param info - 当前节点的信息。
 * @returns 如果返回 `false`，则提前终止遍历。
 */
export type TreeEachIterator<I extends TreeItem> = (info: TreeInfo<I>) => false | unknown;

/**
 * 深度遍历的异步迭代器函数类型。
 *
 * @template I - 节点对象的类型，必须继承自 `TreeItem`。
 * @param info - 当前节点的信息。
 * @returns 如果返回 `false`，则提前终止遍历。
 */
export type TreeEachIteratorAsync<I extends TreeItem> = (info: TreeInfo<I>) => Promise<boolean | unknown>;

/**
 * 深度遍历的同步遍历器函数类型。
 *
 * @template I - 节点对象的类型，必须继承自 `TreeItem`。
 * @param walker - 遍历器状态。
 * @returns 遍历结果。
 */
export type TreeWalk<I extends TreeItem> = (walker: TreeWalker<I>) => unknown;

/**
 * 深度遍历的异步遍历器函数类型。
 *
 * @template I - 节点对象的类型，必须继承自 `TreeItem`。
 * @param walker - 遍历器状态。
 * @returns 异步遍历结果。
 */
export type TreeWalkAsync<I extends TreeItem> = (walker: TreeWalker<I>) => Promise<unknown>;

/**
 * 深度遍历数组中的每个元素，并对每个元素执行提供的回调函数。
 *
 * @param treeList - 要遍历的深度数组。
 * @param iterator - 对每个元素执行的回调函数。如果回调函数返回 `false`，则提前终止遍历。
 * @param breadthFist - 是否使用广度优先遍历，默认为 `false`（深度优先）。
 * @returns 无返回值。
 *
 * @example
 * ```typescript
 * const treeList = [
 *   { value: 1, children: [{ value: 2 }, { value: 3 }] },
 *   { value: 4 }
 * ];
 *
 * treeEach(treeList, (item) => {
 *   console.log(item.value);
 *   if (item.value === 2) return false; // 提前终止遍历
 * });
 * ```
 */
export function treeEach<I extends TreeItem = TreeItem>(
  treeList: TreeList<I>,
  iterator: TreeEachIterator<I>,
  breadthFist = false,
): void {
  const treeInfoList: TreeInfo<I>[] = [];
  let returnFalse = false;

  const iterate = (info: TreeInfo<I>) => {
    if (iterator(info) === false) {
      returnFalse = true;
      return false;
    }
  };

  const next = (info: TreeInfo<I>, walk: TreeWalk<I>) => {
    const { item, level, parent, path } = info;
    const { children } = item;

    if (isArray(children)) {
      returnFalse =
        walk({
          ...info,
          parent: item,
          list: children as TreeList<I>,
          level: level + 1,
        }) === false;
    }
  };

  const walk: TreeWalk<I> = (walker) => {
    const { list, level, parent, path } = walker;

    const path2 = [...path];
    while (parent !== null && path2.length > 0 && path2[path2.length - 1] !== parent) {
      path2.pop();
    }

    arrayEach(list, (item, index) => {
      if (returnFalse) return false;

      const info: TreeInfo<I> = {
        ...walker,
        item,
        index,
        path: [...path2, item],
      };

      // 广度优先
      if (breadthFist) {
        treeInfoList.push(info);
      }
      // 深度优先
      else {
        iterate(info);
        if (returnFalse) return false;
        next(info, walk);
      }
    });

    if (breadthFist) {
      while (!returnFalse) {
        const info = treeInfoList.shift();
        if (!info) break;

        iterate(info);
        if (returnFalse) break;

        // 内部也会进入 walk
        next(info, walk);
      }
    }

    return !returnFalse;
  };

  walk({
    list: treeList,
    level: 1,
    parent: null,
    path: [],
  });
}

/**
 * 在深度数组中查找满足条件的第一个节点信息。
 *
 * @param treeList - 要查找的深度数组。
 * @param predicate - 判断节点是否满足条件的回调函数。
 * @param breadthFist - 是否使用广度优先查找，默认为 `false`（深度优先）。
 * @returns 如果找到满足条件的节点，则返回该节点的信息；否则返回 `undefined`。
 *
 * @example
 * ```typescript
 * const treeList = [
 *   { value: 1, children: [{ value: 2 }, { value: 3 }] },
 *   { value: 4 }
 * ];
 *
 * const found = treeFind(treeList, (info) => info.item.value === 3);
 * console.log(found);
 * // {
 * //    item: { value: 3 },
 * //    index: 1,
 * //    list: [{ value: 2 }, { value: 3 }],
 * //    parent: { value: 1, children: [{ value: 2 }, { value: 3 }] },
 * //    level: 2,
 * //    path: [{ value: 1, children: [{ value: 2 }, { value: 3 }] }, { value: 3 }]
 * // }
 * ```
 */
export function treeFind<I extends TreeItem>(
  treeList: TreeList<I>,
  predicate: (info: TreeInfo<I>) => boolean,
  breadthFist = false,
): TreeInfo<I> | undefined {
  let found: TreeInfo<I> | undefined;

  treeEach(
    treeList,
    (info) => {
      if (predicate(info)) {
        found = info;
        return false;
      }
    },
    breadthFist,
  );

  return found;
}

/**
 * 将深度嵌套的树形结构扁平化为一维数组，并对每个节点执行指定的转换函数。
 *
 * @template I - 树节点的类型，必须继承自 `TreeItem`。
 * @template T - 转换后的数据类型。
 * @param {TreeList<I>} deepList - 要扁平化的深度嵌套树形结构。
 * @param {(info: TreeInfo<I>) => T} flatten - 对每个节点执行的转换函数，返回转换后的数据。
 * @param {boolean} [breadthFist=false] - 是否使用广度优先遍历，默认为 `false`（深度优先）。
 * @returns {T[]} - 转换后的一维数组。
 * @example
 * ```typescript
 * const treeList = [
 *   { value: 1, children: [{ value: 2 }, { value: 3 }] },
 *   { value: 4 }
 * ];
 *
 * const flattened = deepFlat(treeList, (info) => info.item.value);
 * console.log(flattened); // [1, 2, 3, 4]
 * ```
 */
export function deepFlat<I extends TreeItem, T>(
  deepList: TreeList<I>,
  flatten: (info: TreeInfo<I>) => T,
  breadthFist = false,
): T[] {
  const list2: T[] = [];

  treeEach(
    deepList,
    (info) => {
      list2.push(flatten(info));
    },
    breadthFist,
  );

  return list2;
}

type FromItemInfo<I> = {
  selfKey: unknown;
  parentKey: unknown;
  item: I;
  index: number;
};

export interface TreeFromOptions<I extends TreeItem> {
  getSelfKey: (item: I, index: number) => unknown;
  getParentKey: (item: I, index: number) => unknown;
  appendChild: (parentInfo: FromItemInfo<I>, info: FromItemInfo<I>) => unknown;
}

/**
 * 从扁平列表构建树形结构。
 *
 * @template I - 节点对象的类型，必须继承自 `AnyObject`。
 * @param {I[]} list - 扁平化的节点列表。
 * @param {TreeFromOptions<I>} options - 构建树形结构的配置选项。
 * @param {function} options.getSelfKey - 获取节点自身唯一标识的函数。
 * @param {function} options.getParentKey - 获取节点父节点唯一标识的函数。
 * @param {function} options.appendChild - 将子节点添加到父节点的函数。
 * @returns {I | undefined} - 构建的树形结构的根节点，如果未找到根节点则返回 `undefined`。
 *
 * @example
 * ```typescript
 * const list = [
 *   { id: 1, parentId: null, name: 'Root' },
 *   { id: 2, parentId: 1, name: 'Child 1' },
 *   { id: 3, parentId: 1, name: 'Child 2' }
 * ];
 *
 * const tree = treeFrom(list, {
 *   getSelfKey: (item) => item.id,
 *   getParentKey: (item) => item.parentId,
 *   appendChild: (parent, info) => {
 *     if (!parent.children) parent.children = [];
 *     parent.children.push(info.item);
 *   }
 * });
 *
 * console.log(tree);
 * // {
 * //   id: 1,
 * //   parentId: null,
 * //   name: 'Root',
 * //   children: [
 * //     { id: 2, parentId: 1, name: 'Child 1' },
 * //     { id: 3, parentId: 1, name: 'Child 2' }
 * //   ]
 * // }
 * ```
 */
export function treeFrom<I extends TreeItem>(list: I[], options: TreeFromOptions<I>): TreeList<I> | undefined {
  const keyMap = new Map<unknown, FromItemInfo<I>>();
  const freeSet = new Set<FromItemInfo<I>>();
  const roots: TreeList<I> = [];

  // 分配节点
  const assign = (info: FromItemInfo<I>, isFirst = false) => {
    const { selfKey, parentKey, item, index } = info;

    // 父级指向为空
    if (isNullish(parentKey)) {
      roots.push(item);
    }
    // 父级指向不为空
    else {
      const parent = keyMap.get(parentKey);

      // 未找到父级节点
      if (isUndefined(parent)) {
        // 游离节点
        if (isFirst) freeSet.add(info);
      }
      // 已找到父级节点
      else {
        options.appendChild(parent, info);
      }
    }
  };

  // 构建 map
  arrayEach(list, (item, index) => {
    const selfKey = options.getSelfKey(item, index);
    const parentKey = options.getParentKey(item, index);

    if (isNullish(selfKey)) return;

    const info = { selfKey, parentKey, item, index };
    keyMap.set(selfKey, info);

    assign(info, true);
  });

  // 处理游离节点
  for (const info of freeSet.values()) {
    assign(info);
  }

  return roots;
}
