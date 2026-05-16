import { describe, expect, it, vi } from 'vitest';
import { buildSendWeixinNoticeService } from '../../src/weixin/notice';
import type { AnyAsyncFunction } from '@cloudcome/utils-core/types';

describe('buildSendWeixinNoticeService', () => {
  const mockGetAccessToken = vi.fn<() => Promise<string>>().mockResolvedValue('test-access-token');
  const mockGetUserOpenId = vi.fn<(userId: string) => Promise<string>>().mockResolvedValue('test-openid');

  it('应该成功发送订阅消息', async () => {
    const mockRequest = vi.fn<AnyAsyncFunction>().mockResolvedValue({
      data: { errcode: 0, errmsg: 'ok' },
    });

    const sendNotice = buildSendWeixinNoticeService({
      templateId: 'tmpl_123',
      getWeixinAccessTokenService: mockGetAccessToken,
      getUserWeixinOpenId: mockGetUserOpenId,
      _mockRequest: mockRequest,
    });

    await sendNotice({
      userId: 'user-1',
      clientEnv: 'release',
      payload: { thing1: '测试通知', number1: 100 },
      page: '/pages/index',
    });

    expect(mockGetUserOpenId).toHaveBeenCalledWith('user-1');
    expect(mockGetAccessToken).toHaveBeenCalled();
    expect(mockRequest).toHaveBeenCalledWith({
      url: 'https://api.weixin.qq.com/cgi-bin/message/subscribe/send',
      method: 'POST',
      query: { access_token: 'test-access-token' },
      data: {
        touser: 'test-openid',
        template_id: 'tmpl_123',
        page: 'pages/index',
        miniprogram_state: 'formal',
        lang: 'zh_CN',
        data: {
          thing1: { value: '测试通知' },
          number1: { value: 100 },
        },
      },
    });
  });

  it('应该移除 page 开头的斜杠', async () => {
    const mockRequest = vi.fn<AnyAsyncFunction>().mockResolvedValue({
      data: { errcode: 0, errmsg: 'ok' },
    });

    const sendNotice = buildSendWeixinNoticeService({
      templateId: 'tmpl_123',
      getWeixinAccessTokenService: mockGetAccessToken,
      getUserWeixinOpenId: mockGetUserOpenId,
      _mockRequest: mockRequest,
    });

    await sendNotice({
      userId: 'user-1',
      clientEnv: 'release',
      payload: {},
      page: '/pages/detail?id=1',
    });

    expect(mockRequest.mock.calls[0][0].data.page).toBe('pages/detail?id=1');
  });

  it('应该根据 clientEnv 设置 miniprogram_state', async () => {
    const mockRequest = vi.fn<AnyAsyncFunction>().mockResolvedValue({
      data: { errcode: 0, errmsg: 'ok' },
    });

    const sendNotice = buildSendWeixinNoticeService({
      templateId: 'tmpl_123',
      getWeixinAccessTokenService: mockGetAccessToken,
      getUserWeixinOpenId: mockGetUserOpenId,
      _mockRequest: mockRequest,
    });

    await sendNotice({
      userId: 'user-1',
      clientEnv: 'develop',
      payload: {},
      page: '/pages/index',
    });

    expect(mockRequest.mock.calls[0][0].data.miniprogram_state).toBe('formal');

    await sendNotice({
      userId: 'user-1',
      clientEnv: 'trial',
      payload: {},
      page: '/pages/index',
    });

    expect(mockRequest.mock.calls[1][0].data.miniprogram_state).toBe('trial');
  });

  it('应该自动截断 thing 类型字段超过20字符', async () => {
    const mockRequest = vi.fn<AnyAsyncFunction>().mockResolvedValue({
      data: { errcode: 0, errmsg: 'ok' },
    });

    const sendNotice = buildSendWeixinNoticeService({
      templateId: 'tmpl_123',
      getWeixinAccessTokenService: mockGetAccessToken,
      getUserWeixinOpenId: mockGetUserOpenId,
      _mockRequest: mockRequest,
    });

    await sendNotice({
      userId: 'user-1',
      clientEnv: 'release',
      payload: { thing1: '这是一个超过二十个字符的长文本通知内容啊啊啊' },
      page: '/pages/index',
    });

    const thingValue = mockRequest.mock.calls[0][0].data.data.thing1.value;
    expect(thingValue).toMatch(/\.{3}$/);
    expect(thingValue.length).toBeLessThanOrEqual(20);
  });

  it('应该自动截断 character_string 类型字段超过32字符', async () => {
    const mockRequest = vi.fn<AnyAsyncFunction>().mockResolvedValue({
      data: { errcode: 0, errmsg: 'ok' },
    });

    const sendNotice = buildSendWeixinNoticeService({
      templateId: 'tmpl_123',
      getWeixinAccessTokenService: mockGetAccessToken,
      getUserWeixinOpenId: mockGetUserOpenId,
      _mockRequest: mockRequest,
    });

    await sendNotice({
      userId: 'user-1',
      clientEnv: 'release',
      payload: { character_string1: 'abcdefghijklmnopqrstuvwxyz1234567890' },
      page: '/pages/index',
    });

    const csValue = mockRequest.mock.calls[0][0].data.data.character_string1.value;
    expect(csValue).toMatch(/\.{3}$/);
    expect(csValue.length).toBeLessThanOrEqual(32);
  });

  it('应该在用户未绑定微信时抛出错误', async () => {
    const mockGetUserOpenIdNoBind = vi.fn<(userId: string) => Promise<string>>().mockResolvedValue('');
    const mockRequest = vi.fn<AnyAsyncFunction>();

    const sendNotice = buildSendWeixinNoticeService({
      templateId: 'tmpl_123',
      getWeixinAccessTokenService: mockGetAccessToken,
      getUserWeixinOpenId: mockGetUserOpenIdNoBind,
      _mockRequest: mockRequest,
    });

    await expect(
      sendNotice({
        userId: 'user-1',
        clientEnv: 'release',
        payload: {},
        page: '/pages/index',
      }),
    ).rejects.toThrow('用户未绑定微信');

    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('应该在微信返回 43101 时静默忽略', async () => {
    const mockRequest = vi.fn<AnyAsyncFunction>().mockResolvedValue({
      data: { errcode: 43101, errmsg: 'user refused' },
    });

    const sendNotice = buildSendWeixinNoticeService({
      templateId: 'tmpl_123',
      getWeixinAccessTokenService: mockGetAccessToken,
      getUserWeixinOpenId: mockGetUserOpenId,
      _mockRequest: mockRequest,
    });

    await sendNotice({
      userId: 'user-1',
      clientEnv: 'release',
      payload: {},
      page: '/pages/index',
    });

    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it('应该在微信返回其他错误时抛出异常', async () => {
    const mockRequest = vi.fn<AnyAsyncFunction>().mockResolvedValue({
      data: { errcode: 40003, errmsg: 'invalid openid' },
    });

    const sendNotice = buildSendWeixinNoticeService({
      templateId: 'tmpl_123',
      getWeixinAccessTokenService: mockGetAccessToken,
      getUserWeixinOpenId: mockGetUserOpenId,
      _mockRequest: mockRequest,
    });

    await expect(
      sendNotice({
        userId: 'user-1',
        clientEnv: 'release',
        payload: {},
        page: '/pages/index',
      }),
    ).rejects.toThrow('invalid openid');
  });

  it('应该在微信返回无 errmsg 时使用默认错误信息', async () => {
    const mockRequest = vi.fn<AnyAsyncFunction>().mockResolvedValue({
      data: { errcode: -1 },
    });

    const sendNotice = buildSendWeixinNoticeService({
      templateId: 'tmpl_123',
      getWeixinAccessTokenService: mockGetAccessToken,
      getUserWeixinOpenId: mockGetUserOpenId,
      _mockRequest: mockRequest,
    });

    await expect(
      sendNotice({
        userId: 'user-1',
        clientEnv: 'release',
        payload: {},
        page: '/pages/index',
      }),
    ).rejects.toThrow('发送失败，未知错误');
  });
});
