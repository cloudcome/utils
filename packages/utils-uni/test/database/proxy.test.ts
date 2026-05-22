import type { AnyFunction } from '@cloudcome/utils-core/types';
import { createMockData } from './_helpers';
import type { DbError } from '@/database';

const { mockUniCloud, mockCollection } = createMockData();

describe('dbProxy 方法', () => {
  beforeAll(() => {
    // @ts-expect-error
    global.uniCloud = mockUniCloud;
  });

  afterAll(() => {
    // @ts-expect-error
    delete global.uniCloud;
  });

  it('dbProxy 方法返回的 proxy 对象，每次方法调用都是返回新实例', async () => {
    const { dbProxy } = await import('@/database');
    const collection = dbProxy('test-collection');

    const table1 = collection.where({});
    const table2 = collection.where({});

    expect(table1).not.toBe(table2);
  });

  it('能进行 db 操作', async () => {
    const { dbProxy } = await import('@/database');
    const userTable = dbProxy<{ _id: string; nickname: string }>('user');
    mockCollection.get.mockResolvedValue({
      data: [{ _id: '1', nickname: 'test' }],
    });
    const user = await userTable.firstOrThrow();

    assertType<{ _id: string; nickname: string }>(user);
    expect(user).toEqual({ _id: '1', nickname: 'test' });
  });

  it('应该在数据库错误时抛出 DbError', async () => {
    const { dbProxy } = await import('@/database');
    const { isDbError } = await import('@/database/error');

    const mockError = Object.assign(new Error('数据库错误'), {
      errCode: 'InternalServerError',
      errMsg: 'E11000 duplicate key error collection: test index: _id dup key',
    });

    const userTable = dbProxy<{ _id: string; nickname: string }>('user');
    const catchFn = vi.fn<AnyFunction>();

    mockCollection.get.mockRejectedValue(mockError);

    let caughtError: unknown;
    try {
      await userTable.many();
    } catch (err) {
      caughtError = err;
      catchFn(err);
    }

    expect(caughtError).not.toBeUndefined();
    expect(isDbError(caughtError)).toBe(true);
    expect((caughtError as DbError).errCode).toBe('InternalServerError');
    expect((caughtError as DbError).dbCode).toBe('E11000');
    expect(catchFn).toHaveBeenCalled();
  });

  it('应该在没有 errMsg 时直接抛出原始错误', async () => {
    const { dbProxy } = await import('@/database');
    const { isDbError } = await import('@/database/error');

    const mockError = new Error('非数据库原始错误');

    const userTable = dbProxy<{ _id: string; nickname: string }>('user');

    mockCollection.get.mockRejectedValue(mockError);

    let caughtError: unknown;
    try {
      await userTable.many();
    } catch (err) {
      caughtError = err;
    }

    expect(isDbError(caughtError)).toBe(false);
    expect(caughtError).toBe(mockError);
    expect((caughtError as Error).message).toBe('非数据库原始错误');
  });
});
