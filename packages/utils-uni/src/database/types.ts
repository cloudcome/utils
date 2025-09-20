export type ClientDatabaseOutput<T> = {
  result: T & {
    code?: number | string;
    errCode?: number | string;
    errMsg?: string;
    message?: string;
  };
};

export type CloudDatabaseOutput<T> = T;
