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

// /**
//  * 深度遍历
//  * @param {DeepList} deepList
//  * @param {DeepEachIterator} iterator
//  * @param {boolean} breadthFist 是否广度优先
//  */
// export async function deepEachAsync<I extends DeepItem = DeepItem>(
//   deepList: DeepList<I>,
//   iterator: DeepEachIteratorAsync<I>,
//   breadthFist = false,
// ): Promise<void> {
//   const deepWalkers: DeepWalker<I>[] = [];
//   let returnFalse = false;
//   const iterate = async (walker: DeepWalker<I>) => {
//     const { item, index, list, parent, level, path } = walker;
//     if ((await iterator(item, index, list, parent, level, path)) === false) {
//       returnFalse = true;
//       return false;
//     }
//   };
//   const next = async (walker: DeepWalker<I>, walk: DeepWalkAsync<I>) => {
//     const { item, level, path } = walker;
//     const { children } = item;

//     if (isArray(children)) returnFalse = (await walk(children as DeepList<I>, level + 1, item, path)) === false;
//   };
//   const walk: DeepWalkAsync<I> = async (deepList: DeepList<I>, level: number, parent: I | null, path) => {
//     const path2 = [...path];
//     while (parent !== null && path2.length > 0 && path2[path2.length - 1] !== parent) {
//       path2.pop();
//     }

//     await arrayEachAsync(deepList, async (item, index) => {
//       if (returnFalse) return false;
//       const walker: DeepWalker<I> = { item, index, list: deepList, parent, level, path: [...path2, item] };

//       // 广度优先
//       if (breadthFist) {
//         deepWalkers.push(walker);
//       }
//       // 深度优先
//       else {
//         await iterate(walker);
//         if (returnFalse) return false;
//         await next(walker, walk);
//       }
//     });

//     if (breadthFist) {
//       while (true) {
//         const walker = deepWalkers.shift();
//         if (!walker) break;

//         await iterate(walker);
//         if (returnFalse) break;
//         await next(walker, walk);
//       }
//     }

//     return !returnFalse;
//   };

//   await walk(deepList, 1, null, []);
// }

// export type DeepMapIterator<I extends DeepItem, O extends DeepItem> = (
//   item: I,
//   index: number,
//   list: DeepList<I>,
//   parent: O | null,
//   level: number,
//   path: DeepList<O>,
// ) => O;
// /**
//  * 深度替换
//  * @param {DeepList} deepList
//  * @param {DeepMapIterator} iterator
//  * @returns {DeepItem[]}
//  */
// export const deepMap = <I extends DeepItem = DeepItem, O extends DeepItem = DeepItem>(
//   deepList: DeepList<I>,
//   iterator: DeepMapIterator<I, O>,
// ): DeepList<O> => {
//   const walk = (deepList: DeepList<I>, parent: O | null, level: number, path: DeepList<O>): DeepList<O> => {
//     const list2: DeepList<O> = [];
//     const path2 = [...path];
//     while (parent !== null && path2.length > 0 && path2[path2.length - 1] !== parent) {
//       path2.pop();
//     }

//     arrayEach(deepList, (val, index) => {
//       const { children } = val;
//       const data = iterator(val, index, deepList, parent, level, path);

//       if (isArray(children)) data.children = walk(children as DeepList<I>, data, level + 1, path);

//       list2.push(data);
//     });

//     return list2;
//   };

//   return walk(deepList, null, 1, []);
// };

// /**
//  * 展平
//  * @param {DeepList<I>} deepList
//  * @param {boolean} breadthFist
//  * @returns {I[]}
//  */
// export const deepFlat = <I extends DeepItem = DeepItem>(deepList: DeepList<I>, breadthFist = false): I[] => {
//   const list2: I[] = [];

//   deepEach(
//     deepList,
//     (item, index, list, parent, level) => {
//       list2.push(item);
//     },
//     breadthFist,
//   );

//   return list2;
// };

// export interface DeepFound<I extends DeepItem> {
//   item: I;
//   index: number;
//   list: DeepList<I>;
//   parent: I | null;
//   level: number;
//   path: DeepList<I>;
// }

// export type DeepMatcher<I extends DeepItem> = (found: DeepFound<I>) => boolean;

// export type DeepExpected<I extends DeepItem> = DeepMatcher<I> | I;

// /**
//  * 深度查找
//  * @param {DeepList} deepList
//  * @param {DeepExpected} expected
//  * @returns {DeepFound | null}
//  */
// export const deepFind = <I extends DeepItem = DeepItem>(
//   deepList: DeepList<I>,
//   expected: DeepExpected<I>,
// ): DeepFound<I> | null => {
//   let matcher: DeepMatcher<I>;

//   if (isFunction(expected)) {
//     matcher = expected;
//   } else {
//     matcher = (actual) => actual.item === expected;
//   }

//   let found = null;

//   deepEach(
//     deepList,
//     (item, index, list, parent, level, path) => {
//       if (matcher({ item, index, list, parent, level, path })) {
//         found = { item, index, list, parent, level, path };
//         return false;
//       }
//     },
//     false,
//   );

//   return found;
// };

// export type DeepFilter<I extends DeepItem> = (
//   item: I,
//   index: number,
//   list: DeepList<I>,
//   parent: I | null,
//   level: number,
// ) => boolean;
// /**
//  * 过滤替换
//  * @param {DeepList} deepList
//  * @param {DeepFilter} filter
//  * @returns {DeepList}
//  */
// export const deepFilter = <I extends DeepItem = DeepItem>(
//   deepList: DeepList<I>,
//   filter: DeepFilter<I>,
// ): DeepList<I> => {
//   const walk = (list1: DeepList<I>, parent: I | null, level: number) => {
//     const list2: DeepList<I> = [];

//     list1.forEach((item, index) => {
//       const { children } = item;
//       const filtered = filter(item, index, list1, parent, level);

//       if (!filtered) {
//         return;
//       }

//       if (isArray(children)) item.children = walk(children as DeepList<I>, item, level + 1);

//       list2.push(item);
//     });

//     return list2;
//   };

//   return walk(deepList, null, 1);
// };
