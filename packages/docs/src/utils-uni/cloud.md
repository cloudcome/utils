---
outline: deep
---

# cloud

云函数工具。

## 导入

```typescript
import {
  parseCloudMethodOutput,
  parseCloudModuleOutput,
  respondCloudMethod,
  createCloudObjectError,
  request,
  buildCloudMethodCreator,
} from '@cloudcome/utils-uni/cloud';
import type {
  CloudMethodOutput,
  CloudModuleOutput,
  RequestOptions,
  CloudObjectContext,
  BuildCloudMethodCreatorOptions,
  CreateCloudObjectOptions,
  CreateCloudMethod,
  CloudObjectThis,
  CloudMethod,
  ClientInfo,
  CloudInfo,
  HttpInfo,
  ExtractUniCloudOutput,
  ExtractCloudMethodInput,
  ExtractCloudMethodData,
  UniIdCommonModule,
  UniIdCommonInstance,
  UniIdUser,
  UniError,
} from '@cloudcome/utils-uni/cloud';
```

## 类型定义

### CloudMethodOutput\<O\>

云对象方法输出类型，用于统一云对象方法返回格式。

```typescript
type CloudMethodOutput<O> = {
  errCode?: number | string;
  errMsg?: string;
  data: O;
};
```

### CloudModuleOutput\<O\>

云模块输出类型，用于统一云模块返回格式。

```typescript
type CloudModuleOutput<O> = {
  errCode?: number | string;
  errMsg?: string;
} & O;
```

### CloudObjectThis

云对象上下文基类，包含获取客户端信息、云端信息等方法。

```typescript
interface CloudObjectThis {
  getClientInfo: () => ClientInfo;
  getCloudInfo: () => CloudInfo;
  getUniIdToken: () => string | undefined;
  getMethodName: () => string;
  getUniCloudRequestId: () => string;
  getHttpInfo: () => HttpInfo | undefined;
}
```

**方法说明**

| 方法                     | 返回值                  | 描述                                   |
| ------------------------ | ----------------------- | -------------------------------------- |
| `getClientInfo()`        | `ClientInfo`            | 获取客户端信息（设备、系统、应用等）   |
| `getCloudInfo()`         | `CloudInfo`             | 获取云环境信息                         |
| `getUniIdToken()`        | `string \| undefined`   | 获取客户端 token，仅客户端已登录时返回 |
| `getMethodName()`        | `string`                | 获取当前调用的方法名                   |
| `getUniCloudRequestId()` | `string`                | 获取当前请求 ID                        |
| `getHttpInfo()`          | `HttpInfo \| undefined` | 获取 URL 化时的 HTTP 请求信息          |

### RequestOptions

```typescript
interface RequestOptions {
  url: string;
  query?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS';
  headers?: Record<string, string>;
  data?: AnyObject;
  dataType?: string;
  contentType?: string;
  timeout?: number;
}
```

**属性**

| 属性        | 类型                                                          | 默认值   | 描述                                                                                      |
| ----------- | ------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| url         | `string`                                                      | -        | 请求 URL 地址                                                                             |
| query       | `Record<string, string>`                                      | `{}`     | URL 查询参数，会自动拼接到 url 后面                                                       |
| method      | `'GET' \| 'POST' \| 'PUT' \| 'DELETE' \| 'HEAD' \| 'OPTIONS'` | `'GET'`  | HTTP 请求方法                                                                             |
| headers     | `Record<string, string>`                                      | `{}`     | 请求头                                                                                    |
| data        | `AnyObject`                                                   | -        | 请求体数据                                                                                |
| dataType    | `string`                                                      | `'json'` | 返回数据格式                                                                              |
| contentType | `string`                                                      | `'json'` | 请求内容类型，`'json'` 为 application/json，`'form'` 为 application/x-www-form-urlencoded |
| timeout     | `number`                                                      | `10000`  | 请求超时时间，单位毫秒                                                                    |

### CloudObjectContext\<ExtraConfig\>

云对象方法执行上下文，继承 `CloudObjectThis` 的所有方法，并附加用户身份信息、权限和配置选项。

```typescript
interface CloudObjectContext<ExtraConfig extends AnyObject = {}> extends CloudObjectThis {
  /** 云对象创建选项 */
  options: Required<CreateCloudObjectOptions<ExtraConfig>>;
  /** 用户身份信息 */
  user: {
    /** 用户 ID */
    id: string;
    /** 用户角色列表 */
    role: string[];
    /** 用户权限列表 */
    permission: string[];
    /** 是否为管理员 */
    isAdmin: boolean;
  };
}
```

