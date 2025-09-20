import { parseCloudObjectOutput } from '@/_helpers';
import { objectDefaults, objectOmit } from '@cloudcome/utils-core/object';
import { tryFlatten } from '@cloudcome/utils-core/try';
import { isFunction } from '@cloudcome/utils-core/type';
import type { MaybePromise } from '@cloudcome/utils-core/types';
import type z from 'zod';
import type { ZodObject } from 'zod';
import { createCloudObjectError } from './error';
import { respondCloudObject } from './respond';
import type { UniCloudExpose, UniCloudModuleOutput, UniCloudObjectThis } from './types';
import type { UniIdCommonModule } from './uni-id';

export type UniCloudObjectThisAppendUser = {
  id: string;
  role: string[];
  permission: string[];
  isAdmin: boolean;
};

export type UniCloudObjectThisAppend = {
  options: Required<CreateCloudObjectOptions>;
  user: UniCloudObjectThisAppendUser;
};

export type UniCloudObjectContext = UniCloudObjectThis & UniCloudObjectThisAppend;

/**
 * 构建云函数暴露创建器的选项配置
 * 用于配置云函数暴露创建器的行为，目前支持传入UniIdCloudObject实例
 */
export type BuildCloudExposeCreatorOptions = {
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
   * 响应附加数据函数
   * 用于在云对象响应中添加额外的上下文信息
   * @param objectThis 云对象上下文
   * @returns 返回要附加到响应中的数据对象
   */
  respondAppend?: (objectThis: UniCloudObjectThis) => AnyObject;
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
};

export type CreateCloudExpose = {
  <S extends ZodObject, O>(
    schema: S,
    fn: (context: UniCloudObjectContext, input: z.infer<S>) => MaybePromise<O>,
    options?: CreateCloudObjectOptions,
  ): UniCloudExpose<z.infer<S>, O>;
  <O>(
    fn: (context: UniCloudObjectContext) => MaybePromise<O>,
    options?: CreateCloudObjectOptions,
  ): UniCloudExpose<void, O>;
};

/**
 * 构建云对象暴露创建器
 *
 * 该函数用于创建一个云对象暴露函数，可以处理用户身份验证、输入验证和错误处理等通用逻辑
 *
 * @param options 构建选项配置
 * @param options.uniIdCloudObject 可选的UniIdCloudObject实例，用于处理用户身份验证和权限管理
 * @param options.requiredUserErrCode 需要用户登录态时的错误码，默认为 'uni-id-check-token-failed'
 * @param options.requiredUserErrMsg 需要用户登录态时的错误消息，默认为 '需要登录后才能进行此操作'
 *
 * @returns 返回一个云对象暴露创建函数，支持两种重载形式：
 * 1. 无输入参数的形式：(fn, options) => UniCloudObject
 * 2. 有输入验证的形式：(schema, fn, options) => UniCloudObject
 *
 * @example
 * // 无输入参数的使用方式
 * const expose = buildCloudExposeCreator();
 * export default expose(async (context) => {
 *   // 业务逻辑
 * });
 *
 * @example
 * // 有输入验证的使用方式
 * const expose = buildCloudExposeCreator();
 * const schema = z.object({
 *   name: z.string().min(1)
 * });
 *
 * export default expose(schema, async (context, input) => {
 *   // 业务逻辑，input类型已自动推断
 * });
 */
