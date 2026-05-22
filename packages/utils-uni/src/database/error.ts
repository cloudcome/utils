/**
 * 数据库底层异常类
 * 当 uniCloud 数据库操作抛出错误时，统一包装为该异常
 */
export class DbError extends Error {
  /** 原始错误码，如 'InternalServerError' */
  errCode: string | number;
  /** MongoDB 错误码，如 'E11000'。不匹配则为空字符串 */
  code: string;

  constructor(message: string, extra: { errCode: string | number; code: string }) {
    super(message);
    this.name = 'DbError';
    this.errCode = extra.errCode;
    this.code = extra.code;
  }
}

/**
 * 判断错误是否为数据库底层错误
 * @param err - 任意错误对象
 * @returns 是否为 DbError
 */
export function isDbError(err: unknown): err is DbError {
  return err instanceof DbError;
}

/**
 * 从 MongoDB 错误消息中提取错误码
 * @param errMsg - 错误消息字符串，如 'E11000 duplicate key error...'
 * @returns MongoDB 错误码，如 'E11000'
 */
export function extractMongoCode(errMsg: string): string {
  const m = errMsg.match(/^E\d+/);
  return m ? m[0] : '';
}
