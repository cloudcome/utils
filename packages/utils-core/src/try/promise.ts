import { errorNormalize } from '@/error';
import type { FlattenReturn } from './types';

export function tryPromise<T>(
  promise: PromiseLike<T>,
): PromiseLike<FlattenReturn<T>> {
  return promise.then(
    (res) => [undefined, res] as const,
    (err) => [errorNormalize(err), undefined] as const,
  );
}
