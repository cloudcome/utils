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

    const options = {
      collection: 'test-collection',
      where: { name: 'test' },
      create: { name: 'test', value: 10 },
      update: updateData,
      _mockDb: () => mockCollection,
    };

    const result = await dbUpsert(options);

    // 验证查询被正确调用
    expect(mockCollection.where).toHaveBeenNthCalledWith(1, { name: 'test' });
    expect(mockCollection.limit).toHaveBeenCalledWith(1);
    expect(mockCollection.queryOne).toHaveBeenCalledWith(true);

    // 验证更新被正确调用
    expect(mockCollection.where).toHaveBeenNthCalledWith(2, { _id: '1' });
    expect(mockCollection.update).toHaveBeenCalledWith(updateData);

    // 验证返回值
    expect(result).toEqual({ updated: 1 });
  });

  it('应该在未找到记录时执行创建操作', async () => {
    mockCollection.queryOne.mockResolvedValue(undefined);
    mockCollection.create.mockResolvedValue({ id: 'new-id' });

    const { dbUpsert } = await import('../src/database');

    const options = {
      collection: 'test-collection',
      where: { name: 'test' },
      create: { name: 'test', value: 10 },
      update: { value: 20 },
      _mockDb: () => mockCollection,
    };

    const result = await dbUpsert(options);

    // 验证查询被正确调用
    expect(mockCollection.where).toHaveBeenCalledWith({ name: 'test' });
    expect(mockCollection.limit).toHaveBeenCalledWith(1);
    expect(mockCollection.queryOne).toHaveBeenCalledWith(true);

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

    const options = {
      collection: 'test-collection',
      where: { name: 'test' },
      create: { name: 'test', value: 10 },
      update: updateFn,
      _mockDb: () => mockCollection,
    };

    const result = await dbUpsert(options);

    // 验证更新函数被调用且传入了正确的参数
    expect(updateFn).toHaveBeenCalledWith(existingRecord);

    // 验证更新被正确调用
    expect(mockCollection.where).toHaveBeenNthCalledWith(2, { _id: '1' });
    expect(mockCollection.update).toHaveBeenCalledWith({ value: 25 });

    // 验证返回值
    expect(result).toEqual({ updated: 1 });
  });

  it('应该正确执行创建前后的回调函数', async () => {
    mockCollection.queryOne.mockResolvedValue(undefined);
    mockCollection.create.mockResolvedValue({ id: 'new-id' });

    const { dbUpsert } = await import('../src/database');

    const onBeforeCreate = vi.fn();
    const onAfterCreate = vi.fn();

    const options = {
      collection: 'test-collection',
      where: { name: 'test' },
      create: { name: 'test', value: 10 },
      update: { value: 20 },
      onBeforeCreate,
      onAfterCreate,
      _mockDb: () => mockCollection,
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

    const options = {
      collection: 'test-collection',
      where: { name: 'test' },
      create: { name: 'test', value: 10 },
      update: { value: 20 },
      onBeforeUpdate,
      onAfterUpdate,
      _mockDb: () => mockCollection,
    };

    await dbUpsert(options);

    // 验证回调函数被正确调用
    expect(onBeforeUpdate).toHaveBeenCalledWith(existingRecord);
    expect(onAfterUpdate).toHaveBeenCalled();
  });

  it('应该在查询失败时抛出错误', async () => {
    mockCollection.queryOne.mockRejectedValue(new Error('查询失败'));

    const { dbUpsert } = await import('../src/database');

    const options = {
      collection: 'test-collection',
      where: { name: 'test' },
      create: { name: 'test', value: 10 },
      update: { value: 20 },
      _mockDb: () => mockCollection,
    };

    await expect(dbUpsert(options)).rejects.toThrow('查询失败');
  });

  it('应该在更新失败时抛出错误', async () => {
    const existingRecord = { _id: '1', name: 'test', value: 10 };

    mockCollection.queryOne.mockResolvedValue(existingRecord);
    mockCollection.update.mockRejectedValue(new Error('更新失败'));

    const { dbUpsert } = await import('../src/database');

    const options = {
      collection: 'test-collection',
      where: { name: 'test' },
      create: { name: 'test', value: 10 },
      update: { value: 20 },
      _mockDb: () => mockCollection,
    };

    await expect(dbUpsert(options)).rejects.toThrow('更新失败');
  });

  it('应该在创建失败时抛出错误', async () => {
    mockCollection.queryOne.mockResolvedValue(undefined);
    mockCollection.create.mockRejectedValue(new Error('创建失败'));

    const { dbUpsert } = await import('../src/database');

    const options = {
      collection: 'test-collection',
      where: { name: 'test' },
      create: { name: 'test', value: 10 },
      update: { value: 20 },
      _mockDb: () => mockCollection,
    };

    await expect(dbUpsert(options)).rejects.toThrow('创建失败');
  });
});
