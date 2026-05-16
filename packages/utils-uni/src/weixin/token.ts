import { tryFlatten } from '@cloudcome/utils-core/try';
import { request } from '../cloud';

export type BuildWeixinAccessTokenServiceOptions = {
  /**
   * 应用ID
   */
  appId: string;
  /**
   * 应用密钥
   */
  appSecret: string;
  /**
   * 获取临时数据
   * @returns access_token
   */
  getTempDataService: () => Promise<string>;
  /**
   * 设置临时数据
   * @param accessToken access_token
   * @param expiresIn 过期时间，单位毫秒
   * @returns
   */
  setTempDataService: (accessToken: string, expiresIn: number) => Promise<void>;

  /**
   * 模拟请求，测试时可注入 mock 请求函数
   */
  _mockRequest?: typeof request;
};

export async function buildWeixinAccessTokenService(options: BuildWeixinAccessTokenServiceOptions) {
  const { appId, appSecret, _mockRequest, getTempDataService, setTempDataService } = options;

  return async function getWeixinAccessTokenService() {
    // 从临时数据中获取 access_token，如果存在且未过期则直接返回
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
