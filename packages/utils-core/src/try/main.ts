import { isAsyncFunction } from '@/type';
import { tryCallback } from './callback';
import type { CallbackFunction0 } from './curry';
import {
  type AsyncFunction,
  type SyncFunction,
  tryAsync,
  trySync,
} from './function';
import { tryPromise } from './promise';
import type { FlattenReturn } from './types';

export type FlattenAble<T> =
  | SyncFunction<T>
  | AsyncFunction<T>
  | CallbackFunction0<T>
  | PromiseLike<T>;

// 注意顺序 AsyncFunction > SyncFunction > CallbackFunction0 > PromiseLike
// 需要先匹配 AsyncFunction，否则会把入参当做同步函数
export function tryFlatten<T>(
  flattenAble: AsyncFunction<T>,
): Promise<FlattenReturn<T>>;
export function tryFlatten<T>(flattenAble: SyncFunction<T>): FlattenReturn<T>;
export function tryFlatten<T>(
  flattenAble: CallbackFunction0<T> | PromiseLike<T>,
): Promise<FlattenReturn<T>>;
export function tryFlatten<T>(flattenAble: FlattenAble<T>): unknown {
  if ('then' in flattenAble) {
    return tryPromise<T>(flattenAble);
  }

  // SyncFunction | AsyncFunction
  if (flattenAble.length === 0) {
    if (isAsyncFunction(flattenAble))
      return tryAsync<T>(flattenAble as AsyncFunction<T>);
    return trySync<T>(flattenAble as SyncFunction<T>);
  }

  return tryCallback<T>(flattenAble);
}
