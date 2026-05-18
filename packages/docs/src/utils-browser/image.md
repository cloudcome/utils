---
outline: deep
---

# image

图片加载工具。

## 导入

```typescript
import { imageLoad } from '@cloudcome/utils-browser/image';
```

## 函数

### imageLoad

加载图片并返回 HTMLImageElement。

```typescript
function imageLoad(url: string): Promise<HTMLImageElement>;
```

**参数**

| 参数 | 类型     | 描述     |
| ---- | -------- | -------- |
| url  | `string` | 图片 URL |

**返回值**

`Promise<HTMLImageElement>` - 加载完成的图片元素

**示例**

```typescript
// 基本用法
const img = await imageLoad('https://example.com/image.jpg');
console.log(img.width); // 图片宽度
console.log(img.height); // 图片高度

// 在 Canvas 中使用
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d')!;
const img = await imageLoad('https://example.com/image.jpg');
canvas.width = img.width;
canvas.height = img.height;
ctx.drawImage(img, 0, 0);

// 错误处理
try {
  const img = await imageLoad('https://example.com/invalid-image.jpg');
} catch (error) {
  console.error('图片加载失败:', error);
}
```

**说明**

- 图片会以 `crossOrigin: 'anonymous'` 方式加载，支持跨域图片
- 为兼容 iOS 拍照图片的方向问题，内部会将 `<img>` 元素插入到 DOM 中（隐藏样式）以确保获取到正确的图片尺寸
- 图片加载完成后会从 DOM 中移除，不会留下残留元素
- 如果图片在调用时已经完成加载（`image.complete && image.width > 0`），Promise 会立即 resolve，无需等待 `onload` 事件
- 加载失败时抛出 `'图片加载失败'` 错误
