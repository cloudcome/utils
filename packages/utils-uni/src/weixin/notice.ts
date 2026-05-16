import { request } from '@/cloud';
import { objectMap } from '@cloudcome/utils-core/object';

export type SendData<T> = {
  /**
   * 用户ID
   */
  userId: string;
  /**
   * 小程序环境
   */
  clientEnv: 'develop' | 'trial' | 'release';
  /**
   * 通知数据
   */
  payload: T;
  /**
   * 跳转页面
   */
  page: string;
};

export type BuildSendWeixinNoticeServiceOptions = {
  /**
   * 模板ID
   */
  templateId: string;

  /**
   * 获取微信 access_token 的服务
   */
  getWeixinAccessTokenService: () => Promise<string>;

  /**
   * 用户表
   */
  getUserWeixinOpenId: (userId: string) => Promise<string>;

  /**
   * 模拟请求，测试时可注入 mock 请求函数
   */
  _mockRequest?: typeof request;
};

export function buildSendWeixinNoticeService<T extends Record<string, number | string>>(
  options: BuildSendWeixinNoticeServiceOptions,
) {
  const { templateId, getWeixinAccessTokenService, getUserWeixinOpenId, _mockRequest } = options;

  return async function sendWeixinNoticeService(sendData: SendData<T>) {
    const { userId, page, payload } = sendData;
    const wxOpenId = await getUserWeixinOpenId(userId);
    if (!wxOpenId) throw new Error('用户未绑定微信');

    const accessToken = await getWeixinAccessTokenService();
    const { data } = await (_mockRequest || request)<{
      errcode: number;
      errmsg: string;
    }>({
      // https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-message-management/subscribe-message/sendMessage.html
      url: `https://api.weixin.qq.com/cgi-bin/message/subscribe/send`,
      method: 'POST',
      query: {
        access_token: accessToken,
      },
      data: {
        touser: wxOpenId,
        template_id: templateId,
        page: page.replace(/^\//, ''),
        // 跳转小程序类型： developer 为开发版； trial 为体验版； formal 为正式版；默认为正式版
        miniprogram_state: sendData.clientEnv === 'trial' ? 'trial' : 'formal',
        lang: 'zh_CN',
        data: objectMap(payload, (val, key) => ({
          value: _fixPayloadValue(key as string, val),
        })),
      },
    });
    // {
    //   "errcode":0,
    //   "errmsg":"ok"
    //   }

    // 用户事后拒绝了接收订阅消息，忽略此错误
    if (data.errcode === 43101) return;

    if (data.errcode !== 0) throw new Error(data.errmsg || '发送失败，未知错误');
  };
}

/**
 * 修复通知数据中的值，根据key自动截断长度
 * - thing.DATA 事物 20个以内字符 可汉字、数字、字母或符号组合
 * - number.DATA 数字 32位以内数字 只能数字，可带小数
 * - letter.DATA 字母 32位以内字母 只能字母
 * - symbol.DATA 符号 5位以内符号 只能符号
 * - character_string.DATA 字符串 32位以内数字、字母或符号 可数字、字母或符号组合
 * - time.DATA 时间 24小时制时间格式（支持+年月日），支持填时间段，两个时间点之间用“~”符号连接 例如：15:01，或：2019年10月1日 15:01
 * - date.DATA 日期 年月日格式（支持+24小时制时间），支持填时间段，两个时间点之间用“~”符号连接 例如：2019年10月1日，或：2019年10月1日 15:01
 * - amount.DATA 金额 1个币种符号+10位以内纯数字，可带小数，结尾可带“元” 可带小数
 * - phone_number.DATA 电话 17位以内，数字、符号 电话号码，例：+86-0766-66888866
 * - car_number.DATA 车牌 8位以内，第一位与最后一位可为汉字，其余为字母或数字 车牌号码：粤A8Z888挂
 * - name.DATA 姓名 10个以内纯汉字或20个以内纯字母或符号 中文名10个汉字内；纯英文名20个字母内；中文和字母混合按中文名算，10个字内
 * - phrase.DATA 汉字 5个以内汉字 5个以内纯汉字，例如：配送中
 * @param key 数据key
 * @param val 数据值
 * @returns 修复后的值
 */

function _fixPayloadValue(key: string, val: number | string) {
  if (key.startsWith('thing')) return _autoEllipsis(val.toString(), 20);
  if (key.startsWith('character_string')) return _autoEllipsis(val.toString(), 32);
  return val;
}

/**
 * 自动添加省略号
 * @param val 字符串
 * @param len 字符串
 * @param len 最大长度
 * @returns 截断或修复后的字符串
 */
function _autoEllipsis(val: string, len: number) {
  return val.length > len ? `${val.slice(0, len - 3)}...` : val;
}
