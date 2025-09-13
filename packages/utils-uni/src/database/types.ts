export type UniClientDatabaseOutput<T> = {
  result: T & {
    errCode?: number | string;
    errMsg?: string;
  };
};

export type UniCloudDatabaseOutput<T> = T;
