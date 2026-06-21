import { describe, expect, it, vi } from 'vitest';
import type { AnyAsyncFunction } from '@cloudcome/utils-core/types';

const MOCK_JSON_DATA = JSON.stringify({ name: 'test' });
const MOCK_BUFFER_DATA = Buffer.from(MOCK_JSON_DATA);

function createMockUniCloud() {
  const mockRequest = vi.fn<AnyAsyncFunction>().mockImplementation(async (_url, opts) => ({
    data: opts?.dataType === 'text' ? MOCK_JSON_DATA : MOCK_BUFFER_DATA,
    status: 200,
    headers: { 'content-type': 'application/json' },
  }));

  return {
    httpclient: {
      request: mockRequest,
    },
    mockRequest,
  };
}

describe('request', () => {
  const { mockUniCloud, mockRequest } = (() => {
    const mock = createMockUniCloud();
    return { mockUniCloud: mock, mockRequest: mock.mockRequest };
  })();

  beforeAll(() => {
    // @ts-expect-error
    global.uniCloud = mockUniCloud;
  });

  afterAll(() => {
    // @ts-expect-error
    delete global.uniCloud;
  });

  beforeEach(() => {
    mockRequest.mockClear();
    mockRequest.mockImplementation(async (_url, opts) => ({
      data: opts?.dataType === 'text' ? MOCK_JSON_DATA : MOCK_BUFFER_DATA,
      status: 200,
      headers: { 'content-type': 'application/json' },
    }));
  });

  it('应该发起 GET 请求', async () => {
    const { request } = await import('../../src/cloud/request');

    const res = await request<{ name: string }>({
      url: 'https://api.example.com/users/1',
    });

    expect(res.data).toEqual({ name: 'test' });
    expect(res.status).toBe(200);
    expect(mockRequest).toHaveBeenCalled();
    const [calledUrl, calledOptions] = mockRequest.mock.calls[0];
    expect(calledUrl).toContain('https://api.example.com/users/1');
    expect(calledOptions.method).toBe('GET');
  });

  it('应该发起 POST 请求', async () => {
    const { request } = await import('../../src/cloud/request');

    await request({
      url: 'https://api.example.com/users',
      method: 'POST',
      data: { name: 'Alice', age: 25 },
    });

    const [, calledOptions] = mockRequest.mock.calls[0];
    expect(calledOptions.method).toBe('POST');
    expect(calledOptions.data).toEqual({ name: 'Alice', age: 25 });
  });

  it('应该发起 PUT 请求', async () => {
    const { request } = await import('../../src/cloud/request');

    await request({
      url: 'https://api.example.com/users/1',
      method: 'PUT',
      data: { name: 'Bob' },
    });

    const [, calledOptions] = mockRequest.mock.calls[0];
    expect(calledOptions.method).toBe('PUT');
  });

  it('应该发起 DELETE 请求', async () => {
    const { request } = await import('../../src/cloud/request');

    await request({
      url: 'https://api.example.com/users/1',
      method: 'DELETE',
    });

    const [, calledOptions] = mockRequest.mock.calls[0];
    expect(calledOptions.method).toBe('DELETE');
  });

  it('应该将查询参数拼接到 URL 上', async () => {
    const { request } = await import('../../src/cloud/request');

    await request({
      url: 'https://api.example.com/users',
      query: { page: '1', size: '10' },
    });

    const [calledUrl] = mockRequest.mock.calls[0];
    expect(calledUrl).toContain('page=1');
    expect(calledUrl).toContain('size=10');
  });

  it('应该传递自定义请求头', async () => {
    const { request } = await import('../../src/cloud/request');

    await request({
      url: 'https://api.example.com/users',
      headers: { Authorization: 'Bearer token123' },
    });

    const [, calledOptions] = mockRequest.mock.calls[0];
    expect(calledOptions.headers).toEqual({ Authorization: 'Bearer token123' });
  });

  it('应该使用默认值', async () => {
    const { request } = await import('../../src/cloud/request');

    await request({
      url: 'https://api.example.com/users',
    });

    const [, calledOptions] = mockRequest.mock.calls[0];
    expect(calledOptions.method).toBe('GET');
    expect(calledOptions.dataType).toBe('text');
    expect(calledOptions.contentType).toBe('json');
    expect(calledOptions.timeout).toBe(10000);
    expect(calledOptions.headers).toEqual({});
  });

  it('应该支持自定义 dataType 为 buffer', async () => {
    const { request } = await import('../../src/cloud/request');

    const res = await request<{ name: string }>({
      url: 'https://api.example.com/users',
      dataType: 'buffer',
    });

    // raw 为 Buffer
    expect(res.raw).toBeInstanceOf(Buffer);
    expect(res.raw).toEqual(MOCK_BUFFER_DATA);

    // data 不被 JSON.parse，直接等于 raw
    expect(res.data).toEqual(res.raw);

    // httpclient 不传 dataType
    const [, calledOptions] = mockRequest.mock.calls[0];
    expect(calledOptions.dataType).toBeUndefined();
  });

  it('dataType 为 json 时 raw 为字符串', async () => {
    const { request } = await import('../../src/cloud/request');

    const res = await request<{ name: string }>({
      url: 'https://api.example.com/users',
    });

    // raw 为原始 JSON 字符串
    expect(res.raw).toBeTypeOf('string');
    expect(res.raw).toBe(MOCK_JSON_DATA);

    // data 被 JSON.parse
    expect(res.data).toEqual({ name: 'test' });
  });

  it('dataType 为 buffer 时不会对 data 做 JSON.parse', async () => {
    const { request } = await import('../../src/cloud/request');

    const res = await request({
      url: 'https://api.example.com/users',
      dataType: 'buffer',
    });

    // data 保持原始 Buffer，不做 JSON.parse
    expect(res.data).toBeInstanceOf(Buffer);

    // 验证 JSON.parse 不会被执行（给无效 JSON 也不会报错）
    mockRequest.mockImplementationOnce(async () => ({
      data: Buffer.from('{invalid json'),
      status: 200,
      headers: {},
    }));
    await expect(request({ url: 'https://api.example.com/test', dataType: 'buffer' })).resolves.toBeDefined();
  });

  it('应该支持自定义 contentType', async () => {
    const { request } = await import('../../src/cloud/request');

    await request({
      url: 'https://api.example.com/users',
      contentType: 'form',
    });

    const [, calledOptions] = mockRequest.mock.calls[0];
    expect(calledOptions.contentType).toBe('form');
  });

  it('应该支持自定义 timeout', async () => {
    const { request } = await import('../../src/cloud/request');

    await request({
      url: 'https://api.example.com/users',
      timeout: 5000,
    });

    const [, calledOptions] = mockRequest.mock.calls[0];
    expect(calledOptions.timeout).toBe(5000);
  });

  it('应该正确返回类型化的响应数据', async () => {
    const { request } = await import('../../src/cloud/request');

    mockRequest.mockImplementation(async (_url, opts) => ({
      data:
        opts?.dataType === 'text'
          ? JSON.stringify({ id: '1', name: 'Alice' })
          : Buffer.from(JSON.stringify({ id: '1', name: 'Alice' })),
      status: 201,
      headers: { 'x-request-id': 'abc' },
    }));

    const res = await request<{ id: string; name: string }>({
      url: 'https://api.example.com/users',
      method: 'POST',
      data: { name: 'Alice' },
    });

    expect(res.data).toEqual({ id: '1', name: 'Alice' });
    expect(res.status).toBe(201);
    expect(res.headers).toEqual({ 'x-request-id': 'abc' });
  });

  it('应该在请求失败时抛出错误', async () => {
    const { request } = await import('../../src/cloud/request');

    mockRequest.mockRejectedValue(new Error('网络错误'));

    await expect(
      request({
        url: 'https://api.example.com/users',
      }),
    ).rejects.toThrow('网络错误');
  });
});