泛型参数 `ExtraConfig` 用于扩展配置选项，见 `CreateCloudObjectOptions`。

### BuildCloudMethodCreatorOptions\<ExtraConfig\>

构建云对象方法创建器的配置选项。

```typescript
interface BuildCloudMethodCreatorOptions<ExtraConfig extends AnyObject = {}> {
  /** UniId 通用模块，用于处理用户身份验证和权限管理 */
  uniIdCommonModule?: UniIdCommonModule;
  /** 需要用户登录态的错误码，默认 'uni-id-check-token-failed' */
  requiredUserErrCode?: number | string;
  /** 需要用户登录态的错误消息，默认 '需要登录后才能进行此操作' */
  requiredUserErrMsg?: string;
  /** 仅允许本地环境运行的错误消息，默认 '运行环境不匹配' */
  onlyLocalEnvErrMsg?: string;
  /** 版本不匹配错误消息，默认 '应用版本过低' */
  appVersionTooLowErrMsg?: string;
  /** 应用版本过高错误消息，默认 '应用版本过高' */
  appVersionTooHighErrMsg?: string;
  /** 响应附加数据函数，用于在云对象响应中添加额外的上下文信息 */
  respondAppend?: (objectThis: CloudObjectThis) => AnyObject;
  /** 自定义错误处理函数，用于在云对象响应中处理错误信息，如脱敏、转换错误码等 */
  parseError?: (err: unknown) => UniError;
  /** 所有云对象执行前钩子函数 */
  onBefore?: (
    context: CloudObjectContext<ExtraConfig>,
    options: Required<CreateCloudObjectOptions<ExtraConfig>>,
  ) => MaybePromise<unknown>;
}
```

`onBefore` 钩子接收两个参数：`context` 为云对象上下文，`options` 为当前方法的创建选项（含自定义扩展配置）。

### ClientInfo

客户端信息类型定义，包含客户端的各种环境和设备信息。

```typescript
interface ClientInfo {
  scene: number;
  appId: string;
  appLanguage: string;
  appName: string;
  appVersion: string;
  appVersionCode: string;
  browserName: string;
  browserVersion: string;
  deviceId: string;
  deviceModel: string;
  deviceType: 'phone' | 'pad' | 'pc' | 'unknown';
  hostName: string;
  hostVersion: string;
  osName: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'harmonyos';
  osVersion: string;
  ua: string;
  uniCompilerVersion: string;
  uniPlatform: string;
  uniRuntimeVersion: string;
  locale: string;
  secretType: string;
  RUNTIME_ENV: 'local' | 'cloud';
  os: string;
  clientIP: string;
  userAgent: string;
  platform: string;
  source: 'client' | 'function' | 'http' | 'timing' | 'server';
  requestId: string;
}
```

### CloudInfo

云环境信息类型定义，包含云对象运行环境的相关信息。

```typescript
interface CloudInfo {
  provider: 'alipay' | 'aliyun' | 'tencent';
  spaceId: string;
  useOldSpaceId: boolean;
  functionName: string;
  functionType: string;
  runtimeEnv: 'local' | 'cloud';
}
```

### HttpInfo

HTTP 请求信息类型定义，包含 HTTP 请求的详细信息。

```typescript
interface HttpInfo {
  path: string;
  httpMethod: string;
  headers: Record<string, string>;
  queryStringParameters: Record<string, string>;
  body: string;
  isBase64Encoded: boolean;
}
```

### CloudObjectThis

云对象上下文基类，包含获取客户端信息、云端信息等方法。

```typescript
interface CloudObjectThis {
  getClientInfo: () => ClientInfo;
  getCloudInfo: () => CloudInfo;
  getUniIdToken: () => string | undefined;
  getMethodName: () => string;
  getUniCloudRequestId: () => string;
  getHttpInfo: () => HttpInfo | undefined;
}
```

### CloudMethod

云对象方法类型定义，定义云对象方法的函数签名。

```typescript
type CloudMethod<I, O> = (input: I) => Promise<CloudMethodOutput<O>>;
```

### ExtractUniCloudOutput

从 `CloudMethodOutput<T>` 中提取 `T` 类型的工具类型。

```typescript
type ExtractUniCloudOutput<T> = T extends CloudMethodOutput<infer U> ? Awaited<U> : never;
```

### ExtractCloudMethodInput

从 `CloudMethod<I, O>` 中提取输入参数类型 `I`。

```typescript
type ExtractCloudMethodInput<T> = T extends CloudMethod<infer I, unknown> ? I : never;
```

