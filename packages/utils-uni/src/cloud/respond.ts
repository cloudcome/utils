import { errorNormalize } from '@cloudcome/utils-core/error';
import type { MaybePromise } from '@cloudcome/utils-core/types';
import type { UniCloudObjectOutput } from './object';

export async function respondCloudObject<O>(
  fn: () => MaybePromise<O>,
  requestId?: string,
): Promise<UniCloudObjectOutput<O>> {
  try {
    const data = await fn();

    return {
      errCode: 0,
      errMsg: '',
      data,
      requestId,
    };
  } catch (err) {
    console.error('respondCloudObject error');
    console.error(err);

    const err2 = errorNormalize(err as Error & { errCode?: number | string; errMsg?: string });

    return {
      errCode: err2.errCode || -1,
      errMsg: err2.errMsg || err2.message || '',
      // @ts-ignore
      data: null,
      requestId,
    };
  }
}
