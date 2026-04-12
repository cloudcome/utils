import { createMockData } from './_helpers';

const { mockUniCloud, mockCollection } = createMockData();

describe('dbProxy 方法', () => {
  beforeAll(() => {
    // @ts-ignore
    global.uniCloud = mockUniCloud;
  });

  afterAll(() => {
    // @ts-ignore
    // biome-ignore lint/performance/noDelete: <explanation>
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
  });

  it('应该在数据库错误时调用parseError配置', async () => {
    const { dbProxy } = await import('@/database');

    const mockError = Object.assign(new Error('数据库错误'), {
      errCode: 1001,
      errMsg: '数据库查询失败',
    }) as import('@/_types').UniError;

    const parsedError = Object.assign(new Error('解析后的错误'), {
      errCode: 1002,
      errMsg: '自定义错误信息',
    }) as import('@/_types').UniError;

    const parseError = vi.fn().mockReturnValue(parsedError);
    const userTable = dbProxy<{ _id: string; nickname: string }>('user', { parseError });
    const catchFn = vi.fn();

    mockCollection.get.mockRejectedValue(mockError);

    try {
      await userTable.many();
    } catch (err) {
      catchFn(err);
    }

    expect(parseError).toHaveBeenCalledWith(mockError);
    expect(catchFn).toHaveBeenCalledWith(parsedError);
  });

  it('应该在没有parseError配置时直接抛出原始错误', async () => {
    const { dbProxy } = await import('@/database');

    const mockError = Object.assign(new Error('数据库错误'), {
      errCode: 1001,
      errMsg: '数据库查询失败',
    }) as import('@/_types').UniError;

    const userTable = dbProxy<{ _id: string; nickname: string }>('user');

    mockCollection.get.mockRejectedValue(mockError);

    await expect(userTable.many()).rejects.toThrow('数据库错误');
  });
});
