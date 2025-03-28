export function createAfn<T, R>(options: {
  timeout: number;
  result?: T;
  reason?: R;
  onResolved?: (result: T) => void;
  onRejected?: (reason: R) => void;
  onFinally?: () => void;
}) {
  return () =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (options.reason) {
          options.onRejected?.(options.reason);
          reject(options.reason);
        } else {
          options.onResolved?.(options.result as T);
          resolve(options.result);
        }

        options.onFinally?.();
      }, options.timeout);
    });
}
