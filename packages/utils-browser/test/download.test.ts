import { expect, it, vi } from 'vitest';
import { downloadBlob, downloadURL } from '@/download';

it('download', () => {
  downloadURL('/');
  downloadURL('/', 'file');

  URL.createObjectURL = vi.fn<() => void>(() => '/');
  URL.revokeObjectURL = vi.fn<() => void>();

  downloadBlob(new Blob());
  downloadBlob(new Blob(), 'file');

  expect(URL.createObjectURL).toBeTypeOf('function');
});
