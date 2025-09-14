import { isAsyncFunction } from '@/type';
import type { CallbackFunction0 } from './callbackCurry';
import { tryCallback } from './tryCallback';
import { type AsyncFunction, type SyncFunction, tryAsync, trySync } from './tryFunction';
import { tryPromise } from './tryPromise';
import type { FlattenReturn } from './types';

export type FlattenAble<T> = SyncFunction<T> | AsyncFunction<T> | CallbackFunction0<T> | PromiseLike<T>;

export function tryFlatten<T>(flattenAble: SyncFunction<T>): FlattenReturn<T>;
export function tryFlatten<T>(flattenAble: AsyncFunction<T>): FlattenReturn<T>;
export function tryFlatten<T>(flattenAble: CallbackFunction0<T> | PromiseLike<T>): Promise<FlattenReturn<T>>;
export function tryFlatten<T>(flattenAble: FlattenAble<T>): unknown {
  if ('then' in flattenAble) {
    return tryPromise<T>(flattenAble);
  }

  // SyncFunction | AsyncFunction
  if (flattenAble.length === 0) {
    if (isAsyncFunction(flattenAble)) return tryAsync<T>(flattenAble as AsyncFunction<T>);
    return trySync<T>(flattenAble as SyncFunction<T>);
  }

  return tryCallback<T>(flattenAble);
}
