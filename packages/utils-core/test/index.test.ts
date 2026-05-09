import { expect, it } from 'vitest';
import { VERSION } from '@/index';

it('version', () => {
  expect(VERSION).toEqual(PKG_VERSION);
});
