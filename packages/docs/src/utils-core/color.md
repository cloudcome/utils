---
outline: deep
---

# color

颜色转换工具，支持多种颜色空间之间的转换。

## 导入

```typescript
import {
  // 类型
  HEX,
  RGB,
  HSV,
  HSL,
  HWB,
  LAB,
  XYZ,

  // HEX 转换
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  hexToHsv,
  hsvToHex,
  hexToHwb,
  hwbToHex,

  // RGB 转换
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  hsvToRgb,
  rgbToHwb,
  hwbToRgb,
  rgbToLab,
  labToRgb,
  rgbToXyz,
  xyzToRgb,

  // 其他转换
  xyzToLab,
  labToXyz,

  // 颜色操作
  rgbWhiter,
  hslLighten,
  hsvBrighten,
  mix,

  // 颜色计算
  luminance,
  contrast,
  distance,
  rgbToHue,
} from '@cloudcome/utils-core/color';
```

## 类型定义

### HEX

```typescript
type HEX = `#${string}`;
```

**示例**

```typescript
const red: HEX = '#ff0000';
const green: HEX = '#00ff00';
const shorthand: HEX = '#f00';
```

### RGB

```typescript
interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}
```

**示例**

```typescript
const red: RGB = { r: 255, g: 0, b: 0 };
const green: RGB = { r: 0, g: 255, b: 0 };
```

### HSV

```typescript
interface HSV {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
}
```

**示例**

```typescript
const red: HSV = { h: 0, s: 100, v: 100 };
const green: HSV = { h: 120, s: 100, v: 100 };
```

### HSL

```typescript
interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}
```

**示例**

```typescript
const red: HSL = { h: 0, s: 100, l: 50 };
const green: HSL = { h: 120, s: 100, l: 50 };
```

### HWB

```typescript
interface HWB {
  h: number; // 0-360
  w: number; // 0-100
  b: number; // 0-100
}
```

**示例**

```typescript
const red: HWB = { h: 0, w: 0, b: 0 };
const green: HWB = { h: 120, w: 0, b: 0 };
```

### LAB

```typescript
interface LAB {
  l: number; // 0-100
  a: number; // -128 到 127
  b: number; // -128 到 127
}
```

**示例**

```typescript
const red: LAB = { l: 53.24, a: 80.09, b: 67.2 };
```

### XYZ

```typescript
interface XYZ {
  x: number;
  y: number;
  z: number;
}
```

**示例**

```typescript
const d65White: XYZ = { x: 95.047, y: 100.0, z: 108.883 };
```

## 函数

### HEX 转换

#### hexToRgb

将 HEX 颜色转换为 RGB。

```typescript
function hexToRgb(hex: HEX): RGB;
```

**参数**

| 参数 | 类型  | 描述           |
| ---- | ----- | -------------- |
| hex  | `HEX` | HEX 颜色字符串 |

**返回值**

`RGB` - RGB 颜色对象

**示例**

```typescript
hexToRgb('#ff0000'); // { r: 255, g: 0, b: 0 }
hexToRgb('#00ff00'); // { r: 0, g: 255, b: 0 }
hexToRgb('#f00'); // { r: 255, g: 0, b: 0 }
```

#### rgbToHex

将 RGB 颜色转换为 HEX。

```typescript
function rgbToHex(rgb: RGB): HEX;
```

**参数**

| 参数 | 类型  | 描述         |
| ---- | ----- | ------------ |
| rgb  | `RGB` | RGB 颜色对象 |

**返回值**

`HEX` - HEX 颜色字符串

**示例**

```typescript
rgbToHex({ r: 255, g: 0, b: 0 }); // '#ff0000'
rgbToHex({ r: 0, g: 255, b: 0 }); // '#00ff00'
```

#### hexToHsl

将 HEX 颜色转换为 HSL。

```typescript
function hexToHsl(hex: HEX): HSL;
```

**示例**

```typescript
hexToHsl('#ff0000'); // { h: 0, s: 100, l: 50 }
```

#### hslToHex

将 HSL 颜色转换为 HEX。

```typescript
function hslToHex(hsl: HSL): HEX;
```

**示例**

```typescript
hslToHex({ h: 0, s: 100, l: 50 }); // '#ff0000'
```

#### hexToHsv

将 HEX 颜色转换为 HSV。

```typescript
function hexToHsv(hex: HEX): HSV;
```

**示例**

```typescript
hexToHsv('#ff0000'); // { h: 0, s: 100, v: 100 }
```

#### hsvToHex

将 HSV 颜色转换为 HEX。

```typescript
function hsvToHex(hsv: HSV): HEX;
```

**示例**

```typescript
hsvToHex({ h: 0, s: 100, v: 100 }); // '#ff0000'
```

#### hexToHwb

将 HEX 颜色转换为 HWB。

```typescript
function hexToHwb(hex: HEX): HWB;
```

**示例**

```typescript
hexToHwb('#ff0000'); // { h: 0, w: 0, b: 0 }
```

#### hwbToHex

将 HWB 颜色转换为 HEX。

```typescript
function hwbToHex(hwb: HWB): HEX;
```

**示例**

```typescript
hwbToHex({ h: 0, w: 0, b: 0 }); // '#ff0000'
```

### RGB 转换

#### rgbToHsl

将 RGB 颜色转换为 HSL。

```typescript
function rgbToHsl(rgb: RGB): HSL;
```

**示例**

```typescript
rgbToHsl({ r: 255, g: 0, b: 0 }); // { h: 0, s: 100, l: 50 }
```

#### hslToRgb

将 HSL 颜色转换为 RGB。

```typescript
function hslToRgb(hsl: HSL): RGB;
```

**示例**

```typescript
hslToRgb({ h: 0, s: 100, l: 50 }); // { r: 255, g: 0, b: 0 }
```

#### rgbToHsv

将 RGB 颜色转换为 HSV。

```typescript
function rgbToHsv(rgb: RGB): HSV;
```

**示例**

```typescript
rgbToHsv({ r: 255, g: 0, b: 0 }); // { h: 0, s: 100, v: 100 }
```

#### hsvToRgb

将 HSV 颜色转换为 RGB。

```typescript
function hsvToRgb(hsv: HSV): RGB;
```

**示例**

```typescript
hsvToRgb({ h: 0, s: 100, v: 100 }); // { r: 255, g: 0, b: 0 }
```

#### rgbToHwb

将 RGB 颜色转换为 HWB。

```typescript
function rgbToHwb(rgb: RGB): HWB;
```

**示例**

```typescript
rgbToHwb({ r: 255, g: 0, b: 0 }); // { h: 0, w: 0, b: 0 }
```

#### hwbToRgb

将 HWB 颜色转换为 RGB。

```typescript
function hwbToRgb(hwb: HWB): RGB;
```

**示例**

```typescript
hwbToRgb({ h: 0, w: 0, b: 0 }); // { r: 255, g: 0, b: 0 }
```

#### rgbToLab

将 RGB 颜色转换为 LAB。

```typescript
function rgbToLab(rgb: RGB): LAB;
```

**示例**

```typescript
rgbToLab({ r: 255, g: 0, b: 0 }); // { l: 53.24, a: 80.09, b: 67.20 }
```

#### labToRgb

将 LAB 颜色转换为 RGB。

```typescript
function labToRgb(lab: LAB): RGB;
```

**示例**

```typescript
labToRgb({ l: 53.24, a: 80.09, b: 67.2 }); // { r: 255, g: 0, b: 0 }
```

#### rgbToXyz

将 RGB 颜色转换为 XYZ。

```typescript
function rgbToXyz(rgb: RGB): XYZ;
```

**示例**

```typescript
rgbToXyz({ r: 255, g: 0, b: 0 }); // { x: 41.24, y: 21.26, z: 1.93 }
```

#### xyzToRgb

将 XYZ 颜色转换为 RGB。

```typescript
function xyzToRgb(xyz: XYZ): RGB;
```

**示例**

```typescript
xyzToRgb({ x: 41.24, y: 21.26, z: 1.93 }); // { r: 255, g: 0, b: 0 }
```

### 其他转换

#### xyzToLab

将 XYZ 颜色转换为 LAB。

```typescript
function xyzToLab(xyz: XYZ): LAB;
```

#### labToXyz

将 LAB 颜色转换为 XYZ。

```typescript
function labToXyz(lab: LAB): XYZ;
```

### 颜色操作

#### rgbWhiter

通过混合调整 RGB 颜色明暗度。

```typescript
function rgbWhiter(rgb: RGB, value: number): RGB;
```

**参数**

| 参数  | 类型     | 描述                                                                         |
| ----- | -------- | ---------------------------------------------------------------------------- |
| rgb   | `RGB`    | RGB 颜色                                                                     |
| value | `number` | 调整强度。正值与黑色混合（变暗），负值与白色混合（变亮），绝对值表示混合比例 |

**返回值**

`RGB` - 调整后的颜色

**示例**

```typescript
// 正值变暗：红色与黑色混合
rgbWhiter({ r: 255, g: 0, b: 0 }, 0.5); // { r: 128, g: 0, b: 0 }

