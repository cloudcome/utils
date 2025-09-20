import type { UniCloudObjectOutput } from '@/cloud';
import type { UniClientDatabaseOutput } from '@/database';
import type { AnyArray, AnyFunction } from '@cloudcome/utils-core/types';
import {
  type UseRequestOptions,
  type UseRequestOutput,
  type UseRequestOutputFilled,
  useRequest,
} from '@cloudcome/utils-vue/request';
import { parseCloudExposeOutput } from './_helpers';

type _ImportObject = UniCloudNamespace.UniCloud['importObject'];
type _ImportObjectArgs = Parameters<_ImportObject>;

export type CreateUseCloudObjectOptions = _ImportObjectArgs[1] & {
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
};

/**
 * 云对象请求函数类型定义
 * @template F 云对象方法函数类型
 * @param input 云对象方法的参数数组
 * @returns 返回云对象方法执行结果的Promise
 */
export type UniCloudObjectRequest = <F extends AnyFunction>(
  ...input: Parameters<F>
) => Promise<UniCloudObjectOutput<ReturnType<F>>>;

/**
 * 创建一个用于调用云对象的hook
 * @template I 输入参数类型
 * @template O 输出结果类型
 * @param expose 云对象方法名
 * @param caller 调用云对象的函数，接收请求函数和输入参数，返回Promise
 * @param options 配置选项，包含请求相关的配置
 * @returns 返回一个请求hook，用于处理云对象调用
 */
export type UseCloudExpose = {
  /**
   * 重载签名：当提供placeholder选项时，返回带有默认值的输出类型
   * @template I 输入参数类型
   * @template O 输出结果类型
   * @param expose 云对象方法名
   * @param caller 调用云对象的函数
   * @param options 包含placeholder函数的配置选项
   * @returns 带有默认值的请求输出
   */
  <I extends AnyArray, O>(
    expose: string,
    caller: (request: UniCloudObjectRequest, ...inputs: I) => Promise<UniCloudObjectOutput<O>>,
    options: Omit<UseRequestOptions<I, O>, 'placeholder'> & { placeholder: () => O },
  ): UseRequestOutputFilled<I, O>;

  /**
   * 重载签名：当不提供placeholder选项时，返回普通输出类型
   * @template I 输入参数类型
   * @template O 输出结果类型
   * @param expose 云对象方法名
   * @param caller 调用云对象的函数
   * @param options 可选的配置选项
   * @returns 普通请求输出
   */
  <I extends AnyArray, O>(
    expose: string,
    caller: (request: UniCloudObjectRequest, ...inputs: I) => Promise<UniCloudObjectOutput<O>>,
    options?: UseRequestOptions<I, O>,
  ): UseRequestOutput<I, O>;
};

/**
 * 导入云对象并创建一个用于调用云对象的hook
 * @param objectName 云对象名称
 * @param options 配置选项，包含模拟服务器、回退错误信息等
 * @returns 返回一个可用于调用云对象方法的hook函数
 */
export function importCloudObject(objectName: _ImportObjectArgs[0], options?: CreateUseCloudObjectOptions) {
  const server = options?._mockServer || uniCloud.importObject(objectName, options);
  const fallbackErrorMessage = options?.fallbackErrorMessage || '请求失败';

  /**
   * 用于调用云对象方法的hook函数
   * @template I 输入参数类型
   * @template O 输出结果类型
   * @param expose 云对象方法名
   * @param caller 调用云对象的函数
   * @param options 配置选项，包含请求相关的配置
   * @returns 返回一个请求hook，用于处理云对象调用
   */
  const useCloudExpose: UseCloudExpose = (expose, caller, options) => {
    // 使用请求hook处理云对象调用
    return useRequest(async (...inputs) => {
      const request = server[expose];
      const output = await caller(request, ...inputs);
      return parseCloudExposeOutput(output, fallbackErrorMessage);
    }, options);
  };

  return useCloudExpose;
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
  caller: (db: UniCloud.Database, ...inputs: I) => Promise<UniClientDatabaseOutput<O>>,
  options: Omit<UseDatabaseOptions<I, O>, 'placeholder'> & { placeholder: () => O },
): UseRequestOutputFilled<I, O>;
export function useDatabase<I extends AnyArray, O>(
  caller: (db: UniCloud.Database, ...inputs: I) => Promise<UniClientDatabaseOutput<O>>,
  options?: UseDatabaseOptions<I, O>,
): UseRequestOutput<I, O>;
export function useDatabase<I extends AnyArray, O>(
  caller: (db: UniCloud.Database, ...inputs: I) => Promise<UniClientDatabaseOutput<O>>,
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

export { parseCloudExposeOutput } from './_helpers';
