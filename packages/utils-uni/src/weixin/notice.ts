import { request } from '@/cloud';
import { objectMap } from '@cloudcome/utils-core/object';

/**
 * 发送微信订阅消息的数据结构
 * @template T - payload 字段类型，key 为模板字段名，value 为 string | number
 */
export type SendData<T> = {
  /**
   * 用户ID，用于查找对应的微信 openId
   */
  userId: string;

  /**
   * 小程序跳转环境
   * - `trial`: 体验版
   * - `formal`: 正式版
   */
  miniprogramState: 'trial' | 'formal';

  /**
   * 通知数据，key 对应模板字段（如 thing1, number1）
   */
  payload: T;

  /**
   * 点击消息后跳转的页面路径，开头 `/` 会被自动移除
   */
  page: string;
};

/**
 * 构建微信订阅消息发送服务的选项
 */
export type BuildWeixinNoticeSenderOptions = {
  /**
   * 订阅消息模板ID
   */
  templateId: string;

  /**
   * 获取微信 access_token 的服务函数
   */
  getWeixinAccessToken: () => Promise<string>;

  /**
   * 根据用户ID获取微信 openId
   * @param userId - 用户ID
   * @returns 微信 openId，未绑定时返回空字符串
   */
  getUserWeixinOpenId: (userId: string) => Promise<string>;

  /**
   * 模拟请求函数，用于单元测试注入
   */
  _mockRequest?: typeof request;
};

/**
 * 构建微信订阅消息发送服务。
 *
 * 封装微信订阅消息发送逻辑，自动处理 access_token 获取、openId 查找、
 * 字段长度截断（thing 类型 20 字符，character_string 类型 32 字符）等。
 *
 * @template T - payload 字段类型
 * @param options - 构造选项
 * @returns 发送订阅消息的函数
 *
 * @example
 * ```ts
 * const sendNotice = buildWeixinNoticeSender({
 *   templateId: 'tmpl_abc123',
 *   getWeixinAccessToken: getAccessToken,
 *   getUserWeixinOpenId: async (userId) => {
 *     const user = await db.collection('users').doc(userId).get()
 *     return user.data?.openId
 *   },
 * })
 *
 * await sendNotice({
 *   userId: 'user-123',
 *   miniprogramState: 'formal',
 *   payload: { thing1: '订单已发货', number1: 12345 },
 *   page: '/pages/order/detail?id=12345',
 * })
 * ```
 */
export function buildWeixinNoticeSender<T extends Record<string, number | string>>(
  options: BuildWeixinNoticeSenderOptions,
) {
  const { templateId, getWeixinAccessToken, getUserWeixinOpenId, _mockRequest } = options;

  return async function sendWeixinNotice(sendData: SendData<T>) {
    const { userId, page, payload, miniprogramState } = sendData;
    const wxOpenId = await getUserWeixinOpenId(userId);
    if (!wxOpenId) throw new Error('用户未绑定微信');

    const accessToken = await getWeixinAccessToken();
    const { data } = await (_mockRequest || request)<{
      errcode: number;
      errmsg: string;
    }>({
      url: `https://api.weixin.qq.com/cgi-bin/message/subscribe/send`,
      method: 'POST',
      query: {
        access_token: accessToken,
      },
      data: {
        touser: wxOpenId,
        template_id: templateId,
        page: page.replace(/^\//, ''),
        miniprogram_state: miniprogramState,
        lang: 'zh_CN',
        data: objectMap(payload, (val, key) => ({
          value: _fixPayloadValue(key as string, val),
        })),
      },
    });

    if (data.errcode === 43101) return;

    if (data.errcode !== 0) throw new Error(data.errmsg || '发送失败，未知错误');
  };
}

/**
 * 修复通知 payload 字段值，根据微信模板字段类型自动截断。
 *
 * 截断规则：
 * - thing 类型：20 字符以内
 * - character_string 类型：32 字符以内
 * - 其他类型：不处理
 *
 * @param key - 模板字段 key（如 thing1, number1）
 * @param val - 字段值
 * @returns 修复后的值
 */
function _fixPayloadValue(key: string, val: number | string) {
  if (key.startsWith('thing')) return _autoEllipsis(val.toString(), 20);
  if (key.startsWith('character_string')) return _autoEllipsis(val.toString(), 32);
  return val;
}

/**
 * 字符串超长时自动截断并添加省略号。
 *
 * @param val - 原始字符串
 * @param len - 最大长度
 * @returns 截断后的字符串
 */
function _autoEllipsis(val: string, len: number) {
  return val.length > len ? `${val.slice(0, len - 3)}...` : val;
}
