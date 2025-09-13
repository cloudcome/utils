import { parseCloudObjectOutput } from '@/helpers';
import { objectDefaults } from '@cloudcome/utils-core/object';
import { tryFlatten } from '@cloudcome/utils-core/try';
import { isFunction } from '@cloudcome/utils-core/type';
import type { MaybePromise } from '@cloudcome/utils-core/types';
import type z from 'zod';
import type { ZodObject } from 'zod';
import { createCloudObjectError } from './error';
import type { UniCloudObject, UniCloudObjectThis } from './object';
import { respondCloudObject } from './respond';
import type { UniIdCloudObject } from './uni-id';

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
   * 可选的UniIdCloudObject实例
   * 用于处理用户身份验证和权限管理相关功能
   */
  uniIdCloudObject?: UniIdCloudObject;

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
};

export type CreateCloudObjectOptions = {
  /**
   * 是否需要用户登录态
   * @default false
   */
  requiredUser?: boolean;
};

export type CreateCloudObjectExpose = {
  <S extends ZodObject, O>(
    schema: S,
    fn: (context: UniCloudObjectContext, input: z.infer<S>) => MaybePromise<O>,
    options?: CreateCloudObjectOptions,
  ): UniCloudObject<z.infer<S>, O>;
  <O>(
    fn: (context: UniCloudObjectContext) => MaybePromise<O>,
    options?: CreateCloudObjectOptions,
  ): UniCloudObject<void, O>;
};

export function buildCloudObjectExposeCreator(options?: BuildCloudExposeCreatorOptions) {
  const buildOptions = objectDefaults(options || {}, {
    requiredUserErrCode: 'uni-id-check-token-failed',
    requiredUserErrMsg: '需要登录后才能进行此操作',
  }) as Required<BuildCloudExposeCreatorOptions>;

  // @ts-ignore
  const createCloudObjectExpose: CreateCloudObjectExpose = (arg0, arg1, arg2) => {
    // 选项来源
    const optionsSource = (isFunction(arg0) ? arg1 : arg2) as CreateCloudObjectOptions | undefined;
    // 设置默认选项值
    const createOptions = objectDefaults(optionsSource || {}, {
      requiredUser: false,
    }) as Required<CreateCloudObjectOptions>;

    return async function (input) {
      // 处理云函数响应逻辑
      return await respondCloudObject(async () => {
        // 构建附加的上下文信息
        const user = await parseAppendUser(this, options?.uniIdCloudObject);
        const append: UniCloudObjectThisAppend = {
          options: createOptions,
          user: user,
        };
        const context = Object.assign(this, append) as UniCloudObjectContext;

        if (createOptions.requiredUser && !user.id) {
          throw createCloudObjectError(buildOptions.requiredUserErrMsg, buildOptions.requiredUserErrCode);
        }

        // 无入参
        if (isFunction(arg0)) {
          return await arg0(context);
        }

        // 单入参
        // 验证输入数据
        const parsed = arg0.safeParse(input);

        if (!parsed.success) {
          console.log(parsed.error.issues);

          const issue0 = parsed.error?.issues?.[0];

          // 处理验证错误
          if (issue0?.code === 'custom') throw issue0.message;
          throw new Error('请求数据不正确');
        }

        return await arg1(context, parsed.data);
      }, this.getUniCloudRequestId());
    };
  };

  return createCloudObjectExpose;
}

async function parseAppendUser(
  objectThis: UniCloudObjectThis,
  uniIdCloudObject?: UniIdCloudObject,
): Promise<UniCloudObjectThisAppendUser> {
  const appendUser: UniCloudObjectThisAppendUser = {
    id: '',
    role: [],
    permission: [],
    isAdmin: false,
  };

  if (!uniIdCloudObject) return appendUser;

  const uniId = uniIdCloudObject.createInstance({
    clientInfo: objectThis.getClientInfo(),
  });

  // 忽略错误1
  const [err1, user] = await tryFlatten(uniId.checkToken(objectThis.getUniIdToken() || ''));
  if (!user) return appendUser;

  // 忽略错误2
  const [err2, userData] = tryFlatten(() => parseCloudObjectOutput(user));
  if (!userData) return appendUser;

  appendUser.id = userData.uid || '';
  appendUser.role = userData.role || [];
  appendUser.permission = userData.permission || [];
  appendUser.isAdmin = appendUser.role.includes('admin') && appendUser.permission.length === 0;

  return appendUser;
}
