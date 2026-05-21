---
outline: deep
---

# weixin

微信相关工具。用于云函数环境中获取微信 access_token 和发送订阅消息。

## 导入

```typescript
import { buildWeixinAccessTokenGetter, buildWeixinNoticeSender } from '@cloudcome/utils-uni/weixin';
import type {
  BuildWeixinAccessTokenGetterOptions,
  BuildWeixinNoticeSenderOptions,
  SendData,
} from '@cloudcome/utils-uni/weixin';
```

## 类型定义

### BuildWeixinAccessTokenGetterOptions

`buildWeixinAccessTokenGetter` 的构造选项。

```typescript
interface BuildWeixinAccessTokenGetterOptions {
  /** 应用ID */
  appId: string;
  /** 应用密钥 */
  appSecret: string;
  /** 查询缓存的 access_token */
  queryAccessToken: () => Promise<string>;
  /** 保存 access_token 到缓存 */
  saveAccessToken: (accessToken: string, expiresIn: number) => Promise<void>;
  /** 模拟请求，测试时可注入 mock 请求函数 */
  _mockRequest?: typeof request;
}
```

### BuildWeixinNoticeSenderOptions

`buildWeixinNoticeSender` 的构造选项。

```typescript
interface BuildWeixinNoticeSenderOptions {
  /** 订阅消息模板ID */
  templateId: string;
  /** 获取微信 access_token 的服务 */
  getWeixinAccessToken: () => Promise<string>;
  /** 根据用户ID获取微信 openId */
  getUserWeixinOpenId: (userId: string) => Promise<string>;
  /** 模拟请求，测试时可注入 mock 请求函数 */
  _mockRequest?: typeof request;
}
```

### SendData\<T\>

发送订阅消息的数据结构。

```typescript
interface SendData<T> {
  /** 用户ID */
  userId: string;
  /** 小程序跳转环境：trial=体验版, formal=正式版 */
  miniprogramState: 'trial' | 'formal';
  /** 通知数据，key 为模板字段名（如 thing1, number1） */
  payload: T;
  /** 点击消息后跳转的页面路径 */
  page: string;
}
```

## 函数

### buildWeixinAccessTokenGetter

构建微信 access_token 获取服务。自动处理缓存逻辑：优先从临时数据中获取，不存在或过期时自动请求微信 API 获取并缓存。

```typescript
function buildWeixinAccessTokenGetter(options: BuildWeixinAccessTokenGetterOptions): () => Promise<string>;
```

**参数**

| 参数    | 类型                                  | 描述     |
| ------- | ------------------------------------- | -------- |
| options | `BuildWeixinAccessTokenGetterOptions` | 构造选项 |

**返回值**

`Promise<() => Promise<string>>` - 获取 access_token 的函数

**示例**

```typescript
// 使用 KV 存储作为临时数据源
const getAccessToken = buildWeixinAccessTokenGetter({
  appId: 'wx1234567890',
  appSecret: 'your-app-secret',
  queryAccessToken: async () => {
    const cached = await kv.get('wx_access_token');
    if (cached && cached.expiresAt > Date.now()) {
      return cached.token;
    }
    return '';
  },
  saveAccessToken: async (token, expiresIn) => {
    await kv.set('wx_access_token', {
      token,
      expiresAt: Date.now() + expiresIn,
    });
  },
});

// 使用
const token = await getAccessToken();
```

::: warning 注意

- access_token 有效期为 7200 秒，建议缓存时长略小于此值
- `saveAccessToken` 失败时仅打印日志，不影响 token 返回
- 请勿频繁调用，微信 API 有调用频率限制

:::

### buildWeixinNoticeSender

构建微信订阅消息发送服务。

```typescript
function buildWeixinNoticeSender<T extends Record<string, number | string>>(
  options: BuildWeixinNoticeSenderOptions,
): (sendData: SendData<T>) => Promise<void>;
```

**参数**

| 参数    | 类型                             | 描述     |
| ------- | -------------------------------- | -------- |
| options | `BuildWeixinNoticeSenderOptions` | 构造选项 |

**返回值**

`(sendData: SendData<T>) => Promise<void>` - 发送订阅消息的函数

**示例**

```typescript
const sendNotice = buildWeixinNoticeSender({
  templateId: 'tmpl_abc123',
  getWeixinAccessToken: getAccessToken, // 来自 buildWeixinAccessTokenGetter
  getUserWeixinOpenId: async (userId) => {
    const user = await db.collection('users').doc(userId).get();
    return user.data?.openId;
  },
});

await sendNotice({
  userId: 'user-123',
  miniprogramState: 'formal',
  payload: {
    thing1: '订单已发货',
    number1: 12345,
    time1: '2024-01-01 15:00',
  },
  page: '/pages/order/detail?id=12345',
});
```

::: warning 注意

- `page` 路径开头的 `/` 会被自动移除
- `miniprogramState` 为 `trial` 时跳转体验版，`formal` 时跳转正式版
- 用户拒绝接收时（errcode 43101）会静默忽略
- `thing` 类型字段超过 20 字符会自动截断并添加 `...`
- `character_string` 类型字段超过 32 字符会自动截断并添加 `...`

:::

#### payload 字段类型说明

微信订阅消息模板字段有类型限制，常用类型如下：

| 类型             | 限制                | 说明                           |
| ---------------- | ------------------- | ------------------------------ |
| thing.DATA       | 20 字符以内         | 事物，可汉字、数字、字母或符号 |
| number.DATA      | 32 位以内数字       | 只能数字，可带小数             |
| letter.DATA      | 32 位以内字母       | 只能字母                       |
| symbol.DATA      | 5 位以内符号        | 只能符号                       |
| character_string | 32 位以内           | 数字、字母或符号组合           |
| time.DATA        | 24 小时制时间格式   | 支持年月日+时间                |
| date.DATA        | 年月日格式          | 支持时间段，用 `~` 连接        |
| amount.DATA      | 1 个币种符号+10 位  | 可带小数，结尾可带"元"         |
| phone_number     | 17 位以内           | 电话号码                       |
| car_number       | 8 位以内            | 车牌号码                       |
| name.DATA        | 10 个汉字或 20 字母 | 姓名                           |
| phrase.DATA      | 5 个以内汉字        | 例如：配送中                   |

其中 `thing` 和 `character_string` 类型会自动截断超长内容。
