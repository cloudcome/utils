import { type ICacheClass, type ICached, MemoryCache } from '@cloudcome/core-utils/cache';
import { isFunction, isObject } from '@cloudcome/core-utils/type';
import type { MaybeCallable } from '@cloudcome/core-utils/types';
import { ref } from 'vue';
import { type IUseAsyncOptions, useAsync } from './async';

export interface IRequestCacheOptions<T> {
  id: MaybeCallable<string>;
  disabled?: boolean;
  maxAge?: number;
  storage?: ICacheClass<T>;
}

export interface IRequestOptions<T, P = void> extends IUseAsyncOptions<T, P> {
  cache?: MaybeCallable<string> | IRequestCacheOptions<T>;
  onCacheHit?: (cached: ICached<T>) => unknown;
}

const defaultMemoryCacheStorage = new MemoryCache();

export function useRequest<T, P = void>(fn: () => Promise<T>, options?: IRequestOptions<T, P>) {
  const cache = options?.cache;
  const _storage = defaultMemoryCacheStorage as ICacheClass<T>;
  const storage = isObject(cache) ? cache.storage || _storage : _storage;
  const isCacheHit = ref(false);
  const cacheableFn = async () => {
    let cacheId = '';

    if (isObject(cache)) {
      cacheId = isFunction(cache.id) ? cache.id() : cache.id;
    } else {
      cacheId = isFunction(cache) ? cache() : cache || '';
    }

    if (cacheId) {
      const cached = await storage.get(cacheId);

      if (cached) {
        const data = cached.data;
        isCacheHit.value = true;
        options?.onCacheHit?.(cached);
        options?.onSuccess?.(data);
        return data;
      }
    }

    const data = await fn();

    if (cacheId) {
      storage.set(cacheId, data, {
        maxAge: 0,
      });
    }

    return data;
  };
  const async = useAsync(cacheableFn, options);

  return {
    ...async,
    isCacheHit,
  };
}
