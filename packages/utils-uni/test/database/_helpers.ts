export function createMockData() {
  const genMockAggregate = () => {
    const aggregate = {
      lookup: () => aggregate,
      match: () => aggregate,
      project: () => aggregate,
      limit: () => aggregate,
      done: () => aggregate,
      // 结束，支持模拟返回值，用于数据测试
      end: vi.fn(),
    };
    return aggregate;
  };
  const mockCollectionAggregate = genMockAggregate();
  const mockPipelineAggregate = genMockAggregate();

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
    doc: vi.fn().mockReturnThis(),
    aggregate: vi.fn().mockReturnValue(mockCollectionAggregate),
  };

  const mockDatabase = {
    collection: vi.fn().mockReturnValue(mockCollection),
    command: {
      expr: vi.fn(),
      aggregate: {
        pipeline: vi.fn().mockReturnValue(mockPipelineAggregate),
        in: vi.fn(),
        eq: vi.fn(),
      },
    },
  };

  const mockUniCloud = {
    database: vi.fn().mockReturnValue(mockDatabase),
  };

  const mockTransaction = {
    commit: vi.fn().mockResolvedValue(undefined),
    rollback: vi.fn().mockResolvedValue(undefined),
  };

  const mockTransactionDb = {
    startTransaction: vi.fn().mockResolvedValue(mockTransaction),
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
