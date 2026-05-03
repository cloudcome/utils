---
outline: deep
---

# video

视频加载工具。

## 导入

```typescript
import { videoLoad } from '@cloudcome/utils-browser/video'
```

## 函数

### videoLoad

加载视频并返回 HTMLVideoElement。

```typescript
function videoLoad(url: string): Promise<HTMLVideoElement>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| url | `string` | 视频 URL |

**返回值**

`Promise<HTMLVideoElement>` - 加载完成的视频元素

**示例**

```typescript
// 基本用法
const video = await videoLoad('https://example.com/video.mp4')
console.log(video.duration) // 视频时长
console.log(video.width) // 视频宽度
console.log(video.height) // 视频高度

// 播放视频
document.body.appendChild(video)
video.play()

// 错误处理
try {
  const video = await videoLoad('https://example.com/invalid-video.mp4')
} catch (error) {
  console.error('视频加载失败:', error)
}
```
