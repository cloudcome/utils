import { errorNormalize } from '@/error';
import type { FlattenReturn } from './types';

export type SyncFunction<T> = () => T;

export function trySync<T>(syncFn: SyncFunction<T>): FlattenReturn<T> {
  try {
    return [undefined, syncFn()] as const;
  } catch (err) {
    return [errorNormalize(err), undefined] as const;
  }
}

export type AsyncFunction<T> = () => Promise<T>;

export function tryAsync<T>(
  asyncFn: AsyncFunction<T>,
): Promise<FlattenReturn<T>> {
  return asyncFn().then(
    (res) => [undefined, res] as const,
    (err) => [errorNormalize(err), undefined] as const,
  );
}
