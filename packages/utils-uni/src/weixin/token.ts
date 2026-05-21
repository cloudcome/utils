import { tryFlatten } from '@cloudcome/utils-core/try';
import { request } from '../cloud';

/**
 * 构建微信 access_token 获取服务的选项
 */
export type BuildWeixinAccessTokenGetterOptions = {
  /**
   * 微信小程序应用ID
   */
  appId: string;

  /**
   * 微信小程序应用密钥
   */
  appSecret: string;

  /**
   * 查询缓存的 access_token
   * @returns 缓存的 access_token，无缓存时返回空字符串
   */
  queryAccessToken: () => Promise<string>;

  /**
   * 保存 access_token 到缓存
   * @param accessToken access_token 值
   * @param expiresIn 过期时间，单位毫秒
   */
  saveAccessToken: (accessToken: string, expiresIn: number) => Promise<void>;

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
 * const getAccessToken = buildWeixinAccessTokenGetter({
 *   appId: 'wx123',
 *   appSecret: 'secret',
 *   queryAccessToken: () => kv.get('token'),
 *   saveAccessToken: (token, ttl) => kv.set('token', token, ttl),
 * })
 * const token = await getAccessToken()
 * ```
 */
export function buildWeixinAccessTokenGetter(options: BuildWeixinAccessTokenGetterOptions) {
  const { appId, appSecret, _mockRequest, queryAccessToken, saveAccessToken } = options;

  return async function getWeixinAccessToken() {
    let accessToken = await queryAccessToken();
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

    const [err] = await tryFlatten(saveAccessToken(accessToken, accessInfo.expires_in * 1000));
    if (err) console.error('保存 access_token 失败', err);

    return accessToken;
  };
}