export function buildCloudExposeCreator(options?: BuildCloudExposeCreatorOptions) {
  const buildOptions = objectDefaults(options || {}, {
    requiredUserErrCode: 'uni-id-check-token-failed',
    requiredUserErrMsg: '需要登录后才能进行此操作',
    onlyLocalEnvErrMsg: '运行环境不匹配',
    respondAppend: () => ({}),
  }) as Required<BuildCloudExposeCreatorOptions>;

  // @ts-ignore
  const createCloudExpose: CreateCloudExpose = (arg0, arg1, arg2) => {
    // 确定选项来源：如果arg0是函数，则选项在arg1；否则在arg2
    const optionsSource = (isFunction(arg0) ? arg1 : arg2) as CreateCloudObjectOptions | undefined;

    // 设置默认选项值
    const createOptions = objectDefaults(optionsSource || {}, {
      requiredUser: false,
      onlyLocalEnv: false,
    }) as Required<CreateCloudObjectOptions>;

    return async function (input) {
      // 处理云函数响应逻辑，包括错误捕获和统一响应格式
      return await respondCloudObject(async () => {
        const runtimeEnv = this.getCloudInfo().runtimeEnv;

        if (createOptions.onlyLocalEnv && runtimeEnv !== 'local') {
          throw createCloudObjectError(buildOptions.onlyLocalEnvErrMsg);
        }

        // 构建附加的上下文信息，包括用户身份和权限信息
        const user = await parseAppendUser(this, options?.uniIdCommonModule);
        const append: UniCloudObjectThisAppend = {
          options: createOptions,
          user: user,
        };
        const context = Object.assign(this, append) as UniCloudObjectContext;

        // 如果需要用户登录态但用户未登录，则抛出错误
        if (createOptions.requiredUser && !user.id) {
          throw createCloudObjectError(buildOptions.requiredUserErrMsg, buildOptions.requiredUserErrCode);
        }

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
      }, buildOptions.respondAppend(this));
    };
  };

  return createCloudExpose;
}

async function parseAppendUser(
  objectThis: UniCloudObjectThis,
  uniIdCommonModule?: UniIdCommonModule,
): Promise<UniCloudObjectThisAppendUser> {
  const appendUser: UniCloudObjectThisAppendUser = {
    id: '',
    role: [],
    permission: [],
    isAdmin: false,
  };

  if (!uniIdCommonModule) return appendUser;

  const uic = uniIdCommonModule.createInstance({
    clientInfo: objectThis.getClientInfo(),
  });

  // 忽略错误1
  const [err1, user] = await tryFlatten(uic.checkToken(objectThis.getUniIdToken() || ''));
  if (!user) return appendUser;

  // 忽略错误2
  const [err2, userData] = tryFlatten(() => parseCloudModuleOutput(user));
  if (!userData) return appendUser;

  appendUser.id = userData.uid || '';
  appendUser.role = userData.role || [];
  appendUser.permission = userData.permission || [];
  appendUser.isAdmin = appendUser.role.includes('admin') && appendUser.permission.length === 0;

  return appendUser;
}

/**
 * 解析云函数模块输出结果
 *
 * 该函数用于处理云函数模块的输出，如果输出中包含错误码，则抛出相应的错误；
 * 否则返回去除错误码和错误信息后的数据部分。
 *
 * @template O - 输出数据的类型
 * @param output - 云函数模块的输出结果，包含errCode、errMsg和数据部分
 * @param fallbackErrorMessage - 当输出中没有错误信息时使用的默认错误消息
 * @returns 返回去除errCode和errMsg字段后的数据对象
 * @throws {CloudObjectError} 当output中存在errCode时抛出包含错误码和错误信息的异常
 *
 * @example
 * // 成功情况
 * const result = parseCloudModuleOutput({ value: 'success', errCode: 0, errMsg: '' });
 * // 返回: { value: 'success' }
 *
 * @example
 * // 错误情况
 * try {
 *   parseCloudModuleOutput({ errCode: 404, errMsg: 'Not Found' });
 * } catch (error) {
 *   // 抛出错误: CloudObjectError('Not Found', 404)
 * }
 */
export function parseCloudModuleOutput<O>(
  output: UniCloudModuleOutput<O>,
  fallbackErrorMessage = '',
): Omit<O, 'errCode' | 'errMsg'> {
  if (output.errCode) {
    throw createCloudObjectError(output.errMsg || fallbackErrorMessage, output.errCode);
  }
  return objectOmit(output, ['errCode', 'errMsg']);
}
