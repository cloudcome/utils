import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createInterface } from 'node:readline';

/**
 * readJsonl 函数的选项
 */
export interface ReadJsonlOptions<T> {
  /**
   * 文件编码
   * @default 'utf8'
   */
  encoding?: BufferEncoding;
  /**
   * 错误处理策略
   * - `'skip'`: 跳过无效行
   * - `'throw'`: 抛出异常（默认）
   * - `function`: 自定义处理函数
   * @default 'throw'
   */
  onError?:
    | 'skip'
    | 'throw'
    | ((error: Error, line: string, lineNumber: number) => void);
  /**
   * 逐行处理回调，支持异步
   * 如果提供，每解析一行都会调用此函数
   */
  onLine?: (item: T, lineNumber: number) => void | Promise<void>;
}

/**
 * writeJsonl 函数的选项
 */
export interface WriteJsonlOptions {
  /**
   * 文件编码
   * @default 'utf8'
   */
  encoding?: BufferEncoding;
  /**
   * 追加模式，为 true 时在文件末尾追加，否则覆盖
   * @default false
   */
  append?: boolean;
}

/**
 * 逐行读取 JSONL 文件
 * @param filePath - 文件路径
 * @param options - 读取选项
 * @returns 解析后的数据数组
 * @example
 * ```typescript
 * // 基础用法
 * const users = await readJsonl<User>('./users.jsonl');
 *
 * // 逐行处理
 * await readJsonl<User>('./users.jsonl', {
 *   onLine: async (user, lineNum) => {
 *     await processUser(user);
 *   },
 * });
 *
 * // 跳过无效行
 * const validItems = await readJsonl<Item>('./data.jsonl', {
 *   onError: 'skip',
 * });
 * ```
 */
export async function readJsonl<T = unknown>(
  filePath: string,
  options?: ReadJsonlOptions<T>,
): Promise<T[]> {
  const { encoding = 'utf8', onError = 'throw', onLine } = options ?? {};

  return new Promise<T[]>((resolve, reject) => {
    const results: T[] = [];
    const pending: Promise<void>[] = [];
    let lineNumber = 0;
    let hasError = false;

    const inputStream = createReadStream(filePath, { encoding });
    const rl = createInterface({
      input: inputStream,
      crlfDelay: Number.POSITIVE_INFINITY,
    });

    rl.on('line', (line) => {
      lineNumber++;
      const trimmed = line.trim();

      if (!trimmed) return;

      try {
        const item = JSON.parse(trimmed) as T;

        if (onLine) {
          const promise = Promise.resolve(onLine(item, lineNumber)).catch(
            (error) => {
              hasError = true;
              throw error;
            },
          );
          pending.push(promise);
        }

        results.push(item);
      } catch (error) {
        const parseError =
          error instanceof Error ? error : new Error(String(error));

        if (onError === 'skip') {
          return;
        }

        if (onError === 'throw') {
          hasError = true;
          rl.close();
          reject(
            new Error(
              `Failed to parse line ${lineNumber}: ${parseError.message}`,
            ),
          );
          return;
        }

        onError(parseError, trimmed, lineNumber);
      }
    });

    rl.on('close', async () => {
      if (hasError) return;

      try {
        await Promise.all(pending);
        resolve(results);
      } catch (error) {
        reject(error);
      }
    });

    rl.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * 将数据写入 JSONL 文件
 * @param filePath - 文件路径
 * @param data - 要写入的数据数组
 * @param options - 写入选项
 * @example
 * ```typescript
 * const users = [{ name: 'Alice' }, { name: 'Bob' }];
 * await writeJsonl('./users.jsonl', users);
 * ```
 */
export async function writeJsonl<T = unknown>(
  filePath: string,
  data: T[],
  options?: WriteJsonlOptions,
): Promise<void> {
  const { encoding = 'utf8', append = false } = options ?? {};

  await mkdir(dirname(filePath), { recursive: true });

  return new Promise<void>((resolve, reject) => {
    const outputStream = createWriteStream(filePath, {
      encoding,
      flags: append ? 'a' : 'w',
    });

    outputStream.on('finish', () => {
      resolve();
    });

    outputStream.on('error', (error) => {
      reject(error);
    });

    for (const item of data) {
      const line = `${JSON.stringify(item)}\n`;
      outputStream.write(line);
    }

    outputStream.end();
  });
}
