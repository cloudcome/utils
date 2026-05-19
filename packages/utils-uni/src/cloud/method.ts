import { objectDefaults } from '@cloudcome/utils-core/object';
import { tryFlatten } from '@cloudcome/utils-core/try';
import { isFunction } from '@cloudcome/utils-core/type';
import type { MaybePromise } from '@cloudcome/utils-core/types';
import { versionCompare } from '@cloudcome/utils-core/version';
import type z from 'zod';
import type { ZodObject } from 'zod';
import { createCloudObjectError } from './error';
import { parseCloudModuleOutput } from './module';
import { respondCloudMethod } from './respond';
import type { CloudMethod, CloudObjectThis } from './types';
import type { UniIdCommonModule } from './uni-id';

type _CloudObjectThisAppendUser = {
  id: string;
  role: string[];
  permission: string[];
  isAdmin: boolean;
};

/**
 * 云对象创建选项的运行时解析类型。
 *
 * 将 `CreateCloudObjectOptions` 中的内置字段设为必填（已应用默认值），
 * 同时保留 `ExtraConfig` 扩展字段的原始可选性。
 *
 * @template ExtraConfig - 自定义扩展配置类型
 */
type _ResolvedCreateCloudOptions<ExtraConfig extends AnyObject = {}> = ExtraConfig & {
  /** 是否需要用户登录态 */
  requiredUser: boolean;
  /** 是否仅在本地环境运行 */
  onlyLocalEnv: boolean;
  /** 最小支持版本 */
  minVersion?: string;
  /** 最大支持版本 */
  maxVersion?: string;
  /** 非响应模式，常用于钩子函数中 */
  noRespond?: boolean;
};

type _CloudObjectThisAppend<ExtraConfig extends AnyObject = {}> = {
  options: _ResolvedCreateCloudOptions<ExtraConfig>;
  user: _CloudObjectThisAppendUser;
};

export type CloudObjectContext<ExtraConfig extends AnyObject = {}> = CloudObjectThis &
  _CloudObjectThisAppend<ExtraConfig>;

export type BuildCloudMethodCreatorOptions<ExtraConfig extends AnyObject = {}> = {
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
   * @param context 云对象上下文，包含用户信息、扩展配置选项等
   * @param options 云对象创建选项，包含 requiredUser、onlyLocalEnv 及自定义扩展配置
   */
  onBefore?: (
    context: CloudObjectContext<ExtraConfig>,
    options: _ResolvedCreateCloudOptions<ExtraConfig>,
  ) => MaybePromise<unknown>;
};

export type CreateCloudObjectOptions<ExtraConfig extends object = object> = ExtraConfig & {
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

export type CreateCloudMethod<ExtraConfig extends object = object> = {
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
export function buildCloudMethodCreator<ExtraConfig extends AnyObject = {}>(
  options?: BuildCloudMethodCreatorOptions<ExtraConfig>,
) {
  const buildOptions = objectDefaults(options || {}, {
    requiredUserErrCode: 'uni-id-check-token-failed',
    requiredUserErrMsg: '需要登录后才能进行此操作',
    onlyLocalEnvErrMsg: '运行环境不匹配',
    appVersionTooLowErrMsg: '应用版本过低',
    appVersionTooHighErrMsg: '应用版本过高',
    respondAppend: () => ({}),
    onBefore: () => {},
  }) as Required<BuildCloudMethodCreatorOptions>;

  // @ts-expect-error
  const createCloudMethod: CreateCloudMethod<ExtraConfig> = (arg0, arg1, arg2) => {
    const optionsSource = (isFunction(arg0) ? arg1 : arg2) as CreateCloudObjectOptions<ExtraConfig> | undefined;
    const createOptions = objectDefaults(optionsSource || {}, {
      requiredUser: false,
      onlyLocalEnv: false,
    }) as _ResolvedCreateCloudOptions<ExtraConfig>;

    return async function (this: CloudObjectThis, input) {
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

        const user = await _parseAppendUser(this, options?.uniIdCommonModule);
        const append: _CloudObjectThisAppend<ExtraConfig> = {
          options: createOptions,
          user: user,
        };
        const context = Object.assign(this, append) as CloudObjectContext<ExtraConfig>;

        if (createOptions.requiredUser && !user.id) {
          throw createCloudObjectError(buildOptions.requiredUserErrMsg, buildOptions.requiredUserErrCode);
        }

        await buildOptions.onBefore(context, createOptions);

        if (isFunction(arg0)) {
          return await arg0(context);
        }

        const parsed = arg0.safeParse(input);

        if (!parsed.success) {
          console.log(parsed.error.issues);

          const issue0 = parsed.error?.issues?.[0];

          if (issue0?.code === 'custom') throw issue0.message;
          throw new Error('请求数据不正确');
        }

        return await arg1(context, parsed.data);
      };

      if (createOptions.noRespond) {
        return await cloudMethod();
      }

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

  const [_err1, user] = await tryFlatten(uic.checkToken(objectThis.getUniIdToken() || ''));
  if (!user) return appendUser;

  const [_err2, userData] = tryFlatten(() => parseCloudModuleOutput(user));
  if (!userData) return appendUser;

  appendUser.id = userData.uid || '';
  appendUser.role = userData.role || [];
  appendUser.permission = userData.permission || [];
  appendUser.isAdmin = appendUser.role.includes('admin') && appendUser.permission.length === 0;

  return appendUser;
}
