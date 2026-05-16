import { createMockData } from './_helpers';

const { mockUniCloud, mockDatabase, mockTransaction, mockTransactionDb } = createMockData();

describe('dbTransaction', () => {
  beforeAll(() => {
    // @ts-expect-error
    global.uniCloud = mockUniCloud;
  });

  afterAll(() => {
    // @ts-expect-error
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
    const { dbTransaction } = await import('../../src/database');

    const mockResult = { id: '1', name: 'test' };
    const transactFn = vi.fn<() => void>().mockResolvedValue(mockResult);

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
    const { dbTransaction } = await import('../../src/database');

    const testError = new Error('事务执行失败');
    const transactFn = vi.fn<() => void>().mockRejectedValue(testError);

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
    const { dbTransaction } = await import('../../src/database');

    const testError = new Error('无法启动事务');
    mockTransactionDb.startTransaction.mockRejectedValue(testError);

    const transactFn = vi.fn<() => void>().mockResolvedValue({});

    await expect(dbTransaction(transactFn, mockTransactionDb)).rejects.toThrow('无法启动事务');

    // 验证事务函数没有被调用
    expect(transactFn).not.toHaveBeenCalled();

    // 验证没有提交或回滚
    expect(mockTransaction.commit).not.toHaveBeenCalled();
    expect(mockTransaction.rollback).not.toHaveBeenCalled();
  });
});
