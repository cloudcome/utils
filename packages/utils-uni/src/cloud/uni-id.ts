import type { ClientInfo, UniCloudObjectOutput } from './object';

export type UniIdCloudObject = {
  createInstance: (options: { clientInfo: ClientInfo }) => UniIdInstance;
};

export type UniIdInstance = {
  checkToken: (token: string) => Promise<UniIdUser | undefined>;
};

export type UniIdUser = UniCloudObjectOutput<{
  uid?: string;
  role?: string[];
  permission?: string[];
}>;
