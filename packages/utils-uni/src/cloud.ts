import type { AnyArray } from '@cloudcome/utils-core/types';
import { useRequest } from '@cloudcome/utils-vue/request';

type ImportObject = UniCloudNamespace.UniCloud['importObject'];
type ImportObjectArgs = Parameters<ImportObject>;

export type UniCloudObjectReturns<T> = {
  errCode?: number | string;
  errMsg?: string;
  data: T;
};

type UniCloudObjectServer<I extends AnyArray, T> = (...inputs: I) => Promise<UniCloudObjectReturns<T>>;

/**
 * 创建一个用于调用云对象的hook工厂函数
 * @param objectName 云对象名称，用于导入对应的云对象
 * @param options 导入云对象时的可选配置参数
 * @returns 返回一个函数，该函数可以用于创建云对象调用hook
 */
export function createUseCloudObject(objectName: ImportObjectArgs[0], options?: ImportObjectArgs[1]) {
  const server = uniCloud.importObject(objectName, options);

  /**
   * 创建云对象调用hook的函数
   * @param caller 调用云对象的函数，接收云对象服务和输入参数，返回Promise
   * @returns 返回一个请求hook，用于处理云对象调用
   */
  return function useCloudObject<I extends AnyArray, O>(
    caller: (server: UniCloudObjectServer<I, O>, ...inputs: I) => Promise<UniCloudObjectReturns<O>>,
  ) {
    // 使用请求hook处理云对象调用
    return useRequest(async (...inputs: I) => {
      const result = await caller(server, ...inputs);
      if (!result.errCode) return result.data;
      throw new Error(result.errMsg || '请求失败');
    });
  };
}
