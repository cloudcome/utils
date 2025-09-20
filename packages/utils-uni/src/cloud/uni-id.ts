import type { ClientInfo, CloudMethodOutput, CloudModuleOutput } from './types';

/**
 * uni-id-common 模块
 */
export type UniIdCommonModule = {
  createInstance: (options: { clientInfo: ClientInfo }) => UniIdCommonInstance;
};

export type UniIdCommonInstance = {
  checkToken: (token: string) => Promise<UniIdUser | undefined>;
};

export type UniIdUser = CloudModuleOutput<{
  uid?: string;
  role?: string[];
  permission?: string[];
}>;
