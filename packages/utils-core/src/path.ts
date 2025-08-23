import { arrayEach } from './array';

/**
 * 判断是否是当前目录标记
 * @param {string} slice - 路径片段
 * @returns {boolean} - 如果是当前目录标记'.'则返回true，否则返回false
 */
function _isCurrentSlice(slice: string): boolean {
  return slice === '.';
}

/**
 * 判断是否是上级目录标记
 * @param {string} slice - 路径片段
 * @returns {boolean} - 如果是上级目录标记'..'则返回true，否则返回false
 */
function _isParentSlice(slice: string): boolean {
  return slice === '..';
}

/**
 * 判断是否是绝对路径
 * @param {string} path - 路径字符串
 * @returns {boolean} - 如果是绝对路径则返回true，否则返回false
 * @example
 * ```typescript
 * const isAbs = isAbsolutePath('/path/to/file');
 * console.log(isAbs); // 输出: true
 * ```
 */
export function isAbsolutePath(path: string): boolean {
  return path.startsWith('/');
}

/**
 * 判断是否是相对路径
 * @param {string} path - 路径字符串
 * @returns {boolean} - 如果是相对路径则返回true，否则返回false
 * @example
 * ```typescript
 * const isRel = isRelativePath('path/to/file');
 * console.log(isRel); // 输出: true
 * ```
 */
export function isRelativePath(path: string): boolean {
  return !isAbsolutePath(path);
}

/**
 * 标准化路径
 * @param {string} path - 要标准化的路径字符串。
 * @returns {string} - 标准化后的路径字符串。
 * @example
 * ```typescript
 * const normalizedPath = pathNormalize('/path///to///file');
 * console.log(normalizedPath); // 输出: '/path/to/file'
 * ```
 */
export function pathNormalize(path: string): string {
  const slices = path
    .replace(/\\/g, '/')
    .replace(/\/{2,}/g, '/')
    .replace(/\.{3,}/g, '..')
    .replace(/\/\.\//g, '/')
    .split('/')
    .map((point) => point.trim());
  const points: string[] = [];
  const isAbs = slices[0] === '';

  const push = (point: string) => {
    points.push(point);
  };

  const back = () => {
    // 绝对路径不能退到根目录
    if (points.length === 1 && isAbs) return;

    //
    if (points.length === 0 || points.at(-1) === '..') {
      points.push('..');
    } else {
      points.pop();
    }
  };

  for (const slice of slices) {
    const isCurrent = _isCurrentSlice(slice);
    const isParent = _isParentSlice(slice);

    // // 未进入实际路径
    // if (!inPoints) {
    //   push(slice);
    //   inPoints = !isCurrent && !isParent;
    //   continue;
    // }

    if (isCurrent) {
      continue;
    }

    if (isParent) {
      back();
      continue;
    }

    push(slice);
  }

  return points.join('/');
}

/**
 * 路径合并
 * @param {string} from - 起始路径。
 * @param {...string[]} to - 要合并的路径片段。
 * @returns {string} - 合并后的路径字符串。
 * @example
 * ```typescript
 * const fullPath = pathJoin('/path', '/to', 'file');
 * console.log(fullPath); // 输出: '/path/to/file'
 * ```
 */
export function pathJoin(from: string, ...to: string[]): string {
  return pathNormalize([from, ...to].join('/'));
}

/**
 * 解析路径
 * @param {string} from - 起始路径
 * @param {...string[]} to - 要解析的路径片段
 * @returns {string} - 解析后的绝对路径
 * @example
 * ```typescript
 * const resolvedPath = pathResolve('/path', '/to', 'file');
 * console.log(resolvedPath); // 输出: '/to/file'
 * ```
 */
export function pathResolve(from: string, ...to: string[]): string {
  const paths = [from, ...to].map(pathNormalize);

  let lastStartPath = from;
  let lastStartIndex = 0;

  arrayEach(
    paths,
    (path, index) => {
      if (isAbsolutePath(path)) {
        lastStartPath = path;
        lastStartIndex = index;
        return false;
      }
    },
    true,
  );

  return pathJoin(lastStartPath, ...paths.slice(lastStartIndex + 1));
}

/**
 * 将相对路径转换为标准的相对路径格式(添加'./'前缀)
 *
 * @param {string} path - 要处理的路径字符串
 * @returns {string} 处理后的路径字符串
 *
 * @example <caption>处理绝对路径</caption>
 * ```typescript
 * const result = pathRelativize('/path/to/file');
 * console.log(result); // 输出: '/path/to/file'
 * ```
 *
 * @example <caption>处理已带'./'前缀的相对路径</caption>
 * ```typescript
 * const result = pathRelativize('./path/to/file');
 * console.log(result); // 输出: './path/to/file'
 * ```
 *
 * @example <caption>处理不带'./'前缀的相对路径</caption>
 * ```typescript
 * const result = pathRelativize('path/to/file');
 * console.log(result); // 输出: './path/to/file'
 * ```
 */
export function pathRelativize(path: string): string {
  if (isAbsolutePath(path)) return path;
  if (path.startsWith('./')) return path;
  if (path.startsWith('../')) return path;
  return `./${path}`;
}
