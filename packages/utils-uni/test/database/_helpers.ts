export function createMockData() {
  const genMockAggregate = () => {
    const aggregate = {
      lookup: () => aggregate,
      match: () => aggregate,
      project: () => aggregate,
      unwind: () => aggregate,
      limit: () => aggregate,
      done: () => aggregate,
      // 结束，支持模拟返回值，用于数据测试
      end: vi.fn<() => unknown>(),
    };
    return aggregate;
  };
  const mockCollectionAggregate = genMockAggregate();
  const mockPipelineAggregate = genMockAggregate();

  // 在导入模块前先模拟 uniCloud
  const mockCollection = {
    where: vi.fn<() => unknown>().mockReturnThis(),
    field: vi.fn<() => unknown>().mockReturnThis(),
    orderBy: vi.fn<() => unknown>().mockReturnThis(),
    skip: vi.fn<() => unknown>().mockReturnThis(),
    limit: vi.fn<() => unknown>().mockReturnThis(),
    add: vi.fn<() => unknown>(),
    count: vi.fn<() => unknown>(),
    get: vi.fn<() => unknown>(),
    update: vi.fn<() => unknown>(),
    remove: vi.fn<() => unknown>(),
    doc: vi.fn<() => unknown>().mockReturnThis(),
    aggregate: vi.fn<() => typeof mockCollectionAggregate>().mockReturnValue(mockCollectionAggregate),
  };

  const mockDatabase = {
    collection: vi.fn<() => typeof mockCollection>().mockReturnValue(mockCollection),
    command: {
      eq: vi.fn<() => unknown>(),
      expr: vi.fn<() => unknown>(),
      inc: vi.fn<() => unknown>(),
      aggregate: {
        pipeline: vi.fn<() => typeof mockPipelineAggregate>().mockReturnValue(mockPipelineAggregate),
        in: vi.fn<() => unknown>(),
        eq: vi.fn<() => unknown>(),
      },
    },
  };

  const mockUniCloud = {
    database: vi.fn<() => typeof mockDatabase>().mockReturnValue(mockDatabase),
  };

  const mockTransaction = {
    collection: vi.fn<() => typeof mockCollection>().mockReturnValue(mockCollection),
    commit: vi.fn<() => unknown>().mockResolvedValue(undefined),
    rollback: vi.fn<() => unknown>().mockResolvedValue(undefined),
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
