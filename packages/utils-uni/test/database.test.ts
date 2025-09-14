import { errorAssign } from '@cloudcome/utils-core/error';
import { describe, expect, it, vi } from 'vitest';

// 在导入模块前先模拟 uniCloud
const mockCollection = {
  where: vi.fn().mockReturnThis(),
  field: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  skip: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  add: vi.fn(),
  count: vi.fn(),
  get: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  aggregate: vi.fn(),
};

const mockDatabase = {
  collection: vi.fn().mockReturnValue(mockCollection),
  command: {
    aggregate: {},
  },
};

const mockUniCloud = {
  database: vi.fn().mockReturnValue(mockDatabase),
};

describe('数据库模块', () => {
  beforeAll(() => {
    // @ts-ignore
    global.uniCloud = mockUniCloud;
  });

  afterAll(() => {
    // @ts-ignore
    // biome-ignore lint/performance/noDelete: <explanation>
    delete global.uniCloud;
  });

  describe('dbCmd 和 dbAgg', () => {
    it('应该正确导出数据库命令对象', async () => {
      // 动态导入确保 uniCloud 已经被模拟
      const { dbCmd, dbAgg } = await import('../src/database');
      expect(dbCmd).toBeDefined();
      expect(dbAgg).toBeDefined();
    });
  });

  describe('parseDatabaseOutput', () => {
    it('应该正确处理客户端响应结果', async () => {
      const { parseDatabaseOutput } = await import('../src/database');

      const mockResponse = {
        result: {
          data: [{ id: '1', name: 'test' }],
          errCode: 0,
          errMsg: 'success',
        },
      };

      const result = await parseDatabaseOutput(mockResponse);

      expect(result).toEqual({
        data: [{ id: '1', name: 'test' }],
      });
    });

    it('应该正确处理云端响应结果', async () => {
      const { parseDatabaseOutput } = await import('../src/database');

      const mockResponse = {
        data: [{ id: '1', name: 'test' }],
      };

      const result = await parseDatabaseOutput(mockResponse);

      expect(result).toEqual({
        data: [{ id: '1', name: 'test' }],
      });
    });

    it('应该正确处理错误响应', async () => {
      const { parseDatabaseOutput } = await import('../src/database');

      const mockResponse = {
        result: {
          errCode: 404,
          errMsg: 'Not Found',
        },
      };

      expect(() => parseDatabaseOutput(mockResponse)).toThrowError(
        errorAssign(new Error('Not Found'), mockResponse.result),
      );
    });
  });

  describe('Db 类', () => {
    it('应该正确构造 Db 实例', async () => {
      const { Db } = await import('../src/database');
      const dbInstance = new Db('test-collection');

      expect(dbInstance).toBeInstanceOf(Db);
    });

    it('应该支持使用模拟数据库构造实例', async () => {
      const { Db } = await import('../src/database');
      const dbInstance = new Db('test-collection', mockCollection);

      expect(dbInstance).toBeInstanceOf(Db);
    });

    it('应该正确启动数据库操作', async () => {
      const { Db } = await import('../src/database');
      const dbInstance = new Db('test-collection', mockCollection);

      expect(dbInstance).toHaveProperty('where');
      expect(dbInstance).toHaveProperty('select');
      expect(dbInstance).toHaveProperty('order');
      expect(dbInstance).toHaveProperty('skip');
      expect(dbInstance).toHaveProperty('limit');
      expect(dbInstance).toHaveProperty('create');
      expect(dbInstance).toHaveProperty('count');
      expect(dbInstance).toHaveProperty('query');
      expect(dbInstance).toHaveProperty('aggregate');
    });

    it('应该正确执行 where 条件查询', async () => {
      const { Db } = await import('../src/database');
      const dbInstance = new Db('test-collection', mockCollection);
      const result = dbInstance.where({ name: 'test' });

      expect(result).toHaveProperty('where');
      expect(result).toHaveProperty('select');
      expect(result).toHaveProperty('order');
      expect(result).toHaveProperty('skip');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('count');
      expect(result).toHaveProperty('query');
      expect(result).toHaveProperty('update');
      expect(result).toHaveProperty('remove');
      expect(mockCollection.where).toHaveBeenCalledWith({ name: 'test' });
    });

    it('应该正确执行 select 字段筛选', async () => {
      const { Db } = await import('../src/database');
      const dbInstance = new Db('test-collection', mockCollection);
      const result = dbInstance.select({ name: true, age: true });

      expect(result).toHaveProperty('where');
      expect(result).toHaveProperty('order');
      expect(result).toHaveProperty('skip');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('query');
      expect(mockCollection.field).toHaveBeenCalledWith({ name: true, age: true });
    });

    it('应该正确执行 order 排序', async () => {
      const { Db } = await import('../src/database');
      const dbInstance = new Db('test-collection', mockCollection);
      const result = dbInstance.order({ name: 'asc', age: 'desc' });

      expect(result).toHaveProperty('where');
      expect(result).toHaveProperty('order');
      expect(result).toHaveProperty('skip');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('query');
      expect(mockCollection.orderBy).toHaveBeenCalledWith('name', 'asc');
      expect(mockCollection.orderBy).toHaveBeenCalledWith('age', 'desc');
    });

    it('应该正确执行 skip 跳过记录', async () => {
      const { Db } = await import('../src/database');
      const dbInstance = new Db('test-collection', mockCollection);
      const result = dbInstance.skip(10);

      expect(result).toHaveProperty('where');
      expect(result).toHaveProperty('order');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('query');
      expect(mockCollection.skip).toHaveBeenCalledWith(10);
    });

    it('应该正确执行 limit 限制记录数', async () => {
      const { Db } = await import('../src/database');
      const dbInstance = new Db('test-collection', mockCollection);
      const result = dbInstance.limit(5);

      expect(result).toHaveProperty('where');
      expect(result).toHaveProperty('order');
      expect(result).toHaveProperty('skip');
      expect(result).toHaveProperty('query');
      expect(mockCollection.limit).toHaveBeenCalledWith(5);
    });

    it('应该正确执行 create 创建记录', async () => {
      const { Db } = await import('../src/database');
      const mockResponse = {
        result: {
          id: '123',
          inserted: 1,
          errCode: 0,
          errMsg: '',
        },
      };
      mockCollection.add.mockResolvedValue(mockResponse);

      const dbInstance = new Db('test-collection', mockCollection);
      const result = await dbInstance.create({ name: 'test', age: 25 });

      expect(result).toEqual({
        id: '123',
        inserted: 1,
      });
      expect(mockCollection.add).toHaveBeenCalledWith({ name: 'test', age: 25 });
    });

    it('应该正确执行 count 统计记录数', async () => {
      const { Db } = await import('../src/database');
      const mockResponse = {
        result: {
          total: 10,
          errCode: 0,
          errMsg: '',
        },
      };
      mockCollection.count.mockResolvedValue(mockResponse);

      const dbInstance = new Db('test-collection', mockCollection);
      const result = await dbInstance.count();

      expect(result).toEqual({
        total: 10,
      });
      expect(mockCollection.count).toHaveBeenCalled();
    });

    it('应该正确执行 query 查询记录', async () => {
      const { Db } = await import('../src/database');
      const mockResponse = {
        result: {
          data: [{ id: '1', name: 'test' }],
          errCode: 0,
          errMsg: '',
        },
      };
      mockCollection.get.mockResolvedValue(mockResponse);

      const dbInstance = new Db('test-collection', mockCollection);
      const result = await dbInstance.query();

      expect(result).toEqual({
        data: [{ id: '1', name: 'test' }],
      });
      expect(mockCollection.get).toHaveBeenCalled();
    });

    it('应该正确执行 update 更新记录', async () => {
      const { Db } = await import('../src/database');
      const mockResponse = {
        result: {
          updated: 1,
          errCode: 0,
          errMsg: '',
        },
      };
      mockCollection.update.mockResolvedValue(mockResponse);

      const dbInstance = new Db('test-collection', mockCollection);
      const chain = dbInstance.where({ id: '1' });
      const result = await chain.update({ name: 'updated' });

      expect(result).toEqual({
        updated: 1,
      });
      expect(mockCollection.update).toHaveBeenCalledWith({ name: 'updated' });
    });

    it('应该正确执行 remove 删除记录', async () => {
      const { Db } = await import('../src/database');
      const mockResponse = {
        result: {
          deleted: 1,
          errCode: 0,
          errMsg: '',
        },
      };
      mockCollection.remove.mockResolvedValue(mockResponse);

      const dbInstance = new Db('test-collection', mockCollection);
      const chain = dbInstance.where({ id: '1' });
      const result = await chain.remove();

      expect(result).toEqual({
        deleted: 1,
      });
      expect(mockCollection.remove).toHaveBeenCalled();
    });
  });

  describe('db 对象', () => {
    it('应该正确导出 db 对象', async () => {
      const { db } = await import('../src/database');
      expect(db).toBeDefined();
      expect(db).toHaveProperty('collection');
    });

    it('应该能够通过 collection 方法获取 Db 实例', async () => {
      const { db } = await import('../src/database');
      const collection = db.collection('test-collection');

      expect(collection).toHaveProperty('where');
      expect(collection).toHaveProperty('select');
      expect(collection).toHaveProperty('order');
      expect(collection).toHaveProperty('skip');
      expect(collection).toHaveProperty('limit');
      expect(collection).toHaveProperty('create');
      expect(collection).toHaveProperty('count');
      expect(collection).toHaveProperty('query');
    });
  });
});
