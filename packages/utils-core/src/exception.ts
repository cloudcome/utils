import { objectDefaults } from './object';
import type { AnyObject } from './types';

export type BuildExceptionOptions = {
  format?: (name: string, message: string) => string;
};

const defaults: BuildExceptionOptions = {
  format: (name, message) => `[${name}] ${message}`,
};

export function buildException<T = void>(name: string, options?: BuildExceptionOptions) {
  const { format } = objectDefaults(options || {}, defaults) as Required<BuildExceptionOptions>;

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

// const MyException = buildException<{ foo: string; bar: number }>('MyException: ');
// const myException = new MyException('bar', { foo: '1', bar: 1 });
// myException.foo;
// myException.bar;
// myException.name;
// myException.message;
// myException.stack;
// myException.cause;

// const MyException2 = buildException('MyException2: ');
// const myException2 = new MyException2('bar');
