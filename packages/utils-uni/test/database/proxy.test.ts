import { createMockData } from './_helpers';

const { mockUniCloud } = createMockData();

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
});
