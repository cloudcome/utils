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
      end: vi.fn<() => void>(),
    };
    return aggregate;
  };
  const mockCollectionAggregate = genMockAggregate();
  const mockPipelineAggregate = genMockAggregate();

  // 在导入模块前先模拟 uniCloud
  const mockCollection = {
    where: vi.fn<() => void>().mockReturnThis(),
    field: vi.fn<() => void>().mockReturnThis(),
    orderBy: vi.fn<() => void>().mockReturnThis(),
    skip: vi.fn<() => void>().mockReturnThis(),
    limit: vi.fn<() => void>().mockReturnThis(),
    add: vi.fn<() => void>(),
    count: vi.fn<() => void>(),
    get: vi.fn<() => void>(),
    update: vi.fn<() => void>(),
    remove: vi.fn<() => void>(),
    doc: vi.fn<() => void>().mockReturnThis(),
    aggregate: vi.fn<() => void>().mockReturnValue(mockCollectionAggregate),
  };

  const mockDatabase = {
    collection: vi.fn<() => void>().mockReturnValue(mockCollection),
    command: {
      eq: vi.fn<() => void>(),
      expr: vi.fn<() => void>(),
      inc: vi.fn<() => void>(),
      aggregate: {
        pipeline: vi.fn<() => void>().mockReturnValue(mockPipelineAggregate),
        in: vi.fn<() => void>(),
        eq: vi.fn<() => void>(),
      },
    },
  };

  const mockUniCloud = {
    database: vi.fn<() => void>().mockReturnValue(mockDatabase),
  };

  const mockTransaction = {
    collection: vi.fn<() => void>().mockReturnValue(mockCollection),
    commit: vi.fn<() => void>().mockResolvedValue(undefined),
    rollback: vi.fn<() => void>().mockResolvedValue(undefined),
  };

  const mockTransactionDb = {
    startTransaction: vi.fn<() => void>().mockResolvedValue(mockTransaction),
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
