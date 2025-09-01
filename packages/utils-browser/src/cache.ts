import { AbstractCache, type CacheOptions, type Cached } from '@cloudcome/utils-core/cache';
import type { MaybePromise } from '@cloudcome/utils-core/types';

/**
 * 使用浏览器存储（localStorage 或 sessionStorage）实现的缓存类
 * @template T - 缓存数据的类型
 */
export class StorageCache<T> extends AbstractCache<T> {
  /**
   * 创建一个新的 StorageCache 实例
   * @param storage - 使用的存储实现（localStorage 或 sessionStorage）
   * @param namespace - 可选，用于为缓存键添加前缀的命名空间
   */
  constructor(
    readonly storage: Storage,
    readonly namespace = '',
  ) {
    super();
  }

  /**
   * 通过ID获取缓存数据
   * @param id - 要获取的缓存键
   * @returns 如果找到且未过期则返回缓存数据，否则返回null
   */
  get(id: string): Cached<T> | null {
    const { storage, namespace } = this;
    const fullId = namespace ? `${namespace}:${id}` : id;

    try {
      const cachedString = storage.getItem(fullId);
      if (!cachedString) return null;

      const cached = JSON.parse(cachedString);

      if (cached.createdAt + cached.maxAge < Date.now()) {
        this.del(id);
        return null;
      }

      return cached;
    } catch (e) {
      return null;
    }
  }

  /**
   * 将数据存储到缓存中
   * @param id - 存储数据使用的缓存键
   * @param data - 要缓存的数据
   * @param options - 可选的缓存配置
   * @returns 成功返回true，存储失败返回false
   */
  set(id: string, data: T, options?: CacheOptions) {
    const { storage, namespace } = this;
    const fullId = namespace ? `${namespace}:${id}` : id;

    try {
      storage.setItem(
        fullId,
        JSON.stringify({
          id,
          data,
          createdAt: Date.now(),
          maxAge: options?.maxAge || 0,
        }),
      );
    } catch (cause) {
      //
    }
  }

  /**
   * 通过ID删除缓存数据
   * @param id - 要删除的缓存键
   */
  del(id: string) {
    const { storage, namespace } = this;
    const fullId = namespace ? `${namespace}:${id}` : id;

    try {
      storage.removeItem(fullId);
    } catch (cause) {
      //
    }
  }

  clear() {
    try {
      this.storage.clear();
    } catch (err) {
      //
    }
  }
}

/**
 * 创建一个使用 localStorage 的缓存实例
 * @template T - 缓存数据的类型
 * @param namespace - 可选，用于为缓存键添加前缀的命名空间
 * @returns 使用 localStorage 的新 StorageCache 实例
 */
export function createLocalCache<T>(namespace?: string): AbstractCache<T> {
  return new StorageCache<T>(localStorage, namespace);
}

/**
 * 创建一个使用 sessionStorage 的缓存实例
 * @template T - 缓存数据的类型
 * @param namespace - 可选，用于为缓存键添加前缀的命名空间
 * @returns 使用 sessionStorage 的新 StorageCache 实例
 */
export function createSessionCache<T>(namespace?: string): AbstractCache<T> {
  return new StorageCache<T>(sessionStorage, namespace);
}
