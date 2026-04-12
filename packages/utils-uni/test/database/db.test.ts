import { assertType, describe, expect, it } from 'vitest';
import { createMockData } from './_helpers';

const { mockCollection, mockUniCloud, mockDatabase, mockTransaction, mockCollectionAggregate } = createMockData();

describe('db class', () => {
  beforeAll(() => {
    // @ts-ignore
    global.uniCloud = mockUniCloud;
  });

  afterAll(() => {
    // @ts-ignore
    // biome-ignore lint/performance/noDelete: <explanation>
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
    const dbInstance = new Db({ table: 'test-collection', _mockDatabase: mockCollection });

    expect(dbInstance).toBeInstanceOf(Db);
  });

  it('应该支持使用事务构造实例', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({ table: 'test-collection', transaction: mockTransaction });

    expect(dbInstance).toBeInstanceOf(Db);
  });

  it('应该正确启动数据库操作', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({ table: 'test-collection', _mockDatabase: mockCollection });

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
    expect(dbInstance).toHaveProperty('aggregate');
  });

  it('应该在数据库错误时调用parseError配置', async () => {
    const { Db } = await import('@/database/_db.class');
    type UniError = import('@/_types').UniError;
    const catchFn = vi.fn();

    const mockError = Object.assign(new Error('数据库错误'), {
      errCode: 1001,
      errMsg: '数据库查询失败',
    }) as UniError;

    const parsedError = Object.assign(new Error('解析后的错误'), {
      errCode: 1002,
      errMsg: '自定义错误信息',
    }) as UniError;

    const parseError = vi.fn().mockReturnValue(parsedError);
    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
      parseError,
    });

    mockCollection.get.mockRejectedValue(mockError);

    try {
      await dbInstance.many();
    } catch (err) {
      catchFn(err);
      const err2 = err as UniError;
      expect(err2.errCode).toEqual(parsedError.errCode);
    }

    expect(catchFn).toHaveBeenCalledWith(parsedError);
    expect(parseError).toHaveBeenCalledWith(mockError);
  });

  it('应该在没有parseError配置时直接抛出原始错误', async () => {
    const { Db } = await import('@/database/_db.class');
    type UniError = import('@/_types').UniError;

    const mockError = Object.assign(new Error('数据库错误'), {
      errCode: 1001,
      errMsg: '数据库查询失败',
    }) as UniError;

    const dbInstance = new Db({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });

    mockCollection.get.mockRejectedValue(mockError);

    await expect(dbInstance.many()).rejects.toThrow('数据库错误');
  });

  it('应该正确执行 where 条件查询', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({ table: 'test-collection', _mockDatabase: mockCollection });
    mockCollection.get.mockReturnValue({});
    dbInstance.where({ name: 'test' }).many();
    expect(mockCollection.where).toHaveBeenCalledWith({ name: 'test' });
  });

  it('应该限制 where 条件只能执行一次', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({ table: 'test-collection', _mockDatabase: mockCollection });
    dbInstance.where({ name: 'test' });

    expect(() => dbInstance.where({ name: 'test2' })).toThrow('已调用过一次 db.where({...}) 了');
  });

  it('应该正确执行 whereId 查询', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({ table: 'test-collection', _mockDatabase: mockCollection });
    mockCollection.get.mockReturnValue({});
    dbInstance.whereId('test-id').many();
    expect(mockCollection.limit).toHaveBeenCalledWith(1);
  });

  it('应该限制 whereId 条件只能执行一次', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({ table: 'test-collection', _mockDatabase: mockCollection });
    dbInstance.whereId('test-id');
    expect(() => dbInstance.whereId('test-id2')).toThrow('已调用过一次 db.whereId(id) 了');
  });

  it('应该限制 where 和 whereId 不能同时调用', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({ table: 'test-collection', _mockDatabase: mockCollection });
    dbInstance.where({ name: 'test' });
    expect(() => dbInstance.whereId('test-id')).toThrow('已调用过一次 db.where({...}) 了');
  });

  it('where 时应正确调用原生命令', async () => {
    const { Db } = await import('@/database/_db.class');
    const { dbQuery } = await import('@/database/command');
    const dbInstance = new Db({ table: 'test-collection', _mockDatabase: mockCollection });
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
    expect(mockCollection.field).toHaveBeenCalledWith({ name: true, age: true });
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
    const dbInstance = new Db({ table: 'test-collection', _mockDatabase: mockCollection });
    mockCollection.get.mockReturnValue({});
    dbInstance.order({ name: 'asc', age: 'desc' }).many();
    expect(mockCollection.orderBy).toHaveBeenCalledWith('name', 'asc');
    expect(mockCollection.orderBy).toHaveBeenCalledWith('age', 'desc');
  });

  it('应该正确执行 skip 跳过记录', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({ table: 'test-collection', _mockDatabase: mockCollection });
    mockCollection.get.mockReturnValue({});
    dbInstance.skip(10).many();
    expect(mockCollection.skip).toHaveBeenCalledWith(10);
  });

  it('应该限制 skip 条件只能执行一次', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({ table: 'test-collection', _mockDatabase: mockCollection });
    dbInstance.skip(10);
    expect(() => dbInstance.skip(20)).toThrow('db.skip() 方法只能调用一次');
  });

  it('应该正确执行 limit 限制记录数', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({ table: 'test-collection', _mockDatabase: mockCollection });
    mockCollection.get.mockReturnValue({});
    dbInstance.limit(5).many();
    expect(mockCollection.limit).toHaveBeenCalledWith(5);
  });

  it('应该限制 limit 条件只能执行一次', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({ table: 'test-collection', _mockDatabase: mockCollection });
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
    const dbInstance = new Db<{ name: string }>({ table: 'test-collection', _mockDatabase: mockCollection });
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

    const dbInstance = new Db({ table: 'test-collection', _mockDatabase: mockCollection });
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

    const dbInstance = new Db({ table: 'test-collection', _mockDatabase: mockCollection });
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

    const dbInstance = new Db({ table: 'test-collection', _mockDatabase: mockCollection });

    try {
      await dbInstance.firstOrThrow();
    } catch (err) {
      const err2 = err as Error & { errCode: string; errMsg: string };
      expect(err2.errCode).toBe('firstOrThrow');
      expect(err2.errMsg).toBe('查询数据为空');
      return;
    }

    throw new Error('不应执行到这里');
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

    const dbInstance = new Db({ table: 'test-collection', _mockDatabase: mockCollection });
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
    assertType<{ _id: string; name: string; age: number }>(result);
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
    assertType<{ _id: string; name: string; age: number }>(result);
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

    const dbInstance = new Db({ table: 'test-collection', _mockDatabase: mockCollection });
    const chain = dbInstance.where({ id: '1' });
    const result = await chain.update({ name: 'updated' });

    expect(result).toEqual(1);
    expect(mockCollection.update).toHaveBeenCalledWith({ name: 'updated' });
  });

  it('update 时应正确调用原生命令', async () => {
    const { Db } = await import('@/database/_db.class');
    const { dbQuery, dbMutate } = await import('@/database/command');
    const dbInstance = new Db({ table: 'test-collection', _mockDatabase: mockCollection });
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
    const dbInstance = new Db({ table: 'test-collection', _mockDatabase: mockCollection });

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

    const dbInstance = new Db({ table: 'test-collection', _mockDatabase: mockCollection });
    const chain = dbInstance.where({ id: '1' });
    const result = await chain.remove();

    expect(result).toEqual(1);
    expect(mockCollection.remove).toHaveBeenCalled();
  });

  it('应该在没有 where 条件时拒绝执行 remove 操作', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({ table: 'test-collection', _mockDatabase: mockCollection });

    await expect(dbInstance.remove()).rejects.toThrow('设置 where 条件后才能执行 db.remove() 方法');
  });

  it('应该支持 aggregate 操作', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({ table: 'test-collection', transaction: mockTransaction });
    const result = dbInstance.aggregate();

    expect(result).toEqual(mockCollectionAggregate);
    expect(mockCollection.aggregate).toHaveBeenCalled();
  });

  it('应该在事务模式下要求 update 操作的 where 条件必须是 _id', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({ table: 'test-collection', transaction: mockTransaction });
    dbInstance.where({ name: 'test' }); // 非 _id 条件

    await expect(dbInstance.update({ name: 'updated' })).rejects.toThrow(
      '事务模式下 db.update() 的 where 条件必须是 _id',
    );
  });

  it('应该在事务模式下要求 remove 操作的 where 条件必须是 _id', async () => {
    const { Db } = await import('@/database/_db.class');
    const dbInstance = new Db({ table: 'test-collection', transaction: mockTransaction });
    dbInstance.where({ name: 'test' }); // 非 _id 条件

    await expect(dbInstance.remove()).rejects.toThrow('事务模式下 db.remove() 的 where 条件必须是 _id');
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
    const dbInstance = new Db({ table: 'test-collection', transaction: mockTransaction });
    dbInstance.where({ _id: 'test-id' }); // _id 条件
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
    const dbInstance = new Db({ table: 'test-collection', transaction: mockTransaction });
    dbInstance.where({ _id: 'test-id' }); // _id 条件
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
    const userTable = new Db<{ _id: string; name: string; age: number; email: string }>({
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
    const userTable = new Db<{ _id: string; name: string; age: number; email: string }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const postTable = new Db<{ _id: string; userId: string; content: string; tags: string[] }>({
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
    const userTable = new Db<{ _id: string; name: string; age: number; email: string }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const postTable = new Db<{ _id: string; userId: string; content: string; tags: string[] }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const commentTable = new Db<{ _id: string; comment: string; postId: string; userId: string }>({
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
    const postTable = new Db<{ _id: string; userId: string; content: string; tags: string[] }>({
      table: 'test-collection',
      _mockDatabase: mockCollection,
    });
    const commentTable = new Db<{ _id: string; comment: string; postId: string; userId: string }>({
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
});
