import { arrayEach, arrayEachAsync } from './array';
import { isArray, isFunction } from './is';
import type { AnyObject } from './types';

/**
 * 表示深度遍历中的节点对象，包含子节点列表。
 */
export interface DeepItem extends AnyObject {
  /**
   * 子节点列表。
   */
  children?: DeepItem[];
}

/**
 * 表示深度遍历中的节点列表。
 *
 * @template I - 节点对象的类型，必须继承自 `DeepItem`。
 */
export type DeepList<I extends DeepItem> = I[];

/**
 * 表示深度遍历中的遍历器状态。
 *
 * @template I - 节点对象的类型，必须继承自 `DeepItem`。
 */
export interface DeepWalker<I extends DeepItem> {
  /**
   * 当前层级的节点列表。
   */
  list: DeepList<I>;

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
  path: DeepList<I>;
}

/**
 * 表示深度遍历中的节点信息。
 *
 * @template I - 节点对象的类型，必须继承自 `DeepItem`。
 */
export interface DeepInfo<I extends DeepItem> extends DeepWalker<I> {
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
 * @template I - 节点对象的类型，必须继承自 `DeepItem`。
 * @param info - 当前节点的信息。
 * @returns 如果返回 `false`，则提前终止遍历。
 */
export type DeepEachIterator<I extends DeepItem> = (info: DeepInfo<I>) => false | unknown;

/**
 * 深度遍历的异步迭代器函数类型。
 *
 * @template I - 节点对象的类型，必须继承自 `DeepItem`。
 * @param info - 当前节点的信息。
 * @returns 如果返回 `false`，则提前终止遍历。
 */
export type DeepEachIteratorAsync<I extends DeepItem> = (info: DeepInfo<I>) => Promise<boolean | unknown>;

/**
 * 深度遍历的同步遍历器函数类型。
 *
 * @template I - 节点对象的类型，必须继承自 `DeepItem`。
 * @param walker - 遍历器状态。
 * @returns 遍历结果。
 */
export type DeepWalk<I extends DeepItem> = (walker: DeepWalker<I>) => unknown;

/**
 * 深度遍历的异步遍历器函数类型。
 *
 * @template I - 节点对象的类型，必须继承自 `DeepItem`。
 * @param walker - 遍历器状态。
 * @returns 异步遍历结果。
 */
export type DeepWalkAsync<I extends DeepItem> = (walker: DeepWalker<I>) => Promise<unknown>;

/**
 * 深度遍历数组中的每个元素，并对每个元素执行提供的回调函数。
 *
 * @param deepList - 要遍历的深度数组。
 * @param iterator - 对每个元素执行的回调函数。如果回调函数返回 `false`，则提前终止遍历。
 * @param breadthFist - 是否使用广度优先遍历，默认为 `false`（深度优先）。
 * @returns 无返回值。
 *
 * @example
 * ```typescript
 * const deepList = [
 *   { value: 1, children: [{ value: 2 }, { value: 3 }] },
 *   { value: 4 }
 * ];
 *
 * deepEach(deepList, (item) => {
 *   console.log(item.value);
 *   if (item.value === 2) return false; // 提前终止遍历
 * });
 * ```
 */
export function deepEach<I extends DeepItem = DeepItem>(
  deepList: DeepList<I>,
  iterator: DeepEachIterator<I>,
  breadthFist = false,
): void {
  const deepInfoList: DeepInfo<I>[] = [];
  let returnFalse = false;

  const iterate = (info: DeepInfo<I>) => {
    if (iterator(info) === false) {
      returnFalse = true;
      return false;
    }
  };

  const next = (info: DeepInfo<I>, walk: DeepWalk<I>) => {
    const { item, level, parent, path } = info;
    const { children } = item;

    if (isArray(children)) {
      returnFalse =
        walk({
          ...info,
          parent: item,
          list: children as DeepList<I>,
          level: level + 1,
        }) === false;
    }
  };

  const walk: DeepWalk<I> = (walker) => {
    const { list, level, parent, path } = walker;

    const path2 = [...path];
    while (parent !== null && path2.length > 0 && path2[path2.length - 1] !== parent) {
      path2.pop();
    }

    arrayEach(list, (item, index) => {
      if (returnFalse) return false;

      const info: DeepInfo<I> = {
        ...walker,
        item,
        index,
        path: [...path2, item],
      };

      // 广度优先
      if (breadthFist) {
        deepInfoList.push(info);
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
        const info = deepInfoList.shift();
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
    list: deepList,
    level: 1,
    parent: null,
    path: [],
  });
}
