export function assertNull(value: null) {
  return value === null;
}

// biome-ignore lint/suspicious/noConfusingVoidType: 必须包含 void，没有传值也是 undefined
export function assertUndefined(value: undefined | void) {
  return value === undefined;
}

export function assertError(value: Error) {
  return value && value instanceof Error;
}

export function assertNumber(value: number) {
  return typeof value === 'number';
}
