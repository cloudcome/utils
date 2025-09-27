export type UniErrorData = {
  /** 错误码 */
  errCode?: number | string;
  /** 错误信息 */
  errMsg?: string;
};

export type UniError = Error & UniErrorData;
