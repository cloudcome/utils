export type UniClientDatabaseOutput<T> = {
  result: T & {
    code?: number | string;
    errCode?: number | string;
    errMsg?: string;
    message?: string;
  };
};

export type UniCloudDatabaseOutput<T> = T;
