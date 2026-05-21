import { describe, expect, it, vi } from 'vitest';
import { buildWeixinAccessTokenService } from '../../src/weixin/token';
import type { AnyAsyncFunction } from '@cloudcome/utils-core/types';

describe('buildWeixinAccessTokenService', () => {
  it('应该从临时数据中获取已缓存的 access_token', async () => {
    const queryAccessToken = vi.fn<() => Promise<string>>().mockResolvedValue('cached-token');
    const saveAccessToken = vi
      .fn<(accessToken: string, expiresIn: number) => Promise<void>>()
      .mockResolvedValue(undefined);
    const mockRequest = vi.fn<AnyAsyncFunction>();

    const getAccessToken = await buildWeixinAccessTokenService({
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      queryAccessToken,
      saveAccessToken,
      _mockRequest: mockRequest,
    });

    const token = await getAccessToken();

    expect(token).toBe('cached-token');
    expect(queryAccessToken).toHaveBeenCalledTimes(1);
    expect(mockRequest).not.toHaveBeenCalled();
    expect(saveAccessToken).not.toHaveBeenCalled();
  });

  it('应该在临时数据为空时请求微信 API 获取 access_token', async () => {
    const queryAccessToken = vi.fn<() => Promise<string>>().mockResolvedValue('');
    const saveAccessToken = vi
      .fn<(accessToken: string, expiresIn: number) => Promise<void>>()
      .mockResolvedValue(undefined);
    const mockRequest = vi.fn<AnyAsyncFunction>().mockResolvedValue({
      data: {
        access_token: 'new-token',
        expires_in: 7200,
        errcode: 0,
        errmsg: 'ok',
      },
    });

    const getAccessToken = await buildWeixinAccessTokenService({
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      queryAccessToken,
      saveAccessToken,
      _mockRequest: mockRequest,
    });

    const token = await getAccessToken();

    expect(token).toBe('new-token');
    expect(queryAccessToken).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenCalledWith({
      url: 'https://api.weixin.qq.com/cgi-bin/token',
      method: 'GET',
      query: {
        grant_type: 'client_credential',
        appid: 'test-app-id',
        secret: 'test-app-secret',
      },
    });
    expect(saveAccessToken).toHaveBeenCalledWith('new-token', 7200000);
  });

  it('应该在微信 API 返回错误时抛出异常', async () => {
    const queryAccessToken = vi.fn<() => Promise<string>>().mockResolvedValue('');
    const saveAccessToken = vi
      .fn<(accessToken: string, expiresIn: number) => Promise<void>>()
      .mockResolvedValue(undefined);
    const mockRequest = vi.fn<AnyAsyncFunction>().mockResolvedValue({
      data: {
        access_token: '',
        errcode: 40013,
        errmsg: 'invalid appid',
      },
    });

    const getAccessToken = await buildWeixinAccessTokenService({
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      queryAccessToken,
      saveAccessToken,
      _mockRequest: mockRequest,
    });

    await expect(getAccessToken()).rejects.toThrow('invalid appid');
  });

  it('应该在微信 API 返回无 errmsg 时使用默认错误信息', async () => {
    const queryAccessToken = vi.fn<() => Promise<string>>().mockResolvedValue('');
    const saveAccessToken = vi
      .fn<(accessToken: string, expiresIn: number) => Promise<void>>()
      .mockResolvedValue(undefined);
    const mockRequest = vi.fn<AnyAsyncFunction>().mockResolvedValue({
      data: {
        access_token: '',
        errcode: -1,
      },
    });

    const getAccessToken = await buildWeixinAccessTokenService({
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      queryAccessToken,
      saveAccessToken,
      _mockRequest: mockRequest,
    });

    await expect(getAccessToken()).rejects.toThrow('获取 access_token 失败');
  });

  it('应该在设置临时数据失败时仅打印错误日志并正常返回 token', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const queryAccessToken = vi.fn<() => Promise<string>>().mockResolvedValue('');
    const saveAccessToken = vi
      .fn<(accessToken: string, expiresIn: number) => Promise<void>>()
      .mockRejectedValue(new Error('storage error'));
    const mockRequest = vi.fn<AnyAsyncFunction>().mockResolvedValue({
      data: {
        access_token: 'new-token',
        expires_in: 7200,
        errcode: 0,
        errmsg: 'ok',
      },
    });

    const getAccessToken = await buildWeixinAccessTokenService({
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      queryAccessToken,
      saveAccessToken,
      _mockRequest: mockRequest,
    });

    const token = await getAccessToken();

    expect(token).toBe('new-token');
    expect(consoleErrorSpy).toHaveBeenCalledWith('保存 access_token 失败', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it('应该支持多次调用复用缓存', async () => {
    const queryAccessToken = vi.fn<() => Promise<string>>().mockResolvedValueOnce('').mockResolvedValue('first-token');
    const saveAccessToken = vi
      .fn<(accessToken: string, expiresIn: number) => Promise<void>>()
      .mockResolvedValue(undefined);
    const mockRequest = vi.fn<AnyAsyncFunction>().mockResolvedValue({
      data: {
        access_token: 'first-token',
        expires_in: 7200,
        errcode: 0,
        errmsg: 'ok',
      },
    });

    const getAccessToken = await buildWeixinAccessTokenService({
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      queryAccessToken,
      saveAccessToken,
      _mockRequest: mockRequest,
    });

    const token1 = await getAccessToken();
    expect(token1).toBe('first-token');
    expect(mockRequest).toHaveBeenCalledTimes(1);

    const token2 = await getAccessToken();
    expect(token2).toBe('first-token');
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });
});
