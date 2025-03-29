export type AnyObject = Record<PropertyKey, unknown>;

export type AnyArray = unknown[];

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type AnyFunction = (...args: any[]) => any;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type AnyAsyncFunction = (...args: any[]) => Promise<any>;

export type MaybePromise<T> = T | Promise<T>;
