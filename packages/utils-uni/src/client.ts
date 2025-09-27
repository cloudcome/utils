import type { CloudMethodOutput, UniError } from '@/cloud';
import type { ClientDatabaseOutput } from '@/database';
import { isFunction } from '@cloudcome/utils-core/type';
import type { AnyArray, AnyFunction } from '@cloudcome/utils-core/types';
import {
  type UseRequestOptions,
  type UseRequestOutput,
  type UseRequestOutputFilled,
  useRequest,
} from '@cloudcome/utils-vue/request';
import { parseCloudMethodOutput } from './_helpers';

type _ImportObject = UniCloudNamespace.UniCloud['importObject'];
type _ImportObjectArgs = Parameters<_ImportObject>;
type _ImportObjectOptions = _ImportObjectArgs[1];

export type CreateUseCloudObjectOptions = _ImportObjectOptions & {
  /**
   * 模拟云对象，用于单元测试
   * @private
   */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  _mockServer?: any;

  /**
   * 回退错误信息
   * @default '请求失败'
   */
  fallbackErrorMessage?: string;

  /**
   * 请求开始前的回调函数
   */
  onBefore?: () => unknown;

  /**
   * 请求成功后的回调函数
   */
  onSuccess?: () => unknown;

  /**
   * 请求失败时的回调函数
   * @param err 错误信息
   */
  onError?: (err: UniError) => unknown;

  /**
   * 请求完成后的回调函数（无论成功或失败都会执行）
   */
  onAfter?: () => unknown;
};

/**
 * 云对象请求函数类型定义
 * @template F 云对象方法函数类型
 * @param input 云对象方法的参数数组
 * @returns 返回云对象方法执行结果的Promise
 */
export type CloudObjectRequest = <F extends AnyFunction>(
  ...input: Parameters<F>
) => Promise<CloudMethodOutput<ReturnType<F>>>;

/**
 * 用于调用云对象方法的配置选项类型定义
 * @template I 输入参数类型数组
 * @template O 输出结果类型
 */
export type UseCloudMethodOptions<I extends AnyArray, O> = Omit<UseRequestOptions<I, O>, 'onError'> & {
  /**
   * 请求发生错误时的回调函数
   * @param err 错误信息
   * @param inputs 请求输入参数
   */
  onError?: (err: UniError, ...inputs: I) => unknown;
};

/**
 * 用于调用云对象方法的hook函数类型定义
 * @template I 输入参数类型数组
 * @template O 输出结果类型
 */
export type UseCloudMethod = {
  /**
   * 重载签名：当提供 placeholder 选项时，返回包含初始值的输出类型
   * @param method 云对象方法名
   * @param caller 调用云对象方法的函数
   * @param options 包含 placeholder 的请求配置选项
   * @returns 返回包含初始值的请求输出
   */
  <I extends AnyArray, O>(
    method: string | ((...inputs: I) => string),
    caller: (request: CloudObjectRequest, ...inputs: I) => Promise<CloudMethodOutput<O>>,
    options: Omit<UseCloudMethodOptions<I, O>, 'placeholder'> & { placeholder: () => O },
  ): UseRequestOutputFilled<I, O>;

  /**
   * 重载签名：当不提供 placeholder 选项时，返回普通输出类型
   * @param method 云对象方法名
   * @param caller 调用云对象方法的函数
   * @param options 可选的请求配置选项
   * @returns 返回普通的请求输出
   */
  <I extends AnyArray, O>(
    method: string | ((...inputs: I) => string),
    caller: (request: CloudObjectRequest, ...inputs: I) => Promise<CloudMethodOutput<O>>,
    options?: UseCloudMethodOptions<I, O>,
  ): UseRequestOutput<I, O>;
};

/**
 * 导入云对象并创建一个用于调用云对象的hook
 * @param objectName 云对象名称
 * @param importOptions 配置选项，包含模拟服务器、回退错误信息等
 * @returns 返回一个可用于调用云对象方法的hook函数
 */
export function importCloudObject(objectName: _ImportObjectArgs[0], importOptions?: CreateUseCloudObjectOptions) {
  const fallbackErrorMessage = importOptions?.fallbackErrorMessage || '请求失败';
  const server = importOptions?._mockServer || uniCloud.importObject(objectName, importOptions);

  /**
   * 用于调用云对象方法的hook函数
   * @template I 输入参数类型
   * @template O 输出结果类型
   * @param method 云对象方法名
   * @param caller 调用云对象的函数
   * @param options 配置选项，包含请求相关的配置
   * @returns 返回一个请求hook，用于处理云对象调用
   */
  const useCloudMethod: UseCloudMethod = (method, caller, options) => {
    // 使用请求hook处理云对象调用
    return useRequest(
      async (...inputs) => {
        const methodName = isFunction(method) ? method(...inputs) : method;
        const request = server[methodName];
        const output = await caller(request, ...inputs);
        return parseCloudMethodOutput(output, fallbackErrorMessage);
      },
      {
        ...options,
        onBefore(...inputs) {
          importOptions?.onBefore?.();
          options?.onBefore?.(...inputs);
        },
        onSuccess(data, ...inputs) {
          importOptions?.onSuccess?.();
          options?.onSuccess?.(data, ...inputs);
        },
        onError(err, ...inputs) {
          importOptions?.onError?.(err as UniError);
          options?.onError?.(err as UniError, ...inputs);
        },
        onAfter(...inputs) {
          importOptions?.onAfter?.();
          options?.onAfter?.(...inputs);
        },
      },
    );
  };

  return useCloudMethod;
}

export type UseDatabaseOptions<I extends AnyArray, O> = UseRequestOptions<I, O> & {
  /**
   * 模拟数据库，用于单元测试
   */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  _mockDatabase?: any;
};

/**
 * 创建一个用于调用云数据库的hook
 * @param caller 调用云数据库的函数，接收数据库实例和输入参数，返回Promise
 * @param options 配置选项
 * @returns 返回一个请求hook，用于处理云数据库调用
 */
export function useDatabase<I extends AnyArray, O>(
  caller: (db: UniCloud.Database, ...inputs: I) => Promise<ClientDatabaseOutput<O>>,
  options: Omit<UseDatabaseOptions<I, O>, 'placeholder'> & { placeholder: () => O },
): UseRequestOutputFilled<I, O>;
export function useDatabase<I extends AnyArray, O>(
  caller: (db: UniCloud.Database, ...inputs: I) => Promise<ClientDatabaseOutput<O>>,
  options?: UseDatabaseOptions<I, O>,
): UseRequestOutput<I, O>;
export function useDatabase<I extends AnyArray, O>(
  caller: (db: UniCloud.Database, ...inputs: I) => Promise<ClientDatabaseOutput<O>>,
  options?: UseDatabaseOptions<I, O>,
): UseRequestOutput<I, O> {
  // 获取数据库实例，优先使用模拟数据库（用于测试），否则使用uniCloud数据库
  const db = options?._mockDatabase || uniCloud.database();
  return useRequest(async (...inputs: I) => {
    const { result } = await caller(db, ...inputs);
    if (!result.errCode) return result;
    throw new Error(result.errMsg || '请求失败');
  }, options);
}

export { parseCloudMethodOutput } from './_helpers';
export type { UniError } from './_types';