### ExtractCloudMethodData

从 `CloudMethod<I, O>` 中提取输出数据类型 `O`。

```typescript
type ExtractCloudMethodData<T> = T extends CloudMethod<unknown, infer O> ? O : never;
```

### UniIdCommonModule

uni-id-common 模块类型。

```typescript
interface UniIdCommonModule {
  createInstance: (options: { clientInfo: ClientInfo }) => UniIdCommonInstance;
}
```

### UniIdCommonInstance

uni-id-common 实例类型。

```typescript
interface UniIdCommonInstance {
  checkToken: (token: string) => Promise<UniIdUser | undefined>;
}
```

### UniIdUser

uni-id 用户信息类型。

```typescript
type UniIdUser = CloudModuleOutput<{
  uid?: string;
  role?: string[];
  permission?: string[];
}>;
```

### UniError

统一错误类型，继承自 `Error` 并附加 `errCode` 和 `errMsg` 字段。

```typescript
type UniError = Error & {
  errCode?: number | string;
  errMsg?: string;
};
```

**说明**

在 `@cloudcome/utils-uni` 中，所有错误对象都使用此类型。可以通过 `errCode` 判断错误类型，通过 `errMsg` 或 `message` 获取错误信息。

### CreateCloudMethod\<ExtraConfig\>

云对象方法创建器类型定义，用于定义云对象方法的创建函数类型，支持两种重载形式：带输入验证的版本和无输入参数的版本。

```typescript
type CreateCloudMethod<ExtraConfig extends Record<string, unknown> = Record<string, never>> = {
  <S extends ZodObject, O>(
    schema: S,
    fn: (context: CloudObjectContext<ExtraConfig>, input: z.infer<S>) => MaybePromise<O>,
    options?: CreateCloudObjectOptions<ExtraConfig>,
  ): CloudMethod<z.infer<S>, O>;

  <O>(
    fn: (context: CloudObjectContext<ExtraConfig>) => MaybePromise<O>,
    options?: CreateCloudObjectOptions<ExtraConfig>,
  ): CloudMethod<void, O>;
};
```

### CreateCloudObjectOptions\<ExtraConfig\>

云对象方法创建选项。

```typescript
interface CreateCloudObjectOptions<
  ExtraConfig extends Record<string, unknown> = Record<string, never>,
> extends ExtraConfig {
  /** 是否需要用户登录态，默认 false */
  requiredUser?: boolean;
  /** 是否仅在本地环境运行，默认 false */
  onlyLocalEnv?: boolean;
  /** 最小支持版本 */
  minVersion?: string;
  /** 最大支持版本 */
  maxVersion?: string;
  /** 非响应模式，常用于 _before/_after 等钩子函数中 */
  noRespond?: boolean;
}
```

泛型参数 `ExtraConfig` 允许扩展自定义配置字段。这些字段可在 `onBefore` 钩子中通过 `options` 参数访问。

```typescript
// 定义扩展配置
interface MyConfig {
  audit?: boolean;
  tenantId?: string;
}

const createMethod = buildCloudMethodCreator<MyConfig>({
  onBefore: (context, options) => {
    // options.tenantId 和 options.audit 可访问
    if (options.audit) {
      console.log('审计模式:', context.user.id, options.tenantId);
    }
  },
});

// 创建方法时传入扩展配置
export const myMethod = createMethod(
  async (context) => {
    return { ok: true };
  },
  { requiredUser: true, audit: true, tenantId: 'abc' },
);
```

## 函数

### parseCloudMethodOutput

解析云方法输出，自动处理错误。

```typescript
function parseCloudMethodOutput<O>(output: CloudMethodOutput<O>, fallbackErrorMessage?: string): O;
```

**参数**

| 参数                 | 类型                   | 默认值 | 描述               |
| -------------------- | ---------------------- | ------ | ------------------ |
| output               | `CloudMethodOutput<O>` | -      | 云方法输出         |
| fallbackErrorMessage | `string`               | `''`   | 可选，错误回退消息 |

**返回值**

`O` - 解析后的数据

**示例**

```typescript
const output = {
  errCode: 0,
  data: { name: 'Alice' },
};

const data = parseCloudMethodOutput(output);
console.log(data); // { name: 'Alice' }

// 错误处理
const errorOutput = {
  errCode: 1001,
  errMsg: '用户不存在',
};

try {
  parseCloudMethodOutput(errorOutput);
} catch (error) {
  console.error(error.message); // '用户不存在'
}
```

### parseCloudModuleOutput

解析云模块输出，自动处理错误。

