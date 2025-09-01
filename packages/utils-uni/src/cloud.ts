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

export function createUseCloudObject(objectName: ImportObjectArgs[0], options?: ImportObjectArgs[1]) {
  const server = uniCloud.importObject(objectName, options);

  return function useCloudObject<I extends AnyArray, O>(
    caller: (server: UniCloudObjectServer<I, O>, ...inputs: I) => Promise<UniCloudObjectReturns<O>>,
  ) {
    return useRequest(async (...inputs: I) => {
      const result = await caller(server, ...inputs);
      if (!result.errCode) return result.data;
      throw new Error(result.errMsg || '请求失败');
    });
  };
}
