import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StorageCache, createLocalCache, createSessionCache } from '../src/cache';

describe('StorageCache', () => {
  let storage: Storage;
  let cache: StorageCache<string>;

  beforeEach(() => {
    storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    } as unknown as Storage;
    cache = new StorageCache(storage);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('应该正确初始化实例', () => {
      expect(cache).toBeInstanceOf(StorageCache);
      expect(cache.storage).toBe(storage);
      expect(cache.namespace).toBe('');
    });

    it('应该支持命名空间', () => {
      const cacheWithNamespace = new StorageCache(storage, 'test');
      expect(cacheWithNamespace.namespace).toBe('test');
    });
  });

  describe('get()', () => {
    it('应该返回null当缓存不存在时', () => {
      (storage.getItem as Mock).mockReturnValue(null);
      expect(cache.get('key')).toBeNull();
      expect(storage.getItem).toBeCalledWith('key');
    });

    it('应该返回null当缓存过期时', () => {
      const expiredCache = JSON.stringify({
        id: 'key',
        data: 'value',
        createdAt: Date.now() - 10000,
        maxAge: 5000,
      });
      (storage.getItem as Mock).mockReturnValue(expiredCache);
      expect(cache.get('key')).toBeNull();
      expect(storage.removeItem).toBeCalledWith('key');
    });

    it('应该返回缓存数据当缓存有效时', () => {
      const validCache = JSON.stringify({
        id: 'key',
        data: 'value',
        createdAt: Date.now(),
        maxAge: 5000,
      });
      (storage.getItem as Mock).mockReturnValue(validCache);
      const result = cache.get('key');
      expect(result?.data).toBe('value');
    });

    it('应该返回null当缓存数据解析失败时', () => {
      (storage.getItem as Mock).mockReturnValue('invalid json');
      expect(cache.get('key')).toBeNull();
    });
  });

  describe('set()', () => {
    it('应该成功设置缓存', () => {
      cache.set('key', 'value');
      expect(storage.setItem).toBeCalled();
    });

    it('应该支持设置缓存过期时间', () => {
      cache.set('key', 'value', { maxAge: 1000 });
      const [, value] = (storage.setItem as Mock).mock.calls[0];
      const cacheData = JSON.parse(value);
      expect(cacheData.maxAge).toBe(1000);
    });
  });

  describe('del()', () => {
    it('应该成功删除缓存', () => {
      cache.del('key');
      expect(storage.removeItem).toBeCalledWith('key');
    });

    it('应该处理删除缓存失败的情况', () => {
      (storage.removeItem as Mock).mockImplementation(() => {
        throw new Error('Remove failed');
      });
      expect(() => cache.del('key')).not.toThrow();
    });
  });

  describe('命名空间', () => {
    it('应该在键前添加命名空间', () => {
      const cacheWithNamespace = new StorageCache(storage, 'test');
      cacheWithNamespace.set('key', 'value');
      expect(storage.setItem).toBeCalledWith('test:key', expect.anything());
    });

    it('应该在获取缓存时使用命名空间', () => {
      const cacheWithNamespace = new StorageCache(storage, 'test');
      cacheWithNamespace.get('key');
      expect(storage.getItem).toBeCalledWith('test:key');
    });

    it('应该在删除缓存时使用命名空间', () => {
      const cacheWithNamespace = new StorageCache(storage, 'test');
      cacheWithNamespace.del('key');
      expect(storage.removeItem).toBeCalledWith('test:key');
    });
  });

  describe('clear()', () => {
    it('应该清空所有缓存', () => {
      cache.clear();
      expect(storage.clear).toBeCalled();
    });

    it('应该处理清空缓存失败的情况', () => {
      (storage.clear as Mock).mockImplementation(() => {
        throw new Error('Clear failed');
      });
      expect(() => cache.clear()).not.toThrow();
    });
  });

  describe('缓存数据格式', () => {
    it('应该正确序列化缓存数据', () => {
      cache.set('key', 'value');
      const [, value] = (storage.setItem as Mock).mock.calls[0];
      const cacheData = JSON.parse(value);
      expect(cacheData).toEqual({
        id: 'key',
        data: 'value',
        createdAt: expect.any(Number),
        maxAge: 0,
      });
    });

    it('应该正确处理非字符串数据', () => {
      const objCache = new StorageCache<object>(storage);
      objCache.set('key', { foo: 'bar' });
      const [, value] = (storage.setItem as Mock).mock.calls[0];
      const cacheData = JSON.parse(value);
      expect(cacheData.data).toEqual({ foo: 'bar' });
    });
  });

  describe('存储失败', () => {
    it('应该处理getItem失败的情况', () => {
      (storage.getItem as Mock).mockImplementation(() => {
        throw new Error('Get failed');
      });
      expect(() => cache.get('key')).not.toThrow();
    });

    it('应该处理setItem失败的情况', () => {
      (storage.setItem as Mock).mockImplementation(() => {
        throw new Error('Set failed');
      });
      expect(() => cache.set('key', 'value')).not.toThrow();
    });
  });
});

describe('createLocalCache', () => {
  it('应该创建使用localStorage的缓存实例', () => {
    const cache = createLocalCache<string>() as StorageCache<string>;
    expect(cache).toBeInstanceOf(StorageCache);
    expect(cache.storage).toBe(localStorage);
  });

  it('应该支持命名空间', () => {
    const cache = createLocalCache<string>('test') as StorageCache<string>;
    expect(cache.namespace).toBe('test');
  });
});

describe('createSessionCache', () => {
  it('应该创建使用sessionStorage的缓存实例', () => {
    const cache = createSessionCache<string>() as StorageCache<string>;
    expect(cache).toBeInstanceOf(StorageCache);
    expect(cache.storage).toBe(sessionStorage);
  });

  it('应该支持命名空间', () => {
    const cache = createSessionCache<string>('test') as StorageCache<string>;
    expect(cache.namespace).toBe('test');
  });
});