```typescript
function parseCloudModuleOutput<O>(
  output: CloudModuleOutput<O>,
  fallbackErrorMessage?: string,
): Omit<O, 'errCode' | 'errMsg'>;
```

**参数**

| 参数                 | 类型                   | 默认值 | 描述               |
| -------------------- | ---------------------- | ------ | ------------------ |
| output               | `CloudModuleOutput<O>` | -      | 云模块输出         |
| fallbackErrorMessage | `string`               | `''`   | 可选，错误回退消息 |

**返回值**

`Omit<O, 'errCode' | 'errMsg'>` - 解析后的数据

**示例**

```typescript
// 成功：去除 errCode/errMsg，返回剩余字段
const result = parseCloudModuleOutput({
  value: 'success',
  errCode: 0,
  errMsg: '',
});
console.log(result); // { value: 'success' }

// 错误：存在 errCode 时抛出异常
try {
  parseCloudModuleOutput({ errCode: 404, errMsg: 'Not Found' });
} catch (error) {
  console.error(error.message); // 'Not Found'
  console.error(error.errCode); // 404
}

// 使用备用错误消息
try {
  parseCloudModuleOutput({ errCode: 500, data: 'some data' }, '默认错误');
} catch (error) {
  console.error(error.message); // '默认错误'
}
```

### respondCloudMethod

响应云方法调用。

```typescript
function respondCloudMethod<O>(
  fn: () => MaybePromise<O>,
  options?: RespondCloudMethodOptions,
): Promise<CloudMethodOutput<O>>;
```

**参数**

| 参数    | 类型                        | 描述           |
| ------- | --------------------------- | -------------- |
| fn      | `() => MaybePromise<O>`     | 云方法实现函数 |
| options | `RespondCloudMethodOptions` | 可选配置       |

#### RespondCloudMethodOptions

```typescript
type RespondCloudMethodOptions = {
  /** 要附加到响应中的额外数据 */
  append?: AnyObject;
  /**
   * 自定义错误处理函数
   * @param err - 错误对象
   * @returns 处理后的错误对象
   */
  parseError?: (err: unknown) => UniError;
};
```

**返回值**

`Promise<CloudMethodOutput<O>>` - 云方法输出

**示例**

```typescript
// 云方法实现
export async function getUser(id: string) {
  return respondCloudMethod(async () => {
    const user = await db.collection('users').doc(id).get();
    return user.data;
  });
}

// 带附加属性
export async function getUserWithMeta(id: string) {
  return respondCloudMethod(
    async () => {
      const user = await db.collection('users').doc(id).get();
      return user.data;
    },
    { append: { timestamp: Date.now() } },
  );
}

// 自动处理错误：抛出错误会被转换为标准响应格式
export async function riskyOperation() {
  return respondCloudMethod(async () => {
    const result = await doSomething();
    if (!result) throw new Error('操作失败');
    return result;
  });
}
// 成功: { errCode: 0, errMsg: '', data: result }
// 失败: { errCode: -1, errMsg: '操作失败', data: null }

// 带自定义错误码
export async function authenticatedAction() {
  return respondCloudMethod(async () => {
    const err = Object.assign(new Error('权限不足'), { errCode: 403 });
    throw err;
  });
}
// 失败: { errCode: 403, errMsg: '权限不足', data: null }

// 自定义错误处理
export async function safeOperation() {
  return respondCloudMethod(
    async () => {
      const result = await doSomething();
      if (!result) throw new Error('操作失败');
      return result;
    },
    {
      append: { requestId: 'xxx' },
      parseError(err) {
        // 脱敏：不暴露内部错误详情
        return Object.assign(err, { errMsg: '系统繁忙，请稍后重试' });
      },
    },
  );
}
```

### createCloudObjectError

创建云对象错误。

```typescript
function createCloudObjectError(
  message: string,
  code?: number | string,
): Error & { errCode?: number | string; errMsg?: string };
```

**参数**

| 参数    | 类型               | 描述           |
| ------- | ------------------ | -------------- |
| message | `string`           | 错误消息       |
| code    | `number \| string` | 可选，错误代码 |

**返回值**

`Error & { errCode?: number | string; errMsg?: string }` - 错误对象

**示例**

```typescript
// 创建带数字错误码的错误
throw createCloudObjectError('用户不存在', 1001);
// Error { message: '用户不存在', errCode: 1001, errMsg: '用户不存在' }

// 创建带字符串错误码的错误
throw createCloudObjectError('权限不足', 'PERMISSION_DENIED');
// Error { message: '权限不足', errCode: 'PERMISSION_DENIED', errMsg: '权限不足' }

// 仅使用错误消息
throw createCloudObjectError('操作失败');
// Error { message: '操作失败', errCode: undefined, errMsg: '操作失败' }
```

