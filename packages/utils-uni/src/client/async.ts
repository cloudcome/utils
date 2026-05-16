import { errorAssign } from '@cloudcome/utils-core/error';

export type UniFailErr = UniNamespace.GeneralCallbackResult & {
  errCode?: number;
  errno?: number;
};

export type UniPromiseError = Error & {
  errCode: number;
  errNo: number;
};

/**
 * 包装 uni 异步函数，返回 Promise 并处理错误
 * @param promise uni 异步函数的 Promise
 * @returns Promise<T>
 * @throws UniPromiseError
 */
export async function uniPromise<T>(promise: Promise<T>): Promise<T> {
  try {
    const result = await promise;
    return result;
  } catch (err) {
    const res = err as unknown as UniFailErr;
    throw errorAssign(new Error(res.errMsg || '未知错误'), {
      errCode: res.errCode || -1,
      errNo: res.errno || -1,
    });
  }
}

/**
 * 包装 uni 异步函数，返回 Promise 并处理错误
 * @param runner uni 异步函数的回调
 * @returns Promise<T>
 * @throws UniPromiseError
 */
export async function uniCallback<T>(
  runner: (options: { success: (res: T) => void; fail: (err: UniFailErr) => void }) => unknown,
) {
  return new Promise<T>((resolve, reject) => {
    runner({
      success(res) {
        resolve(res);
      },
      fail(err) {
        reject(
          errorAssign(new Error(err.errMsg || '未知错误'), {
            errCode: err.errCode || -1,
            errNo: err.errno || -1,
          }),
        );
      },
    });
  });
}
