import type { UniErrorData } from '@/_types';

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
 * 包含了云对象运行环境的相关信息
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

export type CloudObjectThis = {
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

/**
 * 云对象方法输出类型定义
 * 用于统一云对象方法返回格式
 * @template T 返回数据的类型
 */
export type CloudMethodOutput<T> = UniErrorData & {
  /** 返回数据 */
  data: T;
};

/**
 * 提取云对象输出类型中的数据类型
 * 用于从 UniCloudObjectOutput<T> 中提取 T 类型
 */
export type ExtractUniCloudOutput<T> = T extends CloudMethodOutput<infer U> ? Awaited<U> : never;

/**
 * 云模块输出类型定义
 * 用于统一云模块返回格式
 */
export type CloudModuleOutput<T> = UniErrorData & T;

/**
 * 云对象方法类型定义
 * 定义了云对象方法的函数签名
 * @template I 输入参数类型
 * @template O 输出数据类型
 * @param this 云对象上下文
 * @param input 输入参数
 * @returns 返回包含输出数据的Promise
 */
export type CloudMethod<I, O> = (
  /** 云对象上下文 */
  this: CloudObjectThis,
  /** 输入参数 */
  input: I,
) => Promise<CloudMethodOutput<O>>;

/**
 * 提取云对象方法输入参数类型
 * 用于从 UniCloudExpose<I, O> 中提取输入参数类型 I
 */
export type ExtractCloudMethodInput<T> = T extends CloudMethod<infer I, infer O> ? I : never;

/**
 * 提取云对象方法输出数据类型
 * 用于从 UniCloudExpose<I, O> 中提取输出数据类型 O
 */
export type ExtractCloudMethodData<T> = T extends CloudMethod<infer I, infer O> ? O : never;

/**
 * 提取云对象方法签名类型
 * 用于从 UniCloudExpose<I, O> 中提取函数签名 (input: I) => O
 */
export type ExtractCloudMethodFunction<T> = T extends CloudMethod<infer I, infer O> ? (input: I) => O : never;