### request

发起 HTTP 请求。基于 `uniCloud.httpclient` 发起请求，支持 GET、POST、PUT、DELETE 等方法。查询参数会自动拼接到 URL 上。

```typescript
function request<T>(options: RequestOptions): Promise<{
  data: T;
  status: number;
  headers: Record<string, string>;
}>;
```

**参数**

| 参数    | 类型             | 描述         |
| ------- | ---------------- | ------------ |
| options | `RequestOptions` | 请求配置选项 |

**返回值**

`Promise<{ data: T; status: number; headers: Record<string, string> }>` - 响应对象

**示例**

```typescript
// GET 请求
const res = await request<{ name: string }>({
  url: 'https://api.example.com/users/1',
});
console.log(res.data); // { name: 'Alice' }
console.log(res.status); // 200

// POST 请求
const res = await request<{ id: string }>({
  url: 'https://api.example.com/users',
  method: 'POST',
  data: { name: 'Alice', age: 25 },
});

// 带查询参数
const res = await request<{ list: any[] }>({
  url: 'https://api.example.com/users',
  query: { page: '1', size: '10' },
});

// 自定义超时和请求头
const res = await request({
  url: 'https://api.example.com/slow-api',
  timeout: 30000,
  headers: { Authorization: 'Bearer token123' },
});
```

### buildCloudMethodCreator

构建云对象方法创建器。用于创建云对象方法的工厂函数，支持输入验证、用户身份验证、环境检查等功能。

```typescript
function buildCloudMethodCreator<ExtraConfig extends Record<string, unknown> = Record<string, never>>(
  options?: BuildCloudMethodCreatorOptions<ExtraConfig>,
): CreateCloudMethod<ExtraConfig>;
```

**参数**

| 参数    | 类型                                          | 描述           |
| ------- | --------------------------------------------- | -------------- |
| options | `BuildCloudMethodCreatorOptions<ExtraConfig>` | 可选，构建选项 |

**返回值**

`CreateCloudMethod<ExtraConfig>` - 云对象方法创建器

**示例**

```typescript
// 创建云对象方法创建器
const createMethod = buildCloudMethodCreator({
  uniIdCommonModule,
  onBefore: (context) => {
    console.log('执行前:', context.user.id);
  },
});

// 创建无需登录的云方法
export const hello = createMethod(async (context) => {
  return { message: 'Hello World' };
});

// 创建需要登录且带输入验证的云方法
const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

export const createUser = createMethod(
  userSchema,
  async (context, { name, age }) => {
    return { id: 'user_123', name, age };
  },
  { requiredUser: true },
);

// 使用 respondAppend 在响应中添加额外数据
const createMethodWithMeta = buildCloudMethodCreator({
  respondAppend: (objectThis) => ({
    requestId: objectThis.getUniCloudRequestId(),
    timestamp: Date.now(),
  }),
});

// 使用 onlyLocalEnv 限制仅在本地环境运行
export const debugMethod = createMethod(
  async (context) => {
    return { debug: true };
  },
  { onlyLocalEnv: true },
);

// 使用版本限制
export const versionedMethod = createMethod(
  async (context) => {
    return { ok: true };
  },
  { minVersion: '1.2.0', maxVersion: '2.0.0' },
);

// 使用 noRespond 模式（不返回响应格式，直接返回原始值）
export const _before = createMethod(
  async (context) => {
    console.log('钩子执行');
  },
  { noRespond: true },
);

// 自定义验证错误消息
const schema = z.object({
  email: z
    .string()
    .email()
    .refine((v) => v.endsWith('@example.com'), { message: '邮箱必须是 @example.com 域名' }),
});

export const registerUser = createMethod(schema, async (context, { email }) => {
  return { success: true };
});

// 使用 ExtraConfig 扩展自定义配置
interface MyConfig {
  audit?: boolean;
  tenantId?: string;
}

const createMethodWithExtra = buildCloudMethodCreator<MyConfig>({
  onBefore: (context, options) => {
    // options 包含自定义扩展字段
    if (options.audit) {
      console.log('审计:', context.user.id, options.tenantId);
    }
  },
});

export const auditedMethod = createMethodWithExtra(
  async (context) => {
    return { ok: true };
  },
  { requiredUser: true, audit: true, tenantId: 'tenant-123' },
);
```
