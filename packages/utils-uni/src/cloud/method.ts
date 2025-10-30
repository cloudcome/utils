import { objectDefaults, objectOmit } from '@cloudcome/utils-core/object';
import { tryFlatten } from '@cloudcome/utils-core/try';
import { isFunction } from '@cloudcome/utils-core/type';
import type { MaybePromise } from '@cloudcome/utils-core/types';
import { versionCompare } from '@cloudcome/utils-core/version';
import type z from 'zod';
import type { ZodObject } from 'zod';
import { createCloudObjectError } from './error';
import { parseCloudModuleOutput } from './module';
import { respondCloudMethod } from './respond';
import type { CloudMethod, CloudModuleOutput, CloudObjectThis } from './types';
import type { UniIdCommonModule } from './uni-id';

type _CloudObjectThisAppendUser = {
  id: string;
  role: string[];
  permission: string[];
  isAdmin: boolean;
};

type _CloudObjectThisAppend = {
  options: Required<CreateCloudObjectOptions>;
  user: _CloudObjectThisAppendUser;
};

export type CloudObjectContext = CloudObjectThis & _CloudObjectThisAppend;

export type BuildCloudMethodCreatorOptions = {
  /**
   * UniId 通用模块
   * 用于处理用户身份验证和权限管理
   * 如果提供，将在云对象执行前验证用户身份
   */
  uniIdCommonModule?: UniIdCommonModule;

  /**
   * 需要用户登录态的错误码
   * @default 'uni-id-check-token-failed'
   */
  requiredUserErrCode?: number | string;

  /**
   * 需要用户登录态的错误消息
   * @default '需要登录后才能进行此操作'
   */
  requiredUserErrMsg?: string;

  /**
   * 仅允许本地环境运行的错误消息
   * @default '运行环境不匹配'
   */
  onlyLocalEnvErrMsg?: string;

  /**
   * 版本不匹配错误消息
   * @default '应用版本过低'
   */
  appVersionTooLowErrMsg?: string;

  /**
   * 应用版本过高错误消息
   * @default '应用版本过高'
   */
  appVersionTooHighErrMsg?: string;

  /**
   * 响应附加数据函数
   * 用于在云对象响应中添加额外的上下文信息
   * @param objectThis 云对象上下文
   * @returns 返回要附加到响应中的数据对象
   */
  respondAppend?: (objectThis: CloudObjectThis) => AnyObject;

  /**
   * 所有云对象执行前钩子函数
   * @param context 云对象上下文，包含用户信息、选项等
   */
  onBefore?: (context: CloudObjectContext) => MaybePromise<unknown>;
};

export type CreateCloudObjectOptions = {
  /**
   * 是否需要用户登录态
   * @default false
   */
  requiredUser?: boolean;

  /**
   * 是否仅在本地环境运行
   * @default false
   */
  onlyLocalEnv?: boolean;

  /**
   * 最小支持版本
   */
  minVersion?: string;

  /**
   * 最大支持版本
   */
  maxVersion?: string;

  /**
   * 非响应模式，常用于钩子函数中，如 _before, _after 等，
   * 文档：https://doc.dcloud.net.cn/uniCloud/cloud-obj.html#before-and-after
   */
  noRespond?: boolean;
};

/**
 * 云对象方法创建器类型定义
 *
 * 用于定义云对象方法的创建函数类型，支持两种重载形式：
 * 1. 带输入验证的版本：接收schema、处理函数和选项
 * 2. 无输入参数的版本：仅接收处理函数和选项
 */
export type CreateCloudMethod = {
  /**
   * 带输入验证的云对象方法创建器
   * @template S - Zod验证模式类型
   * @template O - 返回值类型
   * @param schema - Zod验证模式，用于验证输入数据
   * @param fn - 业务逻辑处理函数，接收上下文和验证后的输入数据
   * @param options - 云对象创建选项
   * @returns 云对象方法函数
   */
  <S extends ZodObject, O>(
    schema: S,
    fn: (context: CloudObjectContext, input: z.infer<S>) => MaybePromise<O>,
    options?: CreateCloudObjectOptions,
  ): CloudMethod<z.infer<S>, O>;

  /**
   * 无输入参数的云对象方法创建器
   * @template O - 返回值类型
   * @param fn - 业务逻辑处理函数，仅接收上下文
   * @param options - 云对象创建选项
   * @returns 云对象方法函数
   */
  <O>(fn: (context: CloudObjectContext) => MaybePromise<O>, options?: CreateCloudObjectOptions): CloudMethod<void, O>;
};

/**
 * 构建云对象方法创建器
 *
 * 该函数用于创建云对象方法的工厂函数，支持输入验证、用户身份验证、环境检查等功能。
 * 返回的创建器函数可以根据不同的配置创建云对象方法。
 *
 * @param options 构建选项，用于配置云对象方法创建器的行为
 * @returns 返回一个云对象方法创建器函数
 *
 * @example
 * // 创建一个需要用户登录的云对象方法
 * const createMethod = buildCloudMethodCreator({ uniIdCommonModule });
 * const myMethod = createMethod(async (context) => {
 *   return { message: 'Hello ' + context.user.id };
 * }, { requiredUser: true });
 */
