import { tryFlatten } from '@cloudcome/utils-core/try';
import { request } from '../cloud';

/**
 * 构建微信 access_token 获取服务的选项
 */
export type BuildWeixinAccessTokenServiceOptions = {
  /**
   * 微信小程序应用ID
   */
  appId: string;

  /**
   * 微信小程序应用密钥
   */
  appSecret: string;

  /**
   * 获取临时数据（用于缓存 access_token）
   * @returns 缓存的 access_token，无缓存时返回空字符串
   */
  getTempDataService: () => Promise<string>;

  /**
   * 设置临时数据（用于缓存 access_token）
   * @param accessToken access_token 值
   * @param expiresIn 过期时间，单位毫秒
   */
  setTempDataService: (accessToken: string, expiresIn: number) => Promise<void>;

  /**
   * 模拟请求函数，用于单元测试注入
   */
  _mockRequest?: typeof request;
};

/**
 * 构建微信 access_token 获取服务。
 *
 * 自动处理缓存逻辑：优先从临时数据中获取，不存在时调用微信 API 获取并缓存。
 *
 * @param options - 构造选项
 * @returns 获取 access_token 的异步函数
 *
 * @example
 * ```ts
 * const getAccessToken = await buildWeixinAccessTokenService({
 *   appId: 'wx123',
 *   appSecret: 'secret',
 *   getTempDataService: () => kv.get('token'),
 *   setTempDataService: (token, ttl) => kv.set('token', token, ttl),
 * })
 * const token = await getAccessToken()
 * ```
 */
export async function buildWeixinAccessTokenService(options: BuildWeixinAccessTokenServiceOptions) {
  const { appId, appSecret, _mockRequest, getTempDataService, setTempDataService } = options;

  return async function getWeixinAccessTokenService() {
    let accessToken = await getTempDataService();
    if (accessToken) return accessToken;

    const { data: accessInfo } = await (_mockRequest || request)<{
      access_token: string;
      expires_in: number;
      errmsg: string;
      errcode: number;
    }>({
      url: 'https://api.weixin.qq.com/cgi-bin/token',
      method: 'GET',
      query: {
        grant_type: 'client_credential',
        appid: appId,
        secret: appSecret,
      },
    });

    if (!accessInfo.access_token) throw new Error(accessInfo.errmsg || '获取 access_token 失败');
    accessToken = accessInfo.access_token;

    const [err] = await tryFlatten(setTempDataService(accessToken, accessInfo.expires_in * 1000));
    if (err) console.error('设置临时数据失败', err);

    return accessToken;
  };
}
