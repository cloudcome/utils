import { errorNormalize } from '@cloudcome/utils-core/error';
import { objectDefaults } from '@cloudcome/utils-core/object';
import { isFunction } from '@cloudcome/utils-core/type';
import type { AnyFunction, MaybePromise } from '@cloudcome/utils-core/types';
import type z from 'zod';
import type { ZodObject } from 'zod';
import type { UniCloudObjectOutput } from './client';

/**
 * 客户端信息类型定义
 * 包含了客户端的各种环境和设备信息
 */
export type ClientInfo = {
  /** 场景值 */
  scene: number;
  /** 应用ID */
  appId: string;
  /** 应用语言 */
  appLanguage: string;
  /** 应用名称 */
  appName: string;
  /** 应用版本 */
  appVersion: string;
  /** 应用版本号 */
  appVersionCode: string;
  /** 浏览器名称 */
  browserName: string;
  /** 浏览器版本 */
  browserVersion: string;
  /** 设备ID */
  deviceId: string;
  /** 设备型号 */
  deviceModel: string;
  /** 设备类型 */
  deviceType: 'phone' | 'pad' | 'pc' | 'unknown';
  /** 宿主名称 */
  hostName: string;
  /** 宿主版本 */
  hostVersion: string;
  /** 操作系统名称 */
  osName: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'harmonyos';
  /** 操作系统版本 */
  osVersion: string;
  /** User-Agent字符串 */
  ua: string;
  /** Uni编译器版本 */
  uniCompilerVersion: string;
  /** Uni平台 */
  uniPlatform: string;
  /** Uni运行时版本 */
  uniRuntimeVersion: string;
  /** 语言环境 */
  locale: string;
  /** 密钥类型 */
  secretType: string;
  /** 运行环境 */
  RUNTIME_ENV: 'local' | 'cloud';
  /** 操作系统 */
  os: string;
  /** 客户端IP地址 */
  clientIP: string;
  /** 用户代理字符串 */
  userAgent: string;
  /** 平台信息 */
  platform: string;
  /** 请求来源 */
  source: 'client' | 'function' | 'http' | 'timing' | 'server';
  /** 请求ID */
  requestId: string;
};

/**
 * 云环境信息类型定义
 * 包含了云函数运行环境的相关信息
 */
export type CloudInfo = {
  /** 云服务提供商 */
  provider: 'alipay' | 'aliyun' | 'tencent';
  /** 空间ID */
  spaceId: string;
  /** 是否使用旧版空间ID */
  useOldSpaceId: boolean;
  /** 函数名称 */
  functionName: string;
  /** 函数类型 */
  functionType: string;
  /** 运行环境 */
  runtimeEnv: 'local' | 'cloud';
};

/**
 * HTTP请求信息类型定义
 * 包含了HTTP请求的详细信息
 */
export type HttpInfo = {
  /** 请求路径 */
  path: string;
  /** HTTP方法 */
  httpMethod: string;
  /** 请求头 */
  headers: Record<string, string>;
  /** 查询参数 */
  queryStringParameters: Record<string, string>;
  /** 请求体 */
  body: string;
  /** 是否为Base64编码 */
  isBase64Encoded: boolean;
};

export type UniCloudObjectThis = {
  /**
   * 获取客户端信息
   */
  getClientInfo: () => ClientInfo;

  /**
   * 获取云端信息
   */
  getCloudInfo: () => CloudInfo;

  /**
   * 获取客户端token
   * 仅在客户端已登录的情况下返回token
   */
  getUniIdToken: () => string | undefined;

  /**
   * 获取当前调用的方法名
   */
  getMethodName: () => string;

  /**
   * 获取当前请求id
   */
  getUniCloudRequestId: () => string;

  /**
   * 获取url化时的http信息
   */
  getHttpInfo: () => HttpInfo | undefined;
};

export type UniCloudObjectThisAppend = {
  options: Required<CreateCloudObjectOptions>;
  user: {
    id: string;
    role: string[];
    permission: string[];
    isAdmin: boolean;
  };
};

