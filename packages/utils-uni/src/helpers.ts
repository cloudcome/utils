import type { UniCloudObjectOutput } from './cloud';

export function parseCloudObjectOutput<O>(output: UniCloudObjectOutput<O>): O {
  if (output.errCode) {
    throw new Error(output.errMsg);
  }

  return output.data;
}
