import type { DbProxy } from '@/database/db';
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
  get: vi.fn().mockResolvedValue({ data: [] }),
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

  it('应该在找到记录时执行更新操作', async () => {
    const existingRecord = { _id: '1', name: 'test', value: 10 };
    const { dbUpsert } = await import('../src/database');
    const dbProxy = {
      where: vi.fn().mockReturnThis(),
      whereId: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      queryOne: vi.fn().mockResolvedValue(existingRecord),
      create: vi.fn().mockResolvedValue(existingRecord._id),
      update: vi.fn().mockResolvedValue({ updated: 1 }),
    } as unknown as DbProxy<{
      name: string;
      value: number;
    }>;

    const onBeforeUpdate = vi.fn();
    const onAfterUpdate = vi.fn();
    const result = await dbUpsert(dbProxy, {
      where: { name: 'test' },
      select: { name: true, value: true },
      create: { name: 'test', value: 10 },
      update: { value: 20 },
      onBeforeUpdate,
      onAfterUpdate,
    });

    expect(dbProxy.whereId).toHaveBeenCalledWith(existingRecord._id);
    expect(dbProxy.where).toHaveBeenCalledWith({ name: 'test' });
    expect(dbProxy.select).toHaveBeenCalledWith({ name: true, value: true });
    expect(dbProxy.queryOne).toHaveBeenCalledWith(true);
    expect(dbProxy.create).not.toHaveBeenCalled();
    expect(dbProxy.update).toHaveBeenCalledWith({ value: 20 });
    expect(result).toEqual({ id: existingRecord._id, created: false, updated: true });
    expect(onBeforeUpdate).toHaveBeenCalledWith(existingRecord);
    expect(onAfterUpdate).toHaveBeenCalledWith({ value: 20 }, existingRecord);
  });

  it('应该在找到记录时支持函数形式的更新操作', async () => {
    const existingRecord = { _id: '1', name: 'test', value: 10 };
    const { dbUpsert } = await import('../src/database');
    const dbProxy = {
      where: vi.fn().mockReturnThis(),
      whereId: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      queryOne: vi.fn().mockResolvedValue(existingRecord),
      create: vi.fn().mockResolvedValue(existingRecord._id),
      update: vi.fn().mockResolvedValue({ updated: 1 }),
    } as unknown as DbProxy<{
      name: string;
      value: number;
    }>;

    const onBeforeUpdate = vi.fn();
    const onAfterUpdate = vi.fn();
    const result = await dbUpsert(dbProxy, {
      where: { name: 'test' },
      select: { name: true, value: true },
      create: { name: 'test', value: 10 },
      update: (data) => ({ value: data.value + 20 }),
      onBeforeUpdate,
      onAfterUpdate,
    });

    expect(dbProxy.whereId).toHaveBeenCalledWith(existingRecord._id);
    expect(dbProxy.where).toHaveBeenCalledWith({ name: 'test' });
    expect(dbProxy.select).toHaveBeenCalledWith({ name: true, value: true });
    expect(dbProxy.queryOne).toHaveBeenCalledWith(true);
    expect(dbProxy.create).not.toHaveBeenCalled();
    expect(dbProxy.update).toHaveBeenCalledWith({ value: 30 });
    expect(result).toEqual({ id: existingRecord._id, created: false, updated: true });
    expect(onBeforeUpdate).toHaveBeenCalledWith(existingRecord);
    expect(onAfterUpdate).toHaveBeenCalledWith({ value: 30 }, existingRecord);
  });

  it('应该在未找到记录时执行创建操作', async () => {
    const { dbUpsert } = await import('../src/database');
    const existingRecord = { _id: '1', name: 'test', value: 10 };
    const dbProxy = {
      where: vi.fn().mockReturnThis(),
      whereId: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      queryOne: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue(existingRecord._id),
      update: vi.fn().mockResolvedValue({ updated: 1 }),
    } as unknown as DbProxy<{
      name: string;
      value: number;
    }>;

    const onBeforeCreate = vi.fn();
    const onAfterCreate = vi.fn();
    const result = await dbUpsert(dbProxy, {
      where: { name: 'test' }, // 使用普通where查询
      select: { name: true, value: true },
      create: { name: 'test', value: 10 },
      update: { value: 20 },
      onBeforeCreate,
      onAfterCreate,
    });

    expect(dbProxy.whereId).not.toHaveBeenCalled();
    expect(dbProxy.where).toHaveBeenCalledWith({ name: 'test' });
    expect(dbProxy.select).toHaveBeenCalledWith({ name: true, value: true });
    expect(dbProxy.queryOne).toHaveBeenCalledWith(true);
    expect(dbProxy.create).toHaveBeenCalled();
    expect(dbProxy.update).not.toHaveBeenCalled();
    expect(result).toEqual({ id: existingRecord._id, created: true, updated: false });
    expect(onBeforeCreate).toHaveBeenCalled();
    expect(onAfterCreate).toHaveBeenCalledWith(existingRecord._id);
  });

  it('应该在onBeforeUpdate返回false时跳过更新操作', async () => {
    const existingRecord = { _id: '1', name: 'test', value: 10 };
    const { dbUpsert } = await import('../src/database');
    const dbProxy = {
      where: vi.fn().mockReturnThis(),
      whereId: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      queryOne: vi.fn().mockResolvedValue(existingRecord),
      create: vi.fn().mockResolvedValue(existingRecord._id),
      update: vi.fn().mockResolvedValue({ updated: 1 }),
    } as unknown as DbProxy<{
      name: string;
      value: number;
    }>;

    const onBeforeUpdate = vi.fn().mockResolvedValue(false);
    const onAfterUpdate = vi.fn();
    const result = await dbUpsert(dbProxy, {
      where: { name: 'test' },
      select: { name: true, value: true },
      create: { name: 'test', value: 10 },
      update: { value: 20 },
      onBeforeUpdate,
      onAfterUpdate,
    });

    expect(dbProxy.whereId).not.toHaveBeenCalled();
    expect(dbProxy.where).toHaveBeenCalledWith({ name: 'test' });
    expect(dbProxy.select).toHaveBeenCalledWith({ name: true, value: true });
    expect(dbProxy.queryOne).toHaveBeenCalledWith(true);
    expect(dbProxy.create).not.toHaveBeenCalled();
    expect(dbProxy.update).not.toHaveBeenCalled();
    expect(result).toEqual({ id: existingRecord._id, created: false, updated: false });
    expect(onBeforeUpdate).toHaveBeenCalledWith(existingRecord);
    expect(onAfterUpdate).not.toHaveBeenCalled();
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
    expect(callArgs[0]).toBeInstanceOf(Function);

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
