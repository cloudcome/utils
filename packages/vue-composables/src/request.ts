import { type ICacheClass, type ICacheOptions, type ICached, MemoryCache } from '@cloudcome/core-utils/cache';
import { isFunction, isObject } from '@cloudcome/core-utils/type';
import type { MaybeCallable, MaybePromise } from '@cloudcome/core-utils/types';
import { ref } from 'vue';
import type { TDateValue } from '../../core-utils/dist/date/core';
import { type IUseAsyncOptions, useAsync } from './async';

/**
 * 请求缓存配置选项。
 * @template T 缓存数据的类型。
 */
export interface IRequestCacheOptions<T> extends ICacheOptions {
  /**
   * 是否禁用缓存，默认为 false。
   */
  disabled?: boolean;

  /**
   * 自定义缓存存储实现。
   */
  storage?: ICacheClass<T>;
}

export interface IRequestShareOptions {
  /**
   * 是否禁用共享请求，默认为 false。
   */
  disabled?: boolean;

  /**
   * 共享的最大时长（毫秒），为 0 时表示永久共享
   */
  maxAge?: number;

  /**
   * 共享的过期时间（时间戳、日期字符串、日期对象等）
   * 优先级比 maxAge 更高
   */
  expiredAt?: TDateValue;
}

export interface IShared<T> {
  promise: Promise<T>;
}

/**
 * 请求选项，扩展了异步操作的选项。
 * @template T 请求返回的数据类型。
 * @template P 请求参数的类型。
 */
export interface IRequestOptions<T, P = void> extends IUseAsyncOptions<T, P> {
  id?: MaybeCallable<string>;
  /**
   * 缓存配置，可以是缓存标识符或完整的缓存选项。
   */
  cache?: boolean | IRequestCacheOptions<T>;
  share?: boolean | IRequestShareOptions;
  /**
   * 当命中缓存时的回调函数。
   */
  onCacheHit?: (cached: ICached<T>) => unknown;
}

const defaultCacheStorage = new MemoryCache();
const defaultShareStorage = new MemoryCache();

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
export function useRequest<T, P = void>(fn: (params: P) => Promise<T>, options?: IRequestOptions<T, P>) {
  const { id, cache, share, onCacheHit, onSuccess } = options || {};

  const shareStorage = defaultShareStorage as MemoryCache<Promise<T>>;
  const shareAble = isObject(share) ? !share.disabled : share;
  const shareOptions = isObject(share) ? share : {};
  const isShareHit = ref(false);

  const _cached = defaultCacheStorage as ICacheClass<T>;
  const cacheStorage = isObject(cache) ? cache.storage || _cached : _cached;
  const cacheAble = isObject(cache) ? !cache.disabled : cache;
  const cacheOptions = isObject(cache) ? cache : {};
  const isCacheHit = ref(false);

  const cacheableFn = async (params: P) => {
    const requestId = isFunction(id) ? id() : id;

    if (requestId && shareAble) {
      const shared = shareStorage.get(requestId);
      if (shared) {
        return await shared.data;
      }
    }

    if (requestId && cacheAble) {
      const cached = await cacheStorage.get(requestId);

      if (cached) {
        const data = cached.data;
        isCacheHit.value = true;
        onCacheHit?.(cached);
        onSuccess?.(data);
        return data;
      }
    }

    const promise = fn(params);

    if (requestId && cacheAble) {
      shareStorage.set(requestId, promise, shareOptions);
    }

    const data = await promise;

    if (requestId && cacheAble) {
      cacheStorage.set(requestId, data, cacheOptions);
    }

    return data;
  };
  const async = useAsync(cacheableFn, options);

  return {
    ...async,
    isShareHit,
    isCacheHit,
  };
}