export function buildCloudMethodCreator(options?: BuildCloudMethodCreatorOptions) {
  const buildOptions = objectDefaults(options || {}, {
    requiredUserErrCode: 'uni-id-check-token-failed',
    requiredUserErrMsg: '需要登录后才能进行此操作',
    onlyLocalEnvErrMsg: '运行环境不匹配',
    appVersionTooLowErrMsg: '应用版本过低',
    appVersionTooHighErrMsg: '应用版本过高',
    respondAppend: () => ({}),
    onBefore: () => {},
  }) as Required<BuildCloudMethodCreatorOptions>;

  // @ts-ignore
  const createCloudMethod: CreateCloudMethod = (arg0, arg1, arg2) => {
    // 确定选项来源：如果arg0是函数，则选项在arg1；否则在arg2
    const optionsSource = (isFunction(arg0) ? arg1 : arg2) as CreateCloudObjectOptions | undefined;

    // 设置默认选项值
    const createOptions = objectDefaults(optionsSource || {}, {
      requiredUser: false,
      onlyLocalEnv: false,
    }) as Required<CreateCloudObjectOptions>;

    return async function (input) {
      const cloudMethod = async () => {
        const { runtimeEnv } = this.getCloudInfo();

        if (createOptions.onlyLocalEnv && runtimeEnv !== 'local') {
          throw createCloudObjectError(buildOptions.onlyLocalEnvErrMsg);
        }

        const { appVersion } = this.getClientInfo();

        if (createOptions.minVersion && versionCompare(appVersion, createOptions.minVersion) < 0) {
          throw createCloudObjectError(buildOptions.appVersionTooLowErrMsg);
        }

        if (createOptions.maxVersion && versionCompare(appVersion, createOptions.maxVersion) > 0) {
          throw createCloudObjectError(buildOptions.appVersionTooHighErrMsg);
        }

        // 构建附加的上下文信息，包括用户身份和权限信息
        const user = await _parseAppendUser(this, options?.uniIdCommonModule);
        const append: _CloudObjectThisAppend = {
          options: createOptions,
          user: user,
        };
        const context = Object.assign(this, append) as CloudObjectContext;

        // 如果需要用户登录态但用户未登录，则抛出错误
        if (createOptions.requiredUser && !user.id) {
          throw createCloudObjectError(buildOptions.requiredUserErrMsg, buildOptions.requiredUserErrCode);
        }

        // 执行前钩子函数
        await buildOptions.onBefore(context);

        // 无入参函数调用
        if (isFunction(arg0)) {
          return await arg0(context);
        }

        // 有入参函数调用 - 验证输入数据
        const parsed = arg0.safeParse(input);

        // 输入验证失败处理
        if (!parsed.success) {
          console.log(parsed.error.issues);

          const issue0 = parsed.error?.issues?.[0];

          // 处理自定义验证错误
          if (issue0?.code === 'custom') throw issue0.message;
          throw new Error('请求数据不正确');
        }

        // 执行业务逻辑函数，传入上下文和验证后的数据
        return await arg1(context, parsed.data);
      };

      // 如果设置了非响应模式，则直接执行方法，不返回响应
      if (createOptions.noRespond) {
        return await cloudMethod();
      }

      // 处理云对象方法响应逻辑，包括错误捕获和统一响应格式
      return await respondCloudMethod(cloudMethod, buildOptions.respondAppend(this));
    };
  };

  return createCloudMethod;
}

/**
 * 解析并附加用户信息到云对象上下文
 *
 * 该函数用于验证用户身份并获取用户权限信息，将结果附加到云对象上下文中的user字段
 * 如果未提供uniIdCommonModule或验证失败，则返回默认的空用户信息
 *
 * @param objectThis 云对象上下文，包含客户端信息和token等
 * @param uniIdCommonModule 可选的UniId通用模块实例，用于验证用户token
 * @returns 返回包含用户ID、角色、权限等信息的对象
 *
 * @example
 * // 成功验证用户身份
 * const user = await _parseAppendUser(this, uniIdModule);
 * // 返回: { id: 'user123', role: ['user'], permission: ['read'], isAdmin: false }
 *
 * @example
 * // 验证失败或未提供模块
 * const user = await _parseAppendUser(this);
 * // 返回: { id: '', role: [], permission: [], isAdmin: false }
 */
async function _parseAppendUser(
  objectThis: CloudObjectThis,
  uniIdCommonModule?: UniIdCommonModule,
): Promise<_CloudObjectThisAppendUser> {
  const appendUser: _CloudObjectThisAppendUser = {
    id: '',
    role: [],
    permission: [],
    isAdmin: false,
  };

  if (!uniIdCommonModule) return appendUser;

  const uic = uniIdCommonModule.createInstance({
    clientInfo: objectThis.getClientInfo(),
  });

  // 验证用户token，忽略验证过程中的错误
  const [err1, user] = await tryFlatten(uic.checkToken(objectThis.getUniIdToken() || ''));
  if (!user) return appendUser;

  // 解析验证结果，忽略解析过程中的错误
  const [err2, userData] = tryFlatten(() => parseCloudModuleOutput(user));
  if (!userData) return appendUser;

  appendUser.id = userData.uid || '';
  appendUser.role = userData.role || [];
  appendUser.permission = userData.permission || [];
  appendUser.isAdmin = appendUser.role.includes('admin') && appendUser.permission.length === 0;

  return appendUser;
}
