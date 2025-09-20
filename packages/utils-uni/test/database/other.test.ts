import { errorAssign } from '@cloudcome/utils-core/error';
import { createMockData } from './_helpers';

const { mockUniCloud } = createMockData();

describe('其他测试', () => {
  beforeAll(() => {
    // @ts-ignore
    global.uniCloud = mockUniCloud;
  });

  afterAll(() => {
    // @ts-ignore
    // biome-ignore lint/performance/noDelete: <explanation>
    delete global.uniCloud;
  });

  describe('dbCmd 和 dbAgg', () => {
    it('应该正确导出数据库命令对象', async () => {
      // 动态导入确保 uniCloud 已经被模拟
      const { dbCmd, dbAgg } = await import('@/database');
      expect(dbCmd).toBeDefined();
      expect(dbAgg).toBeDefined();
    });
  });

  describe('parseDatabaseOutput', () => {
    it('应该正确处理客户端响应结果', async () => {
      const { parseDatabaseOutput } = await import('@/database');

      const mockResponse = {
        result: {
          data: [{ id: '1', name: 'test' }],
          errCode: 0,
          errMsg: 'success',
        },
      };

      const result = parseDatabaseOutput(mockResponse);

      expect(result).toEqual({
        data: [{ id: '1', name: 'test' }],
      });
    });

    it('应该正确处理云端响应结果', async () => {
      const { parseDatabaseOutput } = await import('@/database');

      const mockResponse = {
        data: [{ id: '1', name: 'test' }],
      };

      const result = parseDatabaseOutput(mockResponse);

      expect(result).toEqual({
        data: [{ id: '1', name: 'test' }],
      });
    });

    it('应该正确处理错误响应', async () => {
      const { parseDatabaseOutput } = await import('@/database');

      const mockResponse = {
        result: {
          errCode: 404,
          errMsg: 'Not Found',
        },
      };

      expect(() => parseDatabaseOutput(mockResponse)).toThrowError(
        errorAssign(new Error('Not Found'), mockResponse.result),
      );
    });
  });
});
