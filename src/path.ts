function isCurrentSlice(slice: string): boolean {
  return slice === '.';
}

function isParentSlice(slice: string): boolean {
  return slice === '..';
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
    const isCurrent = isCurrentSlice(slice);
    const isParent = isParentSlice(slice);

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
 * const fullPath = pathJoin('/path', 'to', 'file');
 * console.log(fullPath); // 输出: '/path/to/file'
 * ```
 */
export function pathJoin(from: string, ...to: string[]): string {
  return pathNormalize([from, ...to].join('/'));
}
