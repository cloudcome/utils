import type { AnyArray } from '@cloudcome/utils-core/types';
import {
  type UseRequestOptions,
  type UseRequestOutput,
  type UseRequestOutputFilled,
  useRequest,
} from '@cloudcome/utils-vue/request';

type ImportObject = UniCloudNamespace.UniCloud['importObject'];
type ImportObjectArgs = Parameters<ImportObject>;

export type UniCloudObjectOutput<T> = {
  requestId?: string;
  errCode?: number | string;
  errMsg?: string;
  data: T;
};

export type UniCloudObjectServer<O> = Record<string, (...inputs: unknown[]) => Promise<UniCloudObjectOutput<O>>>;

export type CreateUseCloudObjectOptions = ImportObjectArgs[1] & {
  /**
   * 模拟云对象，用于单元测试
   * @private
   */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  _mockServer?: any;
};

export type UseCloudObject = {
  <I extends AnyArray, O>(
    caller: (server: UniCloudObjectServer<O>, ...inputs: I) => Promise<UniCloudObjectOutput<O>>,
    options: Omit<UseRequestOptions<I, O>, 'placeholder'> & { placeholder: () => O },
  ): UseRequestOutputFilled<I, O>;
  <I extends AnyArray, O>(
    caller: (server: UniCloudObjectServer<O>, ...inputs: I) => Promise<UniCloudObjectOutput<O>>,
    options?: UseRequestOptions<I, O>,
  ): UseRequestOutput<I, O>;
};

/**
 * 创建一个用于调用云对象的hook工厂函数
 * @param objectName 云对象名称，用于导入对应的云对象
 * @param options 导入云对象时的可选配置参数
 * @returns 返回一个函数，该函数可以用于创建云对象调用hook
 */
export function createUseCloudObject(objectName: ImportObjectArgs[0], options?: CreateUseCloudObjectOptions) {
  const server = options?._mockServer || uniCloud.importObject(objectName, options);
  const useCloudObject: UseCloudObject = (caller, options) => {
    // 使用请求hook处理云对象调用
    return useRequest(async (...inputs) => {
      const result = await caller(server, ...inputs);
      if (!result.errCode) return result.data;
      throw new Error(result.errMsg || '请求失败');
    }, options);
  };

  return useCloudObject;
}

export type UniCloudDatabaseOutput<T> = {
  result: T & {
    errCode?: number | string;
    errMsg?: string;
  };
};

export type UseCloudDatabaseOptions<I extends AnyArray, O> = UseRequestOptions<I, O> & {
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
export function useCloudDatabase<I extends AnyArray, O>(
  caller: (db: UniCloud.Database, ...inputs: I) => Promise<UniCloudDatabaseOutput<O>>,
  options: Omit<UseCloudDatabaseOptions<I, O>, 'placeholder'> & { placeholder: () => O },
): UseRequestOutputFilled<I, O>;
export function useCloudDatabase<I extends AnyArray, O>(
  caller: (db: UniCloud.Database, ...inputs: I) => Promise<UniCloudDatabaseOutput<O>>,
  options?: UseCloudDatabaseOptions<I, O>,
): UseRequestOutput<I, O>;
export function useCloudDatabase<I extends AnyArray, O>(
  caller: (db: UniCloud.Database, ...inputs: I) => Promise<UniCloudDatabaseOutput<O>>,
  options?: UseCloudDatabaseOptions<I, O>,
): UseRequestOutput<I, O> {
  // 获取数据库实例，优先使用模拟数据库（用于测试），否则使用uniCloud数据库
  const db = options?._mockDatabase || uniCloud.database();
  return useRequest(async (...inputs: I) => {
    const { result } = await caller(db, ...inputs);
    if (!result.errCode) return result;
    throw new Error(result.errMsg || '请求失败');
  }, options);
}
