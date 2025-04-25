import { VERSION } from '@/index';
import { expect, it } from 'vitest';

it('version', () => {
  expect(VERSION).toEqual(PKG_VERSION);
});
