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

| 参数 | 类型     | 描述     |
| ---- | -------- | -------- |
| url  | `string` | 视频 URL |

**返回值**

`Promise<HTMLVideoElement>` - 加载完成的视频元素

**示例**

```typescript
// 基本用法
const video = await videoLoad('https://example.com/video.mp4')
console.log(video.duration) // 视频时长
console.log(video.videoWidth) // 视频宽度
console.log(video.videoHeight) // 视频高度

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

**说明**

- 视频以 `crossOrigin: 'anonymous'` 方式加载，支持跨域视频
- 内部会设置 `currentTime = 1` 以触发视频元数据加载，等待 `onloadedmetadata` 事件后 Promise 才 resolve。这样可以确保在 Promise 返回时已经能获取到 `duration`、`videoWidth`、`videoHeight` 等元数据
- 加载失败时抛出 `'视频加载失败'` 错误