export type UniCloudObjectContext = UniCloudObjectThis & UniCloudObjectThisAppend;

export type CreateCloudObjectOptions = {
  /**
   * 是否需要用户登录态
   * @default false
   */
  requiredUser?: boolean;
};

/**
 * 处理UniCloud云函数对象的响应
 * 执行传入的函数并标准化返回结果格式，包含请求ID、数据、错误码和错误信息
 * @param context - UniCloud对象上下文，包含请求相关信息
 * @param fn - 需要执行的函数，可以返回任意类型的数据或Promise
 * @returns 返回标准化的响应对象，包含requestId、data、errCode和errMsg字段
 */
export async function respondUniCloudObject<O>(
  context: UniCloudObjectContext,
  fn: () => MaybePromise<O>,
): Promise<UniCloudObjectOutput<O>> {
  const requestId = context.getUniCloudRequestId();
  try {
    const data = await fn();

    return {
      requestId,
      data,
      errCode: 0,
      errMsg: '',
    };
  } catch (err) {
    const err2 = errorNormalize(err as Error & { errCode?: number; errMsg?: string });

    return {
      requestId,
      // @ts-ignore
      data: null,
      errCode: err2.errCode || -1,
      errMsg: err2.errMsg || err2.message || 'unknown error',
    };
  }
}

export type UniCloudObject<I, O> = (this: UniCloudObjectThis, input: I) => Promise<UniCloudObjectOutput<O>>;

/**
 * 创建云函数对象
 * 用于定义和处理云函数的输入验证和执行逻辑
 * @param schema - Zod模式，用于验证输入数据
 * @param fn - 实际处理函数，接收上下文和验证后的输入数据
 * @param options - 创建云对象的选项配置
 * @returns 返回一个可执行的云函数
 */
export function createCloudObject<S extends ZodObject, O>(
  schema: S,
  fn: (context: UniCloudObjectContext, input: z.infer<S>) => MaybePromise<O>,
  options?: CreateCloudObjectOptions,
): UniCloudObject<z.infer<S>, O>;
export function createCloudObject<O>(
  fn: (context: UniCloudObjectContext) => MaybePromise<O>,
  options?: CreateCloudObjectOptions,
): UniCloudObject<never, O>;
export function createCloudObject<O>(fn: (context: UniCloudObjectContext) => MaybePromise<O>): UniCloudObject<never, O>;
export function createCloudObject<S extends ZodObject | never, O>(
  schema: S | ((context: UniCloudObjectContext) => MaybePromise<O>),
  fn?: ((context: UniCloudObjectContext, input: z.infer<S>) => MaybePromise<O>) | CreateCloudObjectOptions,
  options?: CreateCloudObjectOptions,
): UniCloudObject<z.infer<S> | never, O> {
  // 选项来源
  const optionsSource = (isFunction(schema) ? fn : options) as CreateCloudObjectOptions | undefined;
  // 设置默认选项值
  const optionsFinal = objectDefaults(optionsSource || {}, {
    requiredUser: false,
  }) as Required<CreateCloudObjectOptions>;

  return async function (this: UniCloudObjectThis, input: z.infer<S>) {
    // 构建附加的上下文信息
    const append: UniCloudObjectThisAppend = {
      options: optionsFinal,
      user: {
        id: '',
        role: [],
        permission: [],
        isAdmin: false,
      },
    };
    const context = Object.assign(this, append) as UniCloudObjectContext;

    // 处理云函数响应逻辑
    return await respondUniCloudObject(context, async () => {
      // 无入参
      if (isFunction(schema)) {
        // 执行实际的业务逻辑函数
        return await schema(context);
      }

      // 单入参
      // 验证输入数据
      const parsed = schema.safeParse(input);

      if (!parsed.success) {
        console.log(parsed.error.issues);

        const issue0 = parsed.error?.issues?.[0];

        // 处理验证错误
        if (issue0?.code === 'custom') throw issue0.message;
        throw new Error('请求数据不正确');
      }

      // 执行实际的业务逻辑函数
      return await (fn as AnyFunction)(context, parsed.data);
    });
  };
}
