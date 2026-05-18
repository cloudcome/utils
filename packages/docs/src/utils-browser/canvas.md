---
outline: deep
---

# canvas

Canvas 操作工具。

## 导入

```typescript
import { canvasToBase64, canvasToBlob, canvasDrawImage } from '@cloudcome/utils-browser/canvas';
import type { CanvasDrawImageOptions } from '@cloudcome/utils-browser/canvas';
```

## 类型定义

### CanvasDrawImageOptions

```typescript
interface CanvasDrawImageOptions {
  srcLeft?: number;
  srcTop?: number;
  srcWidth?: number;
  srcHeight?: number;
  destLeft?: number;
  destTop?: number;
  destWidth?: number;
  destHeight?: number;
}
```

**属性说明**

| 属性       | 类型     | 默认值      | 描述                        |
| ---------- | -------- | ----------- | --------------------------- |
| srcLeft    | `number` | `0`         | 源图像裁剪起始 X 坐标       |
| srcTop     | `number` | `0`         | 源图像裁剪起始 Y 坐标       |
| srcWidth   | `number` | 图像宽度    | 源图像裁剪宽度              |
| srcHeight  | `number` | 图像高度    | 源图像裁剪高度              |
| destLeft   | `number` | `0`         | 目标 Canvas 绘制起始 X 坐标 |
| destTop    | `number` | `0`         | 目标 Canvas 绘制起始 Y 坐标 |
| destWidth  | `number` | Canvas 宽度 | 目标 Canvas 绘制宽度        |
| destHeight | `number` | Canvas 高度 | 目标 Canvas 绘制高度        |

## 函数

### canvasToBase64

将 Canvas 转换为 Base64 字符串。

```typescript
function canvasToBase64(canvas: HTMLCanvasElement, type?: string, quality?: number): string;
```

**参数**

| 参数    | 类型                | 默认值        | 描述                                                        |
| ------- | ------------------- | ------------- | ----------------------------------------------------------- |
| canvas  | `HTMLCanvasElement` | -             | Canvas 元素                                                 |
| type    | `string`            | `'image/png'` | 图片类型，如 `'image/png'`、`'image/jpeg'`、`'image/webp'`  |
| quality | `number`            | -             | 图片质量（0-1），仅对 `'image/jpeg'` 和 `'image/webp'` 有效 |

**返回值**

`string` - Base64 编码的图片字符串

**示例**

```typescript
const canvas = document.createElement('canvas');
canvas.width = 100;
canvas.height = 100;

// 绘制内容
const ctx = canvas.getContext('2d')!;
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, 100, 100);

// 转换为 Base64
const base64 = canvasToBase64(canvas); // 'data:image/png;base64,...'
const base64Jpg = canvasToBase64(canvas, 'image/jpeg', 0.8);
```

### canvasToBlob

将 Canvas 转换为 Blob 对象。

```typescript
function canvasToBlob(canvas: HTMLCanvasElement, type?: string, quality?: number): Promise<Blob>;
```

**参数**

| 参数    | 类型                | 默认值        | 描述            |
| ------- | ------------------- | ------------- | --------------- |
| canvas  | `HTMLCanvasElement` | -             | Canvas 元素     |
| type    | `string`            | `'image/png'` | 图片类型        |
| quality | `number`            | -             | 图片质量（0-1） |

**返回值**

`Promise<Blob>` - Blob 对象

**边界情况**

- `canvas.toBlob` 返回 `null` 时（如浏览器不支持该格式），Promise 会被 reject，抛出 `'canvas 导出二进制对象失败'` 错误

**示例**

```typescript
const canvas = document.createElement('canvas');
// ... 绘制内容

const blob = await canvasToBlob(canvas, 'image/jpeg', 0.9);
console.log(blob.size); // 文件大小
console.log(blob.type); // 'image/jpeg'
```

### canvasDrawImage

在 Canvas 上绘制图片。

```typescript
function canvasDrawImage(canvas: HTMLCanvasElement, url: string, options?: CanvasDrawImageOptions): Promise<void>;
```

**参数**

| 参数    | 类型                     | 描述           |
| ------- | ------------------------ | -------------- |
| canvas  | `HTMLCanvasElement`      | Canvas 元素    |
| url     | `string`                 | 图片 URL       |
| options | `CanvasDrawImageOptions` | 可选，绘制选项 |

**返回值**

`Promise<void>`

**边界情况**

- Canvas 无法获取 2D 上下文时（如 `getContext('2d')` 返回 `null`），抛出 `'canvas context is null'` 错误
- 内部使用 `imageLoad` 加载图片，图片加载失败会向上抛出错误

**示例**

```typescript
const canvas = document.createElement('canvas');
canvas.width = 200;
canvas.height = 200;

// 基本用法
await canvasDrawImage(canvas, 'https://example.com/image.jpg');

// 带裁剪选项
await canvasDrawImage(canvas, 'https://example.com/image.jpg', {
  srcLeft: 50,
  srcTop: 50,
  srcWidth: 100,
  srcHeight: 100,
  destLeft: 0,
  destTop: 0,
  destWidth: 200,
  destHeight: 200,
});
```