// 负值变亮：深色与白色混合
rgbWhiter({ r: 100, g: 50, b: 0 }, -0.5); // { r: 178, g: 153, b: 128 }

// 极值
rgbWhiter({ r: 200, g: 100, b: 50 }, 1); // { r: 0, g: 0, b: 0 } 纯黑
rgbWhiter({ r: 200, g: 100, b: 50 }, -1); // { r: 255, g: 255, b: 255 } 纯白
```

**边界情况**

```typescript
// value 绝对值超过 1 时，混合比例超过 100%，结果可能溢出常规 RGB 范围
rgbWhiter({ r: 100, g: 100, b: 100 }, 2); // 可能产生负值
rgbWhiter({ r: 100, g: 100, b: 100 }, -2); // 可能产生 > 255 的值
```

#### hslLighten

将 HSL 颜色变亮。

```typescript
function hslLighten(hsl: HSL, value: number): HSL;
```

**参数**

| 参数  | 类型     | 描述              |
| ----- | -------- | ----------------- |
| hsl   | `HSL`    | HSL 颜色          |
| value | `number` | 变亮程度（0-100） |

**返回值**

`HSL` - 变亮后的颜色

**示例**

```typescript
hslLighten({ h: 0, s: 100, l: 50 }, 20); // { h: 0, s: 100, l: 70 }
```

#### hsvBrighten

将 HSV 颜色变亮。

```typescript
function hsvBrighten(hsv: HSV, value: number): HSV;
```

**参数**

| 参数  | 类型     | 描述              |
| ----- | -------- | ----------------- |
| hsv   | `HSV`    | HSV 颜色          |
| value | `number` | 变亮程度（0-100） |

**返回值**

`HSV` - 变亮后的颜色

**示例**

```typescript
hsvBrighten({ h: 0, s: 100, v: 50 }, 20); // { h: 0, s: 100, v: 70 }
```

#### mix

混合两种颜色。

```typescript
function mix<T extends RGB | HSV | HSL>(a: T, b: T, weight?: number): T;
```

**参数**

| 参数   | 类型     | 默认值 | 描述                                                |
| ------ | -------- | ------ | --------------------------------------------------- |
| a      | `T`      | -      | 颜色 A                                              |
| b      | `T`      | -      | 颜色 B                                              |
| weight | `number` | `0.5`  | 混合权重（0-1），0 表示完全使用 A，1 表示完全使用 B |

**返回值**

`T` - 混合后的颜色

**示例**

```typescript
// 等量混合红色和蓝色
mix({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 255 }); // { r: 128, g: 0, b: 128 }

