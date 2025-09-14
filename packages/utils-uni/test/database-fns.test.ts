import { objectEach } from '@cloudcome/utils-core/object';
import { describe, expect, it, vi } from 'vitest';

// 在导入模块前先模拟 uniCloud
const mockCollection = {
  where: vi.fn().mockReturnThis(),
  field: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  skip: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  add: vi.fn().mockResolvedValue({}),
  count: vi.fn().mockResolvedValue({}),
  get: vi.fn().mockResolvedValue({}),
  update: vi.fn().mockResolvedValue({}),
  remove: vi.fn().mockResolvedValue({}),
  aggregate: vi.fn().mockResolvedValue({}),
  queryOne: vi.fn().mockResolvedValue(undefined),
  create: vi.fn().mockResolvedValue({}),
  doc: vi.fn().mockReturnThis(),
  whereId: vi.fn().mockReturnThis(),
};

const mockDatabase = {
  collection: vi.fn().mockReturnValue(mockCollection),
  command: {
    aggregate: {},
  },
};

const mockTransaction = {
  commit: vi.fn().mockResolvedValue(undefined),
  rollback: vi.fn().mockResolvedValue(undefined),
};

const mockTransactionDb = {
  startTransaction: vi.fn().mockResolvedValue(mockTransaction),
};

const mockUniCloud = {
  database: vi.fn().mockReturnValue(mockDatabase),
};

