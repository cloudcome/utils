import { errorAssign } from '@cloudcome/utils-core/error';

export function createCloudObjectError(message: string, code?: number | string) {
  return errorAssign(new Error(message), {
    errCode: code,
    errMsg: message,
  });
}
