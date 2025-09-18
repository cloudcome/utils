import type { ClientInfo, UniCloudObjectOutput } from './object';

/**
 * uni-id-common 模块
 */
export type UniIdCommonModule = {
  createInstance: (options: { clientInfo: ClientInfo }) => UniIdCommonInstance;
};

export type UniIdCommonInstance = {
  checkToken: (token: string) => Promise<UniIdUser | undefined>;
};

export type UniIdUser = UniCloudObjectOutput<{
  uid?: string;
  role?: string[];
  permission?: string[];
}>;
