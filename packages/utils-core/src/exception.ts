import { objectDefaults } from './object';

/**
 * 构建异常选项
 */
export type DefineExceptionOptions = {
  /**
   * 自定义错误消息格式函数
   * @param name 错误名称
   * @param message 原始错误消息
   * @returns 格式化后的错误消息
   * @example
   * (name, message) => `${name}::${message}`
   */
  format?: (name: string, message: string) => string;
};

/**
 * 默认的异常构建选项
 */
const defaults: DefineExceptionOptions = {
  /**
   * 默认消息格式函数
   * @default (name, message) => `[${name}] ${message}`
   */
  format: (name, message) => `[${name}] ${message}`,
};

/**
 * 自定义异常类
 * @template T 额外属性的类型
 * @param name 异常类名称
 * @param options 构建选项
 * @returns 自定义异常类
 * @example
 * const MyException = defineException<{ code: number }>('MyException');
 * const err = new MyException('error', { code: 404 });
 *
 * @example
 * const SimpleException = defineException('SimpleException');
 * const err = new SimpleException('error', undefined);
 */
export function defineException<T = void>(
  name: string,
  options?: DefineExceptionOptions,
) {
  const { format } = objectDefaults(
    options || {},
    defaults,
  ) as Required<DefineExceptionOptions>;

  return class extends Error {
    constructor(message: string, extra: T) {
      super(format(name, message));
      this.name = name;
      Object.assign(this, extra);
    }
  } as unknown as {
    new (message: string, extra: T): Error & T;
  };
}

// const MyException = defineException<{ foo: string; bar: number }>('MyException: ');
// const myException = new MyException('bar', { foo: '1', bar: 1 });
// myException.foo;
// myException.bar;
// myException.name;
// myException.message;
// myException.stack;
// myException.cause;

// const MyException2 = defineException('MyException2: ');
// const myException2 = new MyException2('bar');
