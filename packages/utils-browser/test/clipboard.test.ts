import { beforeEach, describe, expect, it, vi } from 'vitest';
import { copyText } from '@/clipboard';

describe('copyText', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    document.body.innerHTML = '';
  });

  it('应在复制后移除 textarea 元素', () => {
    const execCommandMock = vi.fn<(commandId: string) => boolean>();
    document.execCommand = execCommandMock;

    copyText('test text');

    expect(document.body.querySelector('textarea')).toBeNull();
  });
});