// 偏向红色
mix({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 255 }, 0.3); // 更接近红色
```

### 颜色计算

#### luminance

计算颜色的相对亮度。

```typescript
function luminance(rgb: RGB): number;
```

**参数**

| 参数 | 类型  | 描述     |
| ---- | ----- | -------- |
| rgb  | `RGB` | RGB 颜色 |

**返回值**

`number` - 相对亮度（0-1）

**示例**

```typescript
luminance({ r: 255, g: 0, b: 0 }); // 0.2126
luminance({ r: 0, g: 0, b: 0 }); // 0
luminance({ r: 255, g: 255, b: 255 }); // 1
```

#### contrast

计算两种颜色的对比度。

```typescript
function contrast(rgb1: RGB, rgb2: RGB): number;
```

**参数**

| 参数 | 类型  | 描述   |
| ---- | ----- | ------ |
| rgb1 | `RGB` | 颜色 1 |
| rgb2 | `RGB` | 颜色 2 |

**返回值**

`number` - 对比度（1-21）

**示例**

```typescript
// 黑白对比度最高
contrast({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }); // 21

// 相同颜色对比度最低
contrast({ r: 255, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }); // 1
```

#### distance

计算两种颜色在 LAB 颜色空间中的距离（Delta E）。

```typescript
function distance(labA: LAB, labB: LAB): number;
```

**参数**

| 参数 | 类型  | 描述   |
| ---- | ----- | ------ |
| labA | `LAB` | 颜色 A |
| labB | `LAB` | 颜色 B |

**返回值**

`number` - 颜色距离。值越小相似度越高，经过 /100 归一化处理

**示例**

```typescript
const lab1 = rgbToLab({ r: 255, g: 0, b: 0 });
const lab2 = rgbToLab({ r: 0, g: 0, b: 255 });
distance(lab1, lab2); // 颜色距离
```

#### rgbToHue

获取 RGB 颜色的色相。

```typescript
function rgbToHue(rgb: RGB): [number, number, number, number];
```

**参数**

| 参数 | 类型  | 描述     |
| ---- | ----- | -------- |
| rgb  | `RGB` | RGB 颜色 |

**返回值**

`[number, number, number, number]` - [色相, 饱和度, 明度, 原始值]

**示例**

```typescript
rgbToHue({ r: 255, g: 0, b: 0 }); // [0, 100, 100, ...]
```
