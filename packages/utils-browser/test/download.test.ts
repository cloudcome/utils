import { downloadBlob, downloadURL } from '@/download';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

it('download', () => {
  downloadURL('/');
  downloadURL('/', 'file');

  URL.createObjectURL = vi.fn(() => '/');
  URL.revokeObjectURL = vi.fn();

  downloadBlob(new Blob());
  downloadBlob(new Blob(), 'file');

  expect(URL.createObjectURL).toBeTypeOf('function');
});
