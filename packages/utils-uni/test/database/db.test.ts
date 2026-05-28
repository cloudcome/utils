import { assertType, describe, expect, it } from 'vitest';
import { createMockData } from './_helpers';
import type { DbError } from '@/database';

const { mockCollection, mockUniCloud, mockDatabase, mockTransaction, mockCollectionAggregate } = createMockData();

describe('db class', () => {
  beforeAll(() => {
    // @ts-expect-error
    global.uniCloud = mockUniCloud;
  });

  afterAll(() => {
    // @ts-expect-error
    delete global.uniCloud;
  });

  beforeEach(() => {
    mockDatabase.collection.mockClear();
  });

  it('应该正确构造 Db 实例', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({ table: 'test-collection' });

    expect(dbInstance).toBeInstanceOf(Db);
  });

  it('应该支持使用模拟数据库构造实例', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });

    expect(dbInstance).toBeInstanceOf(Db);
  });

  it('应该支持使用事务构造实例', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      transaction: mockTransaction,
    });

    expect(dbInstance).toBeInstanceOf(Db);
  });

  it('应该正确启动数据库操作', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });

    expect(dbInstance).toHaveProperty('where');
    expect(dbInstance).toHaveProperty('select');
    expect(dbInstance).toHaveProperty('order');
    expect(dbInstance).toHaveProperty('skip');
    expect(dbInstance).toHaveProperty('limit');
    expect(dbInstance).toHaveProperty('create');
    expect(dbInstance).toHaveProperty('count');
    expect(dbInstance).toHaveProperty('many');
    expect(dbInstance).toHaveProperty('firstOrThrow');
    expect(dbInstance).toHaveProperty('firstOrNull');
    expect(dbInstance).toHaveProperty('update');
    expect(dbInstance).toHaveProperty('remove');
    expect(dbInstance).toHaveProperty('clone');
    expect(dbInstance).toHaveProperty('sample');
  });

  it('应该在数据库错误时抛出 DbError', async () => {
    const { Db } = await import('@/database/_db.class');
    const { isDbError } = await import('@/database/error');

    const mockError = Object.assign(new Error('数据库错误'), {
      errCode: 'InternalServerError',
      errMsg: 'E11000 duplicate key error collection: test index: _id dup key',
    });

    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });

    mockCollection.get.mockRejectedValue(mockError);

    let caughtError: unknown;
    try {
      await dbInstance.many();
    } catch (err) {
      caughtError = err;
    }

    expect(caughtError).not.toBeUndefined();
    expect(isDbError(caughtError)).toBe(true);
    expect((caughtError as DbError).errCode).toBe('InternalServerError');
    expect((caughtError as DbError).dbCode).toBe('E11000');
    expect((caughtError as DbError).message).toContain('E11000 duplicate key');
  });

  it('应该在没有 errMsg 时直接抛出原始错误', async () => {
    const { Db } = await import('@/database/_db.class');
    const { isDbError } = await import('@/database/error');

    const mockError = new Error('非数据库原始错误');

    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });

    mockCollection.get.mockRejectedValue(mockError);

    let caughtError: unknown;
    try {
      await dbInstance.many();
    } catch (err) {
      caughtError = err;
    }

    expect(isDbError(caughtError)).toBe(false);
    expect(caughtError).toBe(mockError);
    expect((caughtError as Error).message).toBe('非数据库原始错误');
  });

  it('应该抛出其他原始错误', async () => {
    const { Db } = await import('@/database/_db.class');
    const { isDbError } = await import('@/database/error');

    const mockError = Symbol('其他原始错误');

    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });

    mockCollection.get.mockRejectedValue(mockError);

    let caughtError: unknown;
    try {
      await dbInstance.many();
    } catch (err) {
      caughtError = err;
    }

    expect(isDbError(caughtError)).toBe(false);
    expect(caughtError).toBe(mockError);
  });

  it('应该正确执行 where 条件查询', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    mockCollection.get.mockReturnValue({});
    dbInstance.where({ name: 'test' }).many();
    expect(mockCollection.where).toHaveBeenCalledWith({ name: 'test' });
  });

  it('应该限制 where 条件只能执行一次', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    dbInstance.where({ name: 'test' });

    expect(() => dbInstance.where({ name: 'test2' })).toThrow('已调用过一次 db.where({...}) 或 db.whereId(id) 了');
  });

  it('应该正确执行 whereId 查询', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    mockCollection.get.mockReturnValue({});
    dbInstance.whereId('test-id').many();
    expect(mockCollection.limit).toHaveBeenCalledWith(1);
  });

  it('应该限制 whereId 条件只能执行一次', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    dbInstance.whereId('test-id');
    expect(() => dbInstance.whereId('test-id2')).toThrow('已调用过一次 db.where({...}) 或 db.whereId(id) 了');
  });

  it('应该限制 where 和 whereId 不能同时调用', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    dbInstance.where({ name: 'test' });
    expect(() => dbInstance.whereId('test-id')).toThrow('已调用过一次 db.where({...}) 或 db.whereId(id) 了');
  });

  it('应该限制 whereId 后不能再调用 where', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    dbInstance.whereId('test-id');
    expect(() => dbInstance.where({ name: 'test' })).toThrow('已调用过一次 db.where({...}) 或 db.whereId(id) 了');
  });

  it('事务模式下 where 应抛出错误', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      transaction: mockTransaction,
    });
    expect(() => dbInstance.where({ name: 'test' })).toThrow('事务模式下请使用 whereId() 方法');
  });

  it('事务模式下 order 应抛出错误', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      transaction: mockTransaction,
    });
    expect(() => dbInstance.order({ name: 'asc' })).toThrow('db.order() 方法不支持事务模式');
  });

  it('事务模式下 limit 应抛出错误', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      transaction: mockTransaction,
    });
    expect(() => dbInstance.limit(10)).toThrow('db.limit() 方法不支持事务模式');
  });

  it('事务模式下 skip 应抛出错误', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      transaction: mockTransaction,
    });
    expect(() => dbInstance.skip(10)).toThrow('db.skip() 方法不支持事务模式');
  });

  it('事务模式下 sample 应抛出错误', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      transaction: mockTransaction,
    });
    expect(() => dbInstance.sample(5)).toThrow('db.sample() 方法不支持事务模式');
  });

  it('事务模式下 whereId 查询应走 doc(id) 路径', async () => {
    const { Db } = await import('@/database/_db.class');
    // doc(id).get() 返回单个对象，而非数组
    const mockResponse = {
      result: {
        data: { _id: 'test-id', name: 'test' },
        errCode: 0,
        errMsg: '',
      },
    };
    mockCollection.get.mockResolvedValue(mockResponse);
    const dbInstance = new Db({
      table: 'test-collection',
      transaction: mockTransaction,
    });
    const result = await dbInstance.whereId('test-id').firstOrThrow();

    expect(mockCollection.doc).toHaveBeenCalledWith('test-id');
    expect(result).toEqual({ _id: 'test-id', name: 'test' });
  });

  it('where({ _id }) 不再走 whereId 路径', async () => {
    const { Db } = await import('@/database/_db.class');
    const mockResponse = {
      result: {
        data: [{ _id: 'test-id', name: 'test' }],
        errCode: 0,
        errMsg: '',
      },
    };
    mockCollection.get.mockResolvedValue(mockResponse);
    mockCollection.doc.mockClear();
    mockCollection.where.mockClear();
    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    await dbInstance.where({ _id: 'test-id' }).firstOrThrow();

    // where({ _id }) 应走 where().get() 路径，而非 doc(id).get()
    expect(mockCollection.doc).not.toHaveBeenCalled();
    expect(mockCollection.where).toHaveBeenCalledWith({ _id: 'test-id' });
  });

  it('where 时应正确调用原生命令', async () => {
    const { Db } = await import('@/database/_db.class');
    const { dbQuery } = await import('@/database/command');
    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const v = Math.random();

    mockCollection.get.mockReturnValue({});
    mockDatabase.command.eq.mockReturnValue(v);
    await dbInstance.where({ name: dbQuery.eq(1) }).many();

    expect(mockDatabase.command.eq).toReturnWith(v);
    expect(mockCollection.where).toHaveBeenCalledWith({ name: v });
  });

  it('应该正确执行 select 字段筛选', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db<{ name: string; age: number }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    mockCollection.get.mockReturnValue({});
    dbInstance.select({ name: true, age: true }).many();
    expect(mockCollection.field).toHaveBeenCalledWith({
      name: true,
      age: true,
    });
  });

  it('应该限制 select 条件只能执行一次', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db<{ name: string; age: number }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    dbInstance.select({ name: true });
    expect(() => dbInstance.select({ age: true })).toThrow('db.select() 方法只能调用一次');
  });

  it('应该正确执行 order 排序', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    mockCollection.get.mockReturnValue({});
    dbInstance.order({ name: 'asc', age: 'desc' }).many();
    expect(mockCollection.orderBy).toHaveBeenCalledWith('name', 'asc');
    expect(mockCollection.orderBy).toHaveBeenCalledWith('age', 'desc');
  });

  it('应该正确执行 skip 跳过记录', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    mockCollection.get.mockReturnValue({});
    dbInstance.skip(10).many();
    expect(mockCollection.skip).toHaveBeenCalledWith(10);
  });

  it('应该限制 skip 条件只能执行一次', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    dbInstance.skip(10);
    expect(() => dbInstance.skip(20)).toThrow('db.skip() 方法只能调用一次');
  });

  it('应该正确执行 limit 限制记录数', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    mockCollection.get.mockReturnValue({});
    dbInstance.limit(5).many();
    expect(mockCollection.limit).toHaveBeenCalledWith(5);
  });

  it('应该限制 limit 条件只能执行一次', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    dbInstance.limit(5);
    expect(() => dbInstance.limit(10)).toThrow('db.limit() 方法只能调用一次');
  });

  it('应该正确执行 create 创建记录', async () => {
    const { Db } = await import('@/database/_db.class');
    const mockResponse = {
      result: {
        id: '123',
        inserted: 1,
        errCode: 0,
        errMsg: '',
      },
    };
    mockCollection.add.mockResolvedValue(mockResponse);

    const dbInstance = new Db<{ _id: string; name: string; age: number }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const result = await dbInstance.create({ name: 'test', age: 25 });

    expect(result).toEqual('123');
    expect(mockCollection.add).toHaveBeenCalledWith({ name: 'test', age: 25 });
  });

  it('应该在有 where 条件时拒绝执行 create 操作', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db<{ name: string }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    dbInstance.where({ name: 'test' });

    await expect(dbInstance.create({ name: 'test' })).rejects.toThrow('db.create() 方法不支持 where 条件');
  });

  it('应该正确执行 count 统计记录数', async () => {
    const { Db } = await import('@/database/_db.class');
    const mockResponse = {
      result: {
        total: 10,
        errCode: 0,
        errMsg: '',
      },
    };
    mockCollection.count.mockResolvedValue(mockResponse);

    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const result = await dbInstance.count();

    expect(result).toEqual(10);
    expect(mockCollection.count).toHaveBeenCalled();
  });

  it('应该正确执行 query 查询记录', async () => {
    const { Db } = await import('@/database/_db.class');
    const mockResponse = {
      result: {
        data: [{ id: '1', name: 'test' }],
        errCode: 0,
        errMsg: '',
      },
    };
    mockCollection.get.mockResolvedValue(mockResponse);

    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const result = await dbInstance.many();

    expect(result).toEqual([{ id: '1', name: 'test' }]);
    expect(mockCollection.get).toHaveBeenCalled();
  });

  it('应该正确执行 firstOrThrow 查询单条记录', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db<{ _id: string; name: string; age: number }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    // 无需关心数据内容
    mockCollection.get.mockResolvedValue({ data: [{}] });
    const result = await dbInstance.firstOrThrow();

    // 只对数据类型进行验证
    assertType<{ _id: string; name: string; age: number }>(result);
  });

  it('应该在 firstOrThrow 查询不到记录时抛出错误', async () => {
    const { Db } = await import('@/database/_db.class');
    const mockResponse = {
      result: {
        data: [],
        errCode: 0,
        errMsg: '',
      },
    };
    mockCollection.get.mockResolvedValue(mockResponse);

    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });

    let caughtError: (Error & { errCode: string; errMsg: string }) | null = null;
    try {
      await dbInstance.firstOrThrow();
    } catch (err) {
      caughtError = err as Error & { errCode: string; errMsg: string };
    }

    expect(caughtError).not.toBeNull();
    expect(caughtError?.errCode).toBe('firstOrThrow');
    expect(caughtError?.errMsg).toBe('查询数据为空');
  });

  it('应该在 firstOrNull 查询不到记录时返回 null', async () => {
    const { Db } = await import('@/database/_db.class');
    const mockResponse = {
      result: {
        data: [],
        errCode: 0,
        errMsg: '',
      },
    };
    mockCollection.get.mockResolvedValue(mockResponse);

    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const result = await dbInstance.firstOrNull();

    expect(result).toBeNull();
  });

  it('应该在 firstOrThrow 查询到记录时返回正确的类型（没有 select 条件）', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db<{ _id: string; name: string; age: number; email: string }, Record<never, never>>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    // 无需关心数据内容
    mockCollection.get.mockResolvedValue({ data: [{}] });
    const result = await dbInstance.firstOrThrow();

    // 只对数据类型进行验证
    assertType<{ _id: string; name: string; age: number; email: string }>(result);
  });

  it('应该在 firstOrThrow 查询到记录时返回正确的类型（select 为空对象）', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db<{ _id: string; name: string; age: number; email: string }, Record<never, never>>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    // 无需关心数据内容
    mockCollection.get.mockResolvedValue({ data: [{}] });
    // 测试 select 为空对象的情况
    const result = await dbInstance.select({}).firstOrThrow();

    // 只对数据类型进行验证
    assertType<{ _id: string; name: string; age: number; email: string }>(result);
  });

  it('应该在 firstOrThrow 查询到记录时返回正确的类型（select 只有 _id）', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db<{ _id: string; name: string; age: number }, { _id: false }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    // 无需关心数据内容
    mockCollection.get.mockResolvedValue({ data: [{}] });
    const result = await dbInstance.select({ _id: false }).firstOrThrow();

    // 只对数据类型进行验证
    assertType<{ name: string; age: number }>(result);
  });

  it('应该在 firstOrThrow 查询到记录时返回正确的类型（select 没有 _id）', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db<{ _id: string; name: string; age: number; email: string }, { name: true; age: true }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    // 无需关心数据内容
    mockCollection.get.mockResolvedValue({ data: [{}] });
    const result = await dbInstance.select({ name: true, age: true }).firstOrThrow();

    // 只对数据类型进行验证
    assertType<{ name: string; age: number }>(result);
  });

  it('应该在 firstOrThrow 查询到记录时返回正确的类型（select 只有其他字段）', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db<{ _id: string; name: string; age: number; email: string }, { name: true; age: true }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    // 无需关心数据内容
    mockCollection.get.mockResolvedValue({ data: [{}] });
    const result = await dbInstance.select({ name: true, age: true }).firstOrThrow();

    // 只对数据类型进行验证
    assertType<{ name: string; age: number }>(result);
  });

  it('应该在 firstOrThrow 查询到记录时返回正确的类型（select 包含 _id 和其他字段）', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db<{ _id: string; name: string; age: number; email: string }, { name: true; age: true }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    // 无需关心数据内容
    mockCollection.get.mockResolvedValue({ data: [{}] });
    const result = await dbInstance.select({ _id: false, name: true, age: true }).firstOrThrow();

    // 只对数据类型进行验证
    assertType<{ name: string; age: number }>(result);
  });

  it('应该正确执行 update 更新记录', async () => {
    const { Db } = await import('@/database/_db.class');
    const mockResponse = {
      result: {
        updated: 1,
        errCode: 0,
        errMsg: '',
      },
    };
    mockCollection.update.mockResolvedValue(mockResponse);

    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const chain = dbInstance.where({ id: '1' });
    const result = await chain.update({ name: 'updated' });

    expect(result).toEqual(1);
    expect(mockCollection.update).toHaveBeenCalledWith({ name: 'updated' });
  });

  it('update 时应正确调用原生命令', async () => {
    const { Db } = await import('@/database/_db.class');
    const { dbQuery, dbMutate } = await import('@/database/command');
    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const v1 = Math.random();
    const v2 = Math.random();

    mockCollection.update.mockReturnValue({});
    mockDatabase.command.eq.mockReturnValue(v1);
    mockDatabase.command.inc.mockReturnValue(v2);
    await dbInstance.where({ name: dbQuery.eq(1) }).update({
      name: dbMutate.inc(1),
    });

    expect(mockDatabase.command.eq).toReturnWith(v1);
    expect(mockDatabase.command.inc).toReturnWith(v2);
    expect(mockCollection.where).toHaveBeenCalledWith({ name: v1 });
    expect(mockCollection.update).toHaveBeenCalledWith({ name: v2 });
  });

  it('应该在没有 where 条件时拒绝执行 update 操作', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });

    await expect(dbInstance.update({ name: 'test' })).rejects.toThrow('设置 where 条件后才能执行 db.update() 方法');
  });

  it('应该正确执行 remove 删除记录', async () => {
    const { Db } = await import('@/database/_db.class');
    const mockResponse = {
      result: {
        deleted: 1,
        errCode: 0,
        errMsg: '',
      },
    };
    mockCollection.remove.mockResolvedValue(mockResponse);

    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const chain = dbInstance.where({ id: '1' });
    const result = await chain.remove();

    expect(result).toEqual(1);
    expect(mockCollection.remove).toHaveBeenCalled();
  });

  it('应该在没有 where 条件时拒绝执行 remove 操作', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });

    await expect(dbInstance.remove()).rejects.toThrow('设置 where 条件后才能执行 db.remove() 方法');
  });

  it('应该支持 aggregate 操作', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      transaction: mockTransaction,
    });
    const result = dbInstance._createAggregate();

    expect(result).toEqual(mockCollectionAggregate);
    expect(mockCollection.aggregate).toHaveBeenCalled();
  });

  it('应该在事务模式下拒绝 update 操作使用非 whereId 条件', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      transaction: mockTransaction,
    });
    // 事务模式下 where() 直接抛错，无法走到 update
    expect(() => dbInstance.where({ name: 'test' })).toThrow('事务模式下请使用 whereId() 方法');
  });

  it('应该在事务模式下拒绝 remove 操作使用非 whereId 条件', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      transaction: mockTransaction,
    });
    // 事务模式下 where() 直接抛错，无法走到 remove
    expect(() => dbInstance.where({ name: 'test' })).toThrow('事务模式下请使用 whereId() 方法');
  });

  it('应该在事务模式下允许 update 操作使用 _id 作为 where 条件', async () => {
    const { Db } = await import('@/database/_db.class');
    const mockResponse = {
      result: {
        updated: 1,
        errCode: 0,
        errMsg: '',
      },
    };
    mockCollection.update.mockResolvedValue(mockResponse);
    const dbInstance = new Db({
      table: 'test-collection',
      transaction: mockTransaction,
    });
    dbInstance.whereId('test-id'); // _id 条件
    const result = await dbInstance.update({ name: 'updated' });

    expect(result).toEqual(1);
    expect(mockCollection.limit).toHaveBeenCalledWith(1);
    expect(mockCollection.update).toHaveBeenCalledWith({ name: 'updated' });
  });

  it('应该在事务模式下允许 remove 操作使用 _id 作为 where 条件', async () => {
    const { Db } = await import('@/database/_db.class');
    const mockResponse = {
      result: {
        deleted: 1,
        errCode: 0,
        errMsg: '',
      },
    };
    mockCollection.remove.mockResolvedValue(mockResponse);
    const dbInstance = new Db({
      table: 'test-collection',
      transaction: mockTransaction,
    });
    dbInstance.whereId('test-id'); // _id 条件
    const result = await dbInstance.remove();

    expect(result).toEqual(1);
    expect(mockCollection.limit).toHaveBeenCalledWith(1);
    expect(mockCollection.remove).toHaveBeenCalled();
  });

  it('相同实例关联', async () => {
    const { Db } = await import('@/database/_db.class');
    const userTable = new Db<{ _id: string; followers: string[] }>({
      table: 'user',
      _mockDatabase: mockCollection,
    });
    // 无需关心数据内容
    mockCollectionAggregate.end.mockResolvedValue({ data: [{}] });

    await expect(
      userTable
        .lookup(userTable, {
          relation: 'n:1',
          localField: 'followers',
          foreignField: '_id',
          as: 'followers',
        })
        .firstOrThrow(),
    ).rejects.toThrowError('相同的数据表实例(user)不能重复使用');
  });

  it('2 表关联表查询', async () => {
    const { Db } = await import('@/database/_db.class');
    const userTable = new Db<{
      _id: string;
      name: string;
      age: number;
      email: string;
    }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const postTable = new Db<{ _id: string; userId: string; content: string }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    // 无需关心数据内容
    mockCollectionAggregate.end.mockResolvedValue({ data: [{}] });
    const result = await userTable
      .select({ _id: false, name: true, age: true })
      .lookup(postTable, {
        relation: '1:n',
        localField: '_id',
        foreignField: 'userId',
        as: 'posts',
      })
      .firstOrThrow();

    // 只对数据类型进行验证
    assertType<{
      name: string;
      age: number;
      posts: {
        _id: string;
        content: string;
        userId: string;
      }[];
    }>(result);
  });

  it('3 表关联表查询', async () => {
    const { Db } = await import('@/database/_db.class');
    const userTable = new Db<{
      _id: string;
      name: string;
      age: number;
      email: string;
    }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const postTable = new Db<{
      _id: string;
      userId: string;
      content: string;
      tags: string[];
    }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const tagTable = new Db<{ _id: string; tagName: string }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    // 无需关心数据内容
    mockCollectionAggregate.end.mockResolvedValue({ data: [{}] });
    const result = await userTable
      .select({ _id: false, name: true, age: true })
      .lookup(
        postTable.lookup(tagTable, {
          relation: 'n:1',
          localField: 'tags',
          foreignField: '_id',
          as: 'tags',
        }),
        {
          relation: '1:n',
          localField: '_id',
          foreignField: 'userId',
          as: 'posts',
        },
      )
      .firstOrThrow();

    // 只对数据类型进行验证
    assertType<{
      name: string;
      age: number;
      posts: {
        _id: string;
        content: string;
        userId: string;
        tags: {
          _id: string;
          tagName: string;
        }[];
      }[];
    }>(result);
  });

  it('4 表关联表查询', async () => {
    const { Db } = await import('@/database/_db.class');
    const userTable = new Db<{
      _id: string;
      name: string;
      age: number;
      email: string;
    }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const postTable = new Db<{
      _id: string;
      userId: string;
      content: string;
      tags: string[];
    }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const commentTable = new Db<{
      _id: string;
      comment: string;
      postId: string;
      userId: string;
    }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const tagTable = new Db<{ _id: string; tagName: string }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    // 无需关心数据内容
    mockCollectionAggregate.end.mockResolvedValue({ data: [{}] });
    const result = await userTable
      .select({ _id: false, name: true, age: true })
      .lookup(
        postTable
          .lookup(commentTable, {
            relation: '1:n',
            localField: '_id',
            foreignField: 'postId',
            as: 'comments',
          })
          .lookup(tagTable, {
            relation: 'n:1',
            localField: 'tags',
            foreignField: '_id',
            as: 'tags',
          }),
        {
          relation: '1:n',
          localField: '_id',
          foreignField: 'userId',
          as: 'posts',
        },
      )
      .firstOrThrow();

    // 只对数据类型进行验证
    assertType<{
      name: string;
      age: number;
      posts: {
        _id: string;
        content: string;
        userId: string;
        comments: {
          _id: string;
          comment: string;
          postId: string;
        }[];
        tags: {
          _id: string;
          tagName: string;
        }[];
      }[];
    }>(result);
  });

  it('5 表关联表查询', async () => {
    const { Db } = await import('@/database/_db.class');
    const genUserTable = () =>
      new Db<{ _id: string; name: string; age: number; email: string }>({
        table: 'test-collection',
        _mockDatabase: mockCollection,
      });
    const postTable = new Db<{
      _id: string;
      userId: string;
      content: string;
      tags: string[];
    }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const commentTable = new Db<{
      _id: string;
      comment: string;
      postId: string;
      userId: string;
    }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const tagTable = new Db<{ _id: string; tagName: string }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    // 无需关心数据内容
    mockCollectionAggregate.end.mockResolvedValue({ data: [{}] });
    const result = await genUserTable()
      .select({ _id: false, name: true, age: true })
      .lookup(
        postTable
          .lookup(
            commentTable.lookup(genUserTable(), {
              relation: '1:1',
              localField: 'userId',
              foreignField: '_id',
              as: 'author',
            }),
            {
              relation: '1:n',
              localField: '_id',
              foreignField: 'postId',
              as: 'comments',
            },
          )
          .lookup(tagTable, {
            relation: 'n:1',
            localField: 'tags',
            foreignField: '_id',
            as: 'tags',
          }),
        {
          relation: '1:n',
          localField: '_id',
          foreignField: 'userId',
          as: 'posts',
        },
      )
      .firstOrThrow();

    // 只对数据类型进行验证
    assertType<{
      name: string;
      age: number;
      posts: {
        _id: string;
        content: string;
        userId: string;
        comments: {
          _id: string;
          comment: string;
          postId: string;
          author: {
            _id: string;
            name: string;
            age: number;
          };
        }[];
        tags: {
          _id: string;
          tagName: string;
        }[];
      }[];
    }>(result);
  });

  it('应该限制 sample 条件只能执行一次', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    dbInstance.sample(5);
    expect(() => dbInstance.sample(10)).toThrow('db.sample() 方法只能调用一次');
  });

  it('应该在 limit 后调用 sample 时抛出错误', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    dbInstance.limit(10);
    expect(() => dbInstance.sample(5)).toThrow('db.sample() 方法不支持 limit 条件');
  });

  it('应该在 sample 后调用 limit 时抛出错误', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    dbInstance.sample(5);
    expect(() => dbInstance.limit(10)).toThrow('db.limit() 方法不支持 sample 条件');
  });

  it('应该正确执行 sample 随机采样', async () => {
    const { Db } = await import('@/database/_db.class');
    const mockResponse = {
      result: {
        data: [{ _id: '1', name: 'lucky' }],
        errCode: 0,
        errMsg: '',
      },
    };
    mockCollectionAggregate.end.mockResolvedValue(mockResponse);

    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const result = await dbInstance.sample(5).many();

    expect(result).toEqual([{ _id: '1', name: 'lucky' }]);
    expect(mockCollection.aggregate).toHaveBeenCalled();
    expect(mockCollectionAggregate.sample).toHaveBeenCalledWith({ size: 5 });
    expect(mockCollectionAggregate.end).toHaveBeenCalled();
  });

  it('应该支持 sample 和 where 组合使用', async () => {
    const { Db } = await import('@/database/_db.class');
    mockCollectionAggregate.end.mockResolvedValue({ data: [{}] });

    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    await dbInstance.where({ status: 1 }).sample(5).many();

    expect(mockCollectionAggregate.match).toHaveBeenCalledWith({ status: 1 });
    expect(mockCollectionAggregate.sample).toHaveBeenCalledWith({ size: 5 });
  });

  it('应该支持 sample 和 order 组合使用', async () => {
    const { Db } = await import('@/database/_db.class');
    mockCollectionAggregate.end.mockResolvedValue({ data: [{}] });

    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    await dbInstance.order({ created_at: 'desc' }).sample(5).many();

    expect(mockCollectionAggregate.sort).toHaveBeenCalledWith({ created_at: -1 });
    expect(mockCollectionAggregate.sample).toHaveBeenCalledWith({ size: 5 });
  });

  it('应该支持 sample 和 skip 组合使用', async () => {
    const { Db } = await import('@/database/_db.class');
    mockCollectionAggregate.end.mockResolvedValue({ data: [{}] });

    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    await dbInstance.skip(10).sample(5).many();

    expect(mockCollectionAggregate.skip).toHaveBeenCalledWith(10);
    expect(mockCollectionAggregate.sample).toHaveBeenCalledWith({ size: 5 });
  });

  it('应该在 sample 查询错误时抛出 DbError', async () => {
    const { Db } = await import('@/database/_db.class');
    const { isDbError } = await import('@/database/error');

    const mockError = Object.assign(new Error('聚合查询失败'), {
      errCode: 5001,
      errMsg: 'E5001 聚合操作失败',
    });

    mockCollectionAggregate.end.mockRejectedValue(mockError);

    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });

    let caughtError: unknown;
    try {
      await dbInstance.sample(5).many();
    } catch (err) {
      caughtError = err;
    }

    expect(isDbError(caughtError)).toBe(true);
    expect((caughtError as DbError).errCode).toBe(5001);
    expect((caughtError as DbError).dbCode).toBe('E5001');
    expect((caughtError as DbError).message).toContain('聚合操作失败');
  });

  it('应该支持 sample(1) 和 firstOrThrow 组合使用', async () => {
    const { Db } = await import('@/database/_db.class');
    const mockResponse = {
      result: {
        data: [{ _id: '1', name: 'lucky' }],
        errCode: 0,
        errMsg: '',
      },
    };
    mockCollectionAggregate.end.mockResolvedValue(mockResponse);
    mockCollectionAggregate.limit.mockClear();

    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const result = await dbInstance.sample(1).firstOrThrow();

    expect(result).toEqual({ _id: '1', name: 'lucky' });
    expect(mockCollectionAggregate.sample).toHaveBeenCalledWith({ size: 1 });
    expect(mockCollectionAggregate.limit).not.toHaveBeenCalled();
  });

  it('应该支持 sample(1) 和 firstOrNull 组合使用', async () => {
    const { Db } = await import('@/database/_db.class');
    const mockResponse = {
      result: {
        data: [],
        errCode: 0,
        errMsg: '',
      },
    };
    mockCollectionAggregate.end.mockResolvedValue(mockResponse);
    mockCollectionAggregate.limit.mockClear();

    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const result = await dbInstance.sample(1).firstOrNull();

    expect(result).toBeNull();
    expect(mockCollectionAggregate.sample).toHaveBeenCalledWith({ size: 1 });
    expect(mockCollectionAggregate.limit).not.toHaveBeenCalled();
  });

  it('1:1 关联查询：必填字段返回非 nullable 类型', async () => {
    const { Db } = await import('@/database/_db.class');
    const studentTable = new Db<{
      _id: string;
      name: string;
      teacherId: string; // 必填
    }>({
      table: 'student',
      _mockDatabase: mockCollection,
    });
    const teacherTable = new Db<{
      _id: string;
      name: string;
    }>({
      table: 'teacher',
      _mockDatabase: mockCollection,
    });
    mockCollectionAggregate.end.mockResolvedValue({ data: [{}] });

    const result = await studentTable
      .lookup(teacherTable, {
        relation: '1:1',
        localField: 'teacherId',
        foreignField: '_id',
        as: 'teacher',
      })
      .firstOrThrow();

    // 必填字段，teacher 一定存在，不是 null
    assertType<{
      _id: string;
      name: string;
      teacherId: string;
      teacher: {
        _id: string;
        name: string;
      };
    }>(result);
  });

  it('1:1 关联查询：可选字段返回 nullable 类型', async () => {
    const { Db } = await import('@/database/_db.class');
    const studentTable = new Db<{
      _id: string;
      name: string;
      teacherId?: string; // 可选
    }>({
      table: 'student',
      _mockDatabase: mockCollection,
    });
    const teacherTable = new Db<{
      _id: string;
      name: string;
    }>({
      table: 'teacher',
      _mockDatabase: mockCollection,
    });
    mockCollectionAggregate.end.mockResolvedValue({ data: [{}] });

    const result = await studentTable
      .lookup(teacherTable, {
        relation: '1:1',
        localField: 'teacherId',
        foreignField: '_id',
        as: 'teacher',
      })
      .firstOrThrow();

    // 可选字段，teacher 可能为 null
    assertType<{
      _id: string;
      name: string;
      teacherId?: string;
      teacher: {
        _id: string;
        name: string;
      } | null;
    }>(result);
  });

  it('1:1 关联查询：nullable 字段返回 nullable 类型', async () => {
    const { Db } = await import('@/database/_db.class');
    const studentTable = new Db<{
      _id: string;
      name: string;
      teacherId: string | null; // nullable
    }>({
      table: 'student',
      _mockDatabase: mockCollection,
    });
    const teacherTable = new Db<{
      _id: string;
      name: string;
    }>({
      table: 'teacher',
      _mockDatabase: mockCollection,
    });
    mockCollectionAggregate.end.mockResolvedValue({ data: [{}] });

    const result = await studentTable
      .lookup(teacherTable, {
        relation: '1:1',
        localField: 'teacherId',
        foreignField: '_id',
        as: 'teacher',
      })
      .firstOrThrow();

    // nullable 字段，teacher 可能为 null
    assertType<{
      _id: string;
      name: string;
      teacherId: string | null;
      teacher: {
        _id: string;
        name: string;
      } | null;
    }>(result);
  });

  it('1:n 关联查询：返回类型始终是数组', async () => {
    const { Db } = await import('@/database/_db.class');
    const userTable = new Db<{
      _id: string;
      name: string;
    }>({
      table: 'user',
      _mockDatabase: mockCollection,
    });
    const postTable = new Db<{
      _id: string;
      userId: string;
      content: string;
    }>({
      table: 'post',
      _mockDatabase: mockCollection,
    });
    mockCollectionAggregate.end.mockResolvedValue({ data: [{}] });

    const result = await userTable
      .lookup(postTable, {
        relation: '1:n',
        localField: '_id',
        foreignField: 'userId',
        as: 'posts',
      })
      .firstOrThrow();

    // 1:n 始终是数组
    assertType<{
      _id: string;
      name: string;
      posts: {
        _id: string;
        userId: string;
        content: string;
      }[];
    }>(result);
  });

  it('n:1 关联查询：返回类型始终是数组', async () => {
    const { Db } = await import('@/database/_db.class');
    const studentTable = new Db<{
      _id: string;
      name: string;
      classId: string;
    }>({
      table: 'student',
      _mockDatabase: mockCollection,
    });
    const classTable = new Db<{
      _id: string;
      className: string;
    }>({
      table: 'class',
      _mockDatabase: mockCollection,
    });
    mockCollectionAggregate.end.mockResolvedValue({ data: [{}] });

    const result = await studentTable
      .lookup(classTable, {
        relation: 'n:1',
        localField: 'classId',
        foreignField: '_id',
        as: 'classes',
      })
      .firstOrThrow();

    // n:1 始终是数组
    assertType<{
      _id: string;
      name: string;
      classId: string;
      classes: {
        _id: string;
        className: string;
      }[];
    }>(result);
  });

  it('1:1 关联查询：主键关联返回 nullable 类型（关联表不一定存在）', async () => {
    const { Db } = await import('@/database/_db.class');
    const studentTable = new Db<{
      _id: string;
      name: string;
    }>({
      table: 'student',
      _mockDatabase: mockCollection,
    });
    const studentMetaTable = new Db<{
      _id: string;
      studentId: string;
      bio: string;
    }>({
      table: 'student_meta',
      _mockDatabase: mockCollection,
    });
    mockCollectionAggregate.end.mockResolvedValue({ data: [{}] });

    const result = await studentTable
      .lookup(studentMetaTable, {
        relation: '1:1',
        localField: '_id',
        foreignField: 'studentId',
        as: 'meta',
      })
      .firstOrThrow();

    // 主键关联，关联表不一定存在，返回 T | null
    assertType<{
      _id: string;
      name: string;
      meta: {
        _id: string;
        studentId: string;
        bio: string;
      } | null;
    }>(result);
  });
});
