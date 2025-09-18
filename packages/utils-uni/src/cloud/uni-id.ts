import type { ClientInfo, UniCloudModuleOutput, UniCloudObjectOutput } from './types';

/**
 * uni-id-common 模块
 */
export type UniIdCommonModule = {
  createInstance: (options: { clientInfo: ClientInfo }) => UniIdCommonInstance;
};

export type UniIdCommonInstance = {
  checkToken: (token: string) => Promise<UniIdUser | undefined>;
};

export type UniIdUser = UniCloudModuleOutput<{
  uid?: string;
  role?: string[];
  permission?: string[];
}>;
