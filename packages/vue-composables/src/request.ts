import { type ICacheClass, type ICached, MemoryCache } from '@cloudcome/core-utils/cache';
import { isFunction, isObject } from '@cloudcome/core-utils/type';
import type { MaybeCallable } from '@cloudcome/core-utils/types';
import { ref } from 'vue';
import { type IUseAsyncOptions, useAsync } from './async';

/**
 * 请求缓存配置选项。
 * @template T 缓存数据的类型。
 */
export interface IRequestCacheOptions<T> {
  /**
   * 缓存标识符，可以是字符串或返回字符串的函数。
   */
  id: MaybeCallable<string>;
  /**
   * 是否禁用缓存，默认为 false。
   */
  disabled?: boolean;
  /**
   * 缓存的最大存活时间（单位：毫秒）。
   */
  maxAge?: number;
  /**
   * 自定义缓存存储实现。
   */
  storage?: ICacheClass<T>;
}

/**
 * 请求选项，扩展了异步操作的选项。
 * @template T 请求返回的数据类型。
 * @template P 请求参数的类型。
 */
export interface IRequestOptions<T, P = void> extends IUseAsyncOptions<T, P> {
  /**
   * 缓存配置，可以是缓存标识符或完整的缓存选项。
   */
  cache?: MaybeCallable<string> | IRequestCacheOptions<T>;
  /**
   * 当命中缓存时的回调函数。
   */
  onCacheHit?: (cached: ICached<T>) => unknown;
}

const defaultMemoryCacheStorage = new MemoryCache();

/**
 * 使用请求功能的组合式函数。
 * 支持缓存和异步操作的封装。
 *
 * @template T 请求返回的数据类型。
 * @template P 请求参数的类型。
 * @param {() => Promise<T>} fn 实际的请求函数，返回一个 Promise。
 * @param {IRequestOptions<T, P>} [options] 请求选项，包括缓存和回调配置。
 * @returns 包含请求状态、缓存命中状态的对象。
 */
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
