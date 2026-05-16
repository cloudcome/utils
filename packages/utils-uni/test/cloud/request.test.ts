import { describe, expect, it, vi } from 'vitest';
import type { AnyAsyncFunction } from '@cloudcome/utils-core/types';

function createMockUniCloud() {
  const mockRequest = vi.fn<AnyAsyncFunction>().mockResolvedValue({
    data: { name: 'test' },
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

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
    mockRequest.mockResolvedValue({
      data: { name: 'test' },
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
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
    expect(calledOptions.dataType).toBe('json');
    expect(calledOptions.contentType).toBe('json');
    expect(calledOptions.timeout).toBe(10000);
    expect(calledOptions.headers).toEqual({});
  });

  it('应该支持自定义 dataType', async () => {
    const { request } = await import('../../src/cloud/request');

    await request({
      url: 'https://api.example.com/users',
      dataType: 'text',
    });

    const [, calledOptions] = mockRequest.mock.calls[0];
    expect(calledOptions.dataType).toBe('text');
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

    mockRequest.mockResolvedValue({
      data: { id: '1', name: 'Alice' },
      status: 201,
      headers: { 'x-request-id': 'abc' },
    });

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