describe('dbUpsert', () => {
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
    // 重置所有模拟函数的调用历史
    vi.clearAllMocks();

    // 重置模拟数据库操作
    objectEach(mockCollection, (fn) => {
      if (typeof fn === 'function' && fn.mockReset) {
        fn.mockReset();
      }
    });

    // 重置事务相关模拟
    mockTransaction.commit.mockReset();
    mockTransaction.rollback.mockReset();
    mockTransactionDb.startTransaction.mockReset();

    // 重新设置返回值
    mockCollection.where.mockReturnThis();
    mockCollection.field.mockReturnThis();
    mockCollection.orderBy.mockReturnThis();
    mockCollection.skip.mockReturnThis();
    mockCollection.limit.mockReturnThis();
    mockCollection.add.mockResolvedValue({});
    mockCollection.count.mockResolvedValue({});
    mockCollection.get.mockResolvedValue({});
    mockCollection.update.mockResolvedValue({});
    mockCollection.remove.mockResolvedValue({});
    mockCollection.aggregate.mockResolvedValue({});
    mockCollection.queryOne.mockResolvedValue(undefined);
    mockCollection.create.mockResolvedValue({});
    mockCollection.doc.mockReturnThis();
    mockCollection.whereId.mockReturnThis();

    // 重置事务相关返回值
    mockTransaction.commit.mockResolvedValue(undefined);
    mockTransaction.rollback.mockResolvedValue(undefined);
    mockTransactionDb.startTransaction.mockResolvedValue(mockTransaction);

    // 重置模拟数据库
    mockDatabase.collection.mockReturnValue(mockCollection);
    mockUniCloud.database.mockReturnValue(mockDatabase);
  });

  it('应该在找到记录时执行更新操作', async () => {
    const existingRecord = { _id: '1', name: 'test', value: 10 };
    const updateData = { value: 20 };

    mockCollection.queryOne.mockResolvedValue(existingRecord);
    mockCollection.update.mockResolvedValue({ updated: 1 });

    const { dbUpsert } = await import('../src/database');

    // 创建支持链式调用的模拟对象
    const mockDbInstance = {
      where: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      queryOne: mockCollection.queryOne,
      whereId: mockCollection.whereId,
      update: mockCollection.update,
      create: mockCollection.create,
    };

    const options = {
      collection: 'test-collection',
      where: { name: 'test' },
      select: { name: true, value: true },
      create: { name: 'test', value: 10 },
      update: updateData,
      _mockDb: () => mockDbInstance,
    };

    const result = await dbUpsert(options);

    // 验证查询被正确调用
    expect(mockDbInstance.where).toHaveBeenNthCalledWith(1, { name: 'test' });
    expect(mockDbInstance.select).toHaveBeenCalledWith({ name: true, value: true });
    expect(mockDbInstance.limit).toHaveBeenCalledWith(1);
    expect(mockDbInstance.queryOne).toHaveBeenCalledWith(true);

    // 验证更新被正确调用
    expect(mockDbInstance.whereId).toHaveBeenCalledWith('1');
    expect(mockDbInstance.update).toHaveBeenCalledWith(updateData);

    // 验证返回值
    expect(result).toEqual({ updated: 1 });
  });

  it('应该在未找到记录时执行创建操作', async () => {
    mockCollection.queryOne.mockResolvedValue(undefined);
    mockCollection.create.mockResolvedValue({ id: 'new-id' });

    const { dbUpsert } = await import('../src/database');

    // 创建支持链式调用的模拟对象
    const mockDbInstance = {
      where: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      queryOne: mockCollection.queryOne,
      whereId: mockCollection.whereId,
      update: mockCollection.update,
      create: mockCollection.create,
    };

    const options = {
      collection: 'test-collection',
      where: { name: 'test' },
      select: { name: true, value: true },
      create: { name: 'test', value: 10 },
      update: { value: 20 },
      _mockDb: () => mockDbInstance,
    };

    const result = await dbUpsert(options);

    // 验证查询被正确调用
    expect(mockDbInstance.where).toHaveBeenCalledWith({ name: 'test' });
    expect(mockDbInstance.select).toHaveBeenCalledWith({ name: true, value: true });
    expect(mockDbInstance.limit).toHaveBeenCalledWith(1);
    expect(mockDbInstance.queryOne).toHaveBeenCalledWith(true);

    // 验证创建被正确调用
    expect(mockCollection.create).toHaveBeenCalledWith({ name: 'test', value: 10 });

    // 验证返回值
    expect(result).toEqual({ id: 'new-id' });
  });

  it('应该在找到记录时支持函数形式的更新操作', async () => {
    const existingRecord = { _id: '1', name: 'test', value: 10 };
    const updateFn = vi.fn().mockReturnValue({ value: 25 });

    mockCollection.queryOne.mockResolvedValue(existingRecord);
    mockCollection.update.mockResolvedValue({ updated: 1 });

    const { dbUpsert } = await import('../src/database');

    // 创建支持链式调用的模拟对象
    const mockDbInstance = {
      where: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      queryOne: mockCollection.queryOne,
      whereId: mockCollection.whereId,
      update: mockCollection.update,
      create: mockCollection.create,
    };

    const options = {
      collection: 'test-collection',
      where: { name: 'test' },
      select: { name: true, value: true },
      create: { name: 'test', value: 10 },
      update: updateFn,
      _mockDb: () => mockDbInstance,
    };

    const result = await dbUpsert(options);

    // 验证更新函数被调用且传入了正确的参数
    expect(updateFn).toHaveBeenCalledWith(existingRecord);

    // 验证更新被正确调用
    expect(mockDbInstance.whereId).toHaveBeenCalledWith('1');
    expect(mockDbInstance.update).toHaveBeenCalledWith({ value: 25 });

    // 验证返回值
    expect(result).toEqual({ updated: 1 });
  });

  it('应该正确执行创建前后的回调函数', async () => {
    mockCollection.queryOne.mockResolvedValue(undefined);
    mockCollection.create.mockResolvedValue('new-id');

    const { dbUpsert } = await import('../src/database');

    const onBeforeCreate = vi.fn();
    const onAfterCreate = vi.fn();

    // 创建支持链式调用的模拟对象
    const mockDbInstance = {
      where: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      queryOne: mockCollection.queryOne,
      whereId: mockCollection.whereId,
      update: mockCollection.update,
      create: mockCollection.create,
    };

    const options = {
      collection: 'test-collection',
      where: { name: 'test' },
      select: { name: true, value: true },
      create: { name: 'test', value: 10 },
      update: { value: 20 },
      onBeforeCreate,
      onAfterCreate,
      _mockDb: () => mockDbInstance,
    };

    await dbUpsert(options);

    // 验证回调函数被正确调用
    expect(onBeforeCreate).toHaveBeenCalled();
    expect(onAfterCreate).toHaveBeenCalledWith('new-id');
  });

  it('应该正确执行更新前后的回调函数', async () => {
    const existingRecord = { _id: '1', name: 'test', value: 10 };

    mockCollection.queryOne.mockResolvedValue(existingRecord);
    mockCollection.update.mockResolvedValue({ updated: 1 });

    const { dbUpsert } = await import('../src/database');

    const onBeforeUpdate = vi.fn();
    const onAfterUpdate = vi.fn();

    // 创建支持链式调用的模拟对象
    const mockDbInstance = {
      where: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      queryOne: mockCollection.queryOne,
      whereId: mockCollection.whereId,
      update: mockCollection.update,
      create: mockCollection.create,
    };

    const options = {
      collection: 'test-collection',
      where: { name: 'test' },
      select: { name: true, value: true },
      create: { name: 'test', value: 10 },
      update: { value: 20 },
      onBeforeUpdate,
      onAfterUpdate,
      _mockDb: () => mockDbInstance,
    };

    await dbUpsert(options);

    // 验证回调函数被正确调用
    expect(onBeforeUpdate).toHaveBeenCalledWith(existingRecord);
    expect(onAfterUpdate).toHaveBeenCalled();
  });

  it('应该在查询失败时抛出错误', async () => {
    mockCollection.queryOne.mockRejectedValue(new Error('查询失败'));

    const { dbUpsert } = await import('../src/database');

    // 创建支持链式调用的模拟对象
    const mockDbInstance = {
      where: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      queryOne: mockCollection.queryOne,
      whereId: mockCollection.whereId,
      update: mockCollection.update,
      create: mockCollection.create,
    };

    const options = {
      collection: 'test-collection',
      where: { name: 'test' },
      select: { name: true, value: true },
      create: { name: 'test', value: 10 },
      update: { value: 20 },
      _mockDb: () => mockDbInstance,
    };

    await expect(dbUpsert(options)).rejects.toThrow('查询失败');
  });

  it('应该在更新失败时抛出错误', async () => {
    const existingRecord = { _id: '1', name: 'test', value: 10 };

    mockCollection.queryOne.mockResolvedValue(existingRecord);
    mockCollection.update.mockRejectedValue(new Error('更新失败'));

    const { dbUpsert } = await import('../src/database');

    // 创建支持链式调用的模拟对象
    const mockDbInstance = {
      where: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      queryOne: mockCollection.queryOne,
      whereId: mockCollection.whereId,
      update: mockCollection.update,
      create: mockCollection.create,
    };

    const options = {
      collection: 'test-collection',
      where: { name: 'test' },
      select: { name: true, value: true },
      create: { name: 'test', value: 10 },
      update: { value: 20 },
      _mockDb: () => mockDbInstance,
    };

    await expect(dbUpsert(options)).rejects.toThrow('更新失败');
  });

  it('应该在创建失败时抛出错误', async () => {
    mockCollection.queryOne.mockResolvedValue(undefined);
    mockCollection.create.mockRejectedValue(new Error('创建失败'));

    const { dbUpsert } = await import('../src/database');

    // 创建支持链式调用的模拟对象
    const mockDbInstance = {
      where: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      queryOne: mockCollection.queryOne,
      whereId: mockCollection.whereId,
      update: mockCollection.update,
      create: mockCollection.create,
    };

    const options = {
      collection: 'test-collection',
      where: { name: 'test' },
      select: { name: true, value: true },
      create: { name: 'test', value: 10 },
      update: { value: 20 },
      _mockDb: () => mockDbInstance,
    };

    await expect(dbUpsert(options)).rejects.toThrow('创建失败');
  });
});

