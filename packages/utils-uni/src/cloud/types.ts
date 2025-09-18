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

export type UniCloudObjectOutput<T> = {
  errCode?: number | string;
  errMsg?: string;
  data: T;
};

export type UniCloudModuleOutput<T> = {
  errCode?: number | string;
  errMsg?: string;
} & T;

export type UniCloudObject<I, O> = (this: UniCloudObjectThis, input: I) => Promise<UniCloudObjectOutput<O>>;
