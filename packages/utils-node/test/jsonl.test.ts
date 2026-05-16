import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readJsonl, writeJsonl } from '@/jsonl';

describe('jsonl', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `jsonl-test-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  describe('readJsonl', () => {
    it('应正确读取 JSONL 文件', async () => {
      const filePath = join(tempDir, 'test.jsonl');
      const content = '{"name":"Alice","age":30}\n{"name":"Bob","age":25}\n{"name":"Charlie","age":35}\n';
      await writeFile(filePath, content, 'utf8');

      const result = await readJsonl(filePath);

      expect(result).toEqual([
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
        { name: 'Charlie', age: 35 },
      ]);
    });

    it('应跳过空行', async () => {
      const filePath = join(tempDir, 'empty-lines.jsonl');
      const content = '{"a":1}\n\n\n{"b":2}\n\n';
      await writeFile(filePath, content, 'utf8');

      const result = await readJsonl(filePath);

      expect(result).toEqual([{ a: 1 }, { b: 2 }]);
    });

    it('应支持泛型类型', async () => {
      interface User {
        name: string;
        age: number;
      }

      const filePath = join(tempDir, 'typed.jsonl');
      await writeFile(filePath, '{"name":"Alice","age":30}\n', 'utf8');

      const result = await readJsonl<User>(filePath);

      expect(result[0].name).toBe('Alice');
      expect(result[0].age).toBe(30);
    });

    it('应支持逐行处理回调', async () => {
      const filePath = join(tempDir, 'oneline.jsonl');
      const content = '{"n":1}\n{"n":2}\n{"n":3}\n';
      await writeFile(filePath, content, 'utf8');

      const processed: number[] = [];
      const result = await readJsonl<{ n: number }>(filePath, {
        onLine: (item, lineNumber) => {
          processed.push(item.n);
          expect(lineNumber).toBe(item.n);
        },
      });

      expect(processed).toEqual([1, 2, 3]);
      expect(result).toHaveLength(3);
    });

    it('应支持异步逐行处理回调', async () => {
      const filePath = join(tempDir, 'async.jsonl');
      await writeFile(filePath, '{"n":1}\n{"n":2}\n', 'utf8');

      const processed: number[] = [];
      await readJsonl<{ n: number }>(filePath, {
        onLine: async (item) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          processed.push(item.n);
        },
      });

      expect(processed).toEqual([1, 2]);
    });

    it('默认应抛出无效行错误', async () => {
      const filePath = join(tempDir, 'invalid.jsonl');
      await writeFile(filePath, '{"valid":true}\ninvalid json\n', 'utf8');

      await expect(readJsonl(filePath)).rejects.toThrow('Failed to parse line 2');
    });

    it('应支持跳过无效行', async () => {
      const filePath = join(tempDir, 'skip.jsonl');
      await writeFile(filePath, '{"valid":true}\ninvalid\n{"also":true}\n', 'utf8');

      const result = await readJsonl(filePath, { onError: 'skip' });

      expect(result).toEqual([{ valid: true }, { also: true }]);
    });

    it('应支持自定义错误处理', async () => {
      const filePath = join(tempDir, 'custom-error.jsonl');
      await writeFile(filePath, '{"a":1}\nbad\n{"c":3}\n', 'utf8');

      const errors: Array<{ error: Error; line: string; lineNumber: number }> = [];
      const result = await readJsonl(filePath, {
        onError: (error, line, lineNumber) => {
          errors.push({ error, line, lineNumber });
        },
      });

      expect(result).toEqual([{ a: 1 }, { c: 3 }]);
      expect(errors).toHaveLength(1);
      expect(errors[0].line).toBe('bad');
      expect(errors[0].lineNumber).toBe(2);
    });

    it('应抛出文件不存在错误', async () => {
      const filePath = join(tempDir, 'nonexistent.jsonl');

      await expect(readJsonl(filePath)).rejects.toThrow(/ENOENT/);
    });
  });

  describe('writeJsonl', () => {
    it('应正确写入 JSONL 文件', async () => {
      const filePath = join(tempDir, 'output.jsonl');
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ];

      await writeJsonl(filePath, data);

      const content = await readFile(filePath, 'utf8');
      expect(content).toBe('{"name":"Alice","age":30}\n{"name":"Bob","age":25}\n');
    });

    it('应自动创建目录', async () => {
      const filePath = join(tempDir, 'nested', 'dir', 'output.jsonl');
      const data = [{ id: 1 }];

      await writeJsonl(filePath, data);

      const content = await readFile(filePath, 'utf8');
      expect(content).toBe('{"id":1}\n');
    });

    it('应支持空数组', async () => {
      const filePath = join(tempDir, 'empty.jsonl');

      await writeJsonl(filePath, []);

      const content = await readFile(filePath, 'utf8');
      expect(content).toBe('');
    });

    it('应支持不同类型的数据', async () => {
      const filePath = join(tempDir, 'mixed.jsonl');
      const data = [1, 'hello', true, null, { key: 'value' }, [1, 2, 3]];

      await writeJsonl(filePath, data);

      const content = await readFile(filePath, 'utf8');
      const lines = content.split('\n').filter(Boolean);

      expect(lines).toEqual(['1', '"hello"', 'true', 'null', '{"key":"value"}', '[1,2,3]']);
    });

    it('应支持追加模式', async () => {
      const filePath = join(tempDir, 'append.jsonl');

      await writeJsonl(filePath, [{ id: 1 }]);
      await writeJsonl(filePath, [{ id: 2 }, { id: 3 }], { append: true });

      const content = await readFile(filePath, 'utf8');
      expect(content).toBe('{"id":1}\n{"id":2}\n{"id":3}\n');
    });

    it('默认应覆盖文件', async () => {
      const filePath = join(tempDir, 'overwrite.jsonl');

      await writeJsonl(filePath, [{ id: 1 }, { id: 2 }]);
      await writeJsonl(filePath, [{ id: 3 }]);

      const content = await readFile(filePath, 'utf8');
      expect(content).toBe('{"id":3}\n');
    });
  });
});
