import type { AnyFunction } from '@cloudcome/utils-core/types';

export function createMockData() {
  const genMockAggregate = () => {
    const aggregate = {
      lookup: vi.fn().mockReturnThis(),
      match: vi.fn().mockReturnThis(),
      project: vi.fn().mockReturnThis(),
      unwind: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      sample: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      group: vi.fn().mockReturnThis(),
      done: vi.fn().mockReturnThis(),
      // 结束，支持模拟返回值，用于数据测试
      end: vi.fn<AnyFunction>(),
    };
    return aggregate;
  };
  const mockCollectionAggregate = genMockAggregate();
  const mockPipelineAggregate = genMockAggregate();

  // 在导入模块前先模拟 uniCloud
  const mockCollection = {
    where: vi.fn<AnyFunction>().mockReturnThis(),
    field: vi.fn<AnyFunction>().mockReturnThis(),
    orderBy: vi.fn<AnyFunction>().mockReturnThis(),
    skip: vi.fn<AnyFunction>().mockReturnThis(),
    limit: vi.fn<AnyFunction>().mockReturnThis(),
    add: vi.fn<AnyFunction>(),
    count: vi.fn<AnyFunction>(),
    get: vi.fn<AnyFunction>(),
    update: vi.fn<AnyFunction>(),
    remove: vi.fn<AnyFunction>(),
    doc: vi.fn<AnyFunction>().mockReturnThis(),
    aggregate: vi.fn<() => typeof mockCollectionAggregate>().mockReturnValue(mockCollectionAggregate),
  };

  const mockDatabase = {
    collection: vi.fn<() => typeof mockCollection>().mockReturnValue(mockCollection),
    command: {
      eq: vi.fn<AnyFunction>(),
      expr: vi.fn<AnyFunction>(),
      inc: vi.fn<AnyFunction>(),
      aggregate: {
        pipeline: vi.fn<() => typeof mockPipelineAggregate>().mockReturnValue(mockPipelineAggregate),
        in: vi.fn<AnyFunction>(),
        eq: vi.fn<AnyFunction>(),
      },
    },
  };

  const mockUniCloud = {
    database: vi.fn<() => typeof mockDatabase>().mockReturnValue(mockDatabase),
  };

  const mockTransaction = {
    collection: vi.fn<() => typeof mockCollection>().mockReturnValue(mockCollection),
    commit: vi.fn<AnyFunction>().mockResolvedValue(undefined),
    rollback: vi.fn<AnyFunction>().mockResolvedValue(undefined),
  };

  const mockTransactionDb = {
    startTransaction: vi.fn<() => typeof mockTransaction>().mockResolvedValue(mockTransaction),
  };

  return {
    mockDatabase,
    mockCollection,
    mockUniCloud,
    mockCollectionAggregate,
    mockPipelineAggregate,
    mockTransaction,
    mockTransactionDb,
  };
}
