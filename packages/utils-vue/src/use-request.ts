import { MemoryCache, type TCache, type TCacheOptions, type TCached } from '@cloudcome/utils-core/cache';
import type { TDateValue } from '@cloudcome/utils-core/date';
import { isFunction, isObject } from '@cloudcome/utils-core/type';
import type { MaybeCallable, MaybePromise } from '@cloudcome/utils-core/types';
import { ref } from 'vue';
import { type TUseAsyncOptions, useAsync } from './use-async';

/**
 * 请求缓存配置选项。
 * @template T 缓存数据的类型。
 */
export type TRequestCacheOptions<T> = TCacheOptions & {
  /**
   * 是否禁用缓存，默认为 false。
   * 如果设置为 true，则不会使用缓存。
   */
  disabled?: boolean;

  /**
   * 自定义缓存存储实现。
   * 可以传入自定义的缓存类来替代默认的内存缓存。
   */
  storage?: TCache<T>;
};

export type TRequestShareOptions = {
  /**
   * 是否禁用共享请求，默认为 false。
   * 如果设置为 true，则不会共享请求结果。
   */
  disabled?: boolean;

  /**
   * 共享的最大时长（毫秒），为 0 时表示永久共享。
   * 超过该时长后，共享的请求结果将被清除。
   */
  maxAge?: number;

  /**
   * 共享的过期时间（时间戳、日期字符串、日期对象等）。
   * 优先级比 maxAge 更高，指定具体的过期时间。
   */
  expiredAt?: TDateValue;
};

/**
 * 请求选项，扩展了异步操作的选项。
 * @template T 请求返回的数据类型。
 * @template P 请求参数的类型。
 */
export type IRequestOptions<T, P = void> = TUseAsyncOptions<T, P> & {
  /**
   * 请求的唯一标识符，可以是字符串或函数返回的字符串。
   * 用于缓存和共享的键值。
   */
  id?: MaybeCallable<string>;

  /**
   * 缓存配置，可以是布尔值或完整的缓存选项。
   * 如果为 true，则启用默认缓存；如果为对象，则可以自定义缓存行为。
   */
  cache?: boolean | TRequestCacheOptions<T>;

  /**
   * 共享配置，可以是布尔值或完整的共享选项。
   * 如果为 true，则启用默认共享；如果为对象，则可以自定义共享行为。
   */
  share?: boolean | TRequestShareOptions;

  /**
   * 当命中缓存时的回调函数。
   * 在缓存命中时触发，接收缓存的数据作为参数。
   */
  onCacheHit?: (cached: TCached<T>) => unknown;
};

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
 * @returns 返回一个对象，包含以下内容：
 * - 异步操作的状态（如 loading、error 等）。
 * - 是否命中缓存（hitCache）。
 * - 是否命中共享请求（hitShare）。
 */
export function useRequest<T, P = void>(fn: (params: P) => Promise<T>, options?: IRequestOptions<T, P>) {
  const { id, cache, share, onCacheHit, onSuccess } = options || {};

  const shareStorage = defaultShareStorage as MemoryCache<Promise<T>>;
  const shareAble = isObject(share) ? !share.disabled : share;
  const shareOptions = isObject(share) ? share : {};
  const hitShare = ref(false);

  const _cached = defaultCacheStorage as TCache<T>;
  const cacheStorage = isObject(cache) ? cache.storage || _cached : _cached;
  const cacheAble = isObject(cache) ? !cache.disabled : cache;
  const cacheOptions = isObject(cache) ? cache : {};
  const hitCache = ref(false);

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
        hitCache.value = true;
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
    hitShare,
    hitCache,
  };
}
