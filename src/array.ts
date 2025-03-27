import { isArray, isObject } from './is';

/**
 * 检查给定的值是否为类数组对象。
 *
 * 类数组对象是指具有 `length` 属性且 `length` 属性为非负数的对象。
 *
 * @param unknown - 要检查的值。
 * @returns 如果值是类数组对象，则返回 `true`，否则返回 `false`。
 */
export function isArrayLike(unknown: unknown) {
  return isArray(unknown) || (isObject(unknown) && typeof unknown.length === 'number' && unknown.length >= 0);
}

/**
 * 从数组中选择指定索引的元素。
 *
 * @param array - 要从中选择元素的数组。
 * @param indexes - 要选择的元素的索引数组。
 * @returns 包含指定索引元素的新数组。
 */
export function arrayPick<T>(array: T[], indexes: number[]) {
  return array.filter((_, i) => indexes.includes(i));
}

/**
 * 从数组中排除指定索引的元素。
 *
 * @param array - 要从中排除元素的数组。
 * @param indexes - 要排除的元素的索引数组。
 * @returns 包含排除指定索引元素后的新数组。
 */
export function arrayOmit<T>(array: T[], indexes: number[]) {
  return array.filter((_, i) => !indexes.includes(i));
}
