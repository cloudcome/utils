import { copyText } from '@/browser-clipboard';
import { vi } from 'vitest';

describe('copyText', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    document.body.innerHTML = '';
  });

  it('应成功复制文本并执行 execCommand', async () => {
    const execCommandMock = vi.fn();
    document.execCommand = execCommandMock;

    const text = 'test text';
    copyText(text);

    expect(execCommandMock).toHaveBeenCalledWith('copy');
    expect(document.body.querySelector('textarea')?.value).toBe(text);
  });

  it('应在复制后移除 textarea 元素', () => {
    const execCommandMock = vi.fn();
    document.execCommand = execCommandMock;

    copyText('test text');

    expect(document.body.querySelector('textarea')).toBeNull();
  });
});
