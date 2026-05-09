import { expect, it, vi } from 'vitest';
import { downloadBlob, downloadURL } from '@/download';

it('download', () => {
  downloadURL('/');
  downloadURL('/', 'file');

  URL.createObjectURL = vi.fn(() => '/');
  URL.revokeObjectURL = vi.fn();

  downloadBlob(new Blob());
  downloadBlob(new Blob(), 'file');

  expect(URL.createObjectURL).toBeTypeOf('function');
});