describe('dbTransaction', () => {
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
    // 重置所有模拟函数的调用历史
    vi.clearAllMocks();

    // 重置事务相关模拟
    mockTransaction.commit.mockReset();
    mockTransaction.rollback.mockReset();
    mockTransactionDb.startTransaction.mockReset();

    // 重置事务相关返回值
    mockTransaction.commit.mockResolvedValue(undefined);
    mockTransaction.rollback.mockResolvedValue(undefined);
    mockTransactionDb.startTransaction.mockResolvedValue(mockTransaction);

    // 重置模拟数据库
    mockUniCloud.database.mockReturnValue(mockDatabase);
  });

  it('应该在事务中成功执行操作并提交事务', async () => {
    const { dbTransaction, Db } = await import('../src/database');

    const mockResult = { id: '1', name: 'test' };
    const transactFn = vi.fn().mockResolvedValue(mockResult);

    const result = await dbTransaction(transactFn, mockTransactionDb);

    // 验证事务已启动
    expect(mockTransactionDb.startTransaction).toHaveBeenCalled();

    // 验证事务函数被调用且传入了正确的参数
    expect(transactFn).toHaveBeenCalled();
    const callArgs = transactFn.mock.calls[0];
    expect(callArgs[0]).toBeInstanceOf(Db);

    // 验证事务已提交
    expect(mockTransaction.commit).toHaveBeenCalled();

    // 验证没有回滚
    expect(mockTransaction.rollback).not.toHaveBeenCalled();

    // 验证返回值
    expect(result).toEqual(mockResult);
  });

  it('应该在事务执行失败时回滚事务并抛出错误', async () => {
    const { dbTransaction } = await import('../src/database');

    const testError = new Error('事务执行失败');
    const transactFn = vi.fn().mockRejectedValue(testError);

    // 验证函数抛出错误
    await expect(dbTransaction(transactFn, mockTransactionDb)).rejects.toThrow('事务执行失败');

    // 验证事务已启动
    expect(mockTransactionDb.startTransaction).toHaveBeenCalled();

    // 验证事务函数被调用
    expect(transactFn).toHaveBeenCalled();

    // 验证事务已回滚
    expect(mockTransaction.rollback).toHaveBeenCalled();

    // 验证没有提交
    expect(mockTransaction.commit).not.toHaveBeenCalled();
  });

  it('应该在无法启动事务时抛出错误', async () => {
    const { dbTransaction } = await import('../src/database');

    const testError = new Error('无法启动事务');
    mockTransactionDb.startTransaction.mockRejectedValue(testError);

    const transactFn = vi.fn().mockResolvedValue({});

    await expect(dbTransaction(transactFn, mockTransactionDb)).rejects.toThrow('无法启动事务');

    // 验证事务函数没有被调用
    expect(transactFn).not.toHaveBeenCalled();

    // 验证没有提交或回滚
    expect(mockTransaction.commit).not.toHaveBeenCalled();
    expect(mockTransaction.rollback).not.toHaveBeenCalled();
  });
});
