---
outline: deep
---

# regexp

正则表达式工具。

## 导入

```typescript
import {
  regexpEscape,
  isEmail,
  isPhone,
  isIDNo,
  isURL,
  isIPV4,
  isInteger,
  isFloat,
  isNumerical,
  isDigit,
} from '@cloudcome/utils-core/regexp';
```

## 函数

### regexpEscape

转义正则表达式特殊字符。

```typescript
function regexpEscape(string: string): string;
```

**参数**

| 参数   | 类型     | 描述           |
| ------ | -------- | -------------- |
| string | `string` | 要转义的字符串 |

**返回值**

`string` - 转义后的字符串

**示例**

```typescript
regexpEscape('hello.world'); // 'hello\\.world'
regexpEscape('$100'); // '\\$100'
regexpEscape('(test)'); // '\\(test\\)'
```

### isEmail

判断是否为有效的邮箱地址。

```typescript
function isEmail(value: string): boolean;
```

**参数**

| 参数  | 类型     | 描述           |
| ----- | -------- | -------------- |
| value | `string` | 要检查的字符串 |

**返回值**

`boolean` - 是否为有效的邮箱地址

**示例**

```typescript
isEmail('user@example.com'); // true
isEmail('user.name+tag@example.com'); // true
isEmail('user@'); // false
isEmail('@example.com'); // false
```

### isPhone

判断是否为有效的手机号码（中国大陆）。

```typescript
function isPhone(value: string): boolean;
```

**参数**

| 参数  | 类型     | 描述           |
| ----- | -------- | -------------- |
| value | `string` | 要检查的字符串 |

**返回值**

`boolean` - 是否为有效的手机号码

**示例**

```typescript
isPhone('13800138000'); // true
isPhone('15912345678'); // true
isPhone('12345678901'); // false
isPhone('1380013800'); // false
```

### isIDNo

判断是否为有效的身份证号码（中国大陆）。

```typescript
function isIDNo(value: string): boolean;
```

**参数**

| 参数  | 类型     | 描述           |
| ----- | -------- | -------------- |
| value | `string` | 要检查的字符串 |

**返回值**

`boolean` - 是否为有效的身份证号码

**示例**

```typescript
isIDNo('110101199003074518'); // true（18 位，校验码正确）
isIDNo('11010119900307451X'); // true（18 位，X 校验码）
isIDNo('110101990307451'); // false（不支持 15 位）
isIDNo('123456789012345678'); // false（地区码或日期不合法）
```

**说明**

- 仅支持 18 位身份证号码
- 会校验地区码（11-82、91）、出生日期合法性、以及最后一位校验码
- 年份范围限定为 1800-2099

### isURL

判断是否为有效的 URL。

```typescript
function isURL(value: string): boolean;
```

**参数**

| 参数  | 类型     | 描述           |
| ----- | -------- | -------------- |
| value | `string` | 要检查的字符串 |

**返回值**

`boolean` - 是否为有效的 URL

**示例**

```typescript
isURL('https://example.com'); // true
isURL('http://example.com/path?query=1'); // true
isURL('ftp://example.com'); // false（仅支持 http/https）
isURL('example.com'); // false（缺少协议）
```

### isIPV4

判断是否为有效的 IPv4 地址。

```typescript
function isIPV4(value: string): boolean;
```

**参数**

| 参数  | 类型     | 描述           |
| ----- | -------- | -------------- |
| value | `string` | 要检查的字符串 |

**返回值**

`boolean` - 是否为有效的 IPv4 地址

**示例**

```typescript
isIPV4('192.168.1.1'); // true
isIPV4('10.0.0.1'); // true
isIPV4('256.0.0.1'); // false
isIPV4('192.168.1'); // false
```

### isInteger

判断是否为整数字符串。

```typescript
function isInteger(value: string): boolean;
```

**参数**

| 参数  | 类型     | 描述           |
| ----- | -------- | -------------- |
| value | `string` | 要检查的字符串 |

**返回值**

`boolean` - 是否为整数字符串

**示例**

```typescript
isInteger('123'); // true
isInteger('-123'); // true
isInteger('0'); // true
isInteger('+123'); // false（不支持 + 前缀）
isInteger('12.3'); // false
isInteger('abc'); // false
```

### isFloat

判断是否为浮点数字符串。

```typescript
function isFloat(value: string): boolean;
```

**参数**

| 参数  | 类型     | 描述           |
| ----- | -------- | -------------- |
| value | `string` | 要检查的字符串 |

**返回值**

`boolean` - 是否为浮点数字符串

**示例**

```typescript
isFloat('12.3'); // true
isFloat('-12.3'); // true
isFloat('0.5'); // true
isFloat('+12.3'); // false（不支持 + 前缀）
isFloat('.3'); // false（必须有整数部分）
isFloat('123'); // false（必须有小数点）
isFloat('abc'); // false
```

### isNumerical

判断是否为数值字符串（整数或浮点数）。

```typescript
function isNumerical(value: string): boolean;
```

**参数**

| 参数  | 类型     | 描述           |
| ----- | -------- | -------------- |
| value | `string` | 要检查的字符串 |

**返回值**

`boolean` - 是否为数值字符串

**示例**

```typescript
isNumerical('123'); // true
isNumerical('12.3'); // true
isNumerical('-12.3'); // true
isNumerical('abc'); // false
```

### isDigit

判断是否为纯数字字符串。

```typescript
function isDigit(value: string): boolean;
```

**参数**

| 参数  | 类型     | 描述           |
| ----- | -------- | -------------- |
| value | `string` | 要检查的字符串 |

**返回值**

`boolean` - 是否为纯数字字符串

**示例**

```typescript
isDigit('123'); // true
isDigit('0'); // true
isDigit('12.3'); // false
isDigit('-123'); // false
isDigit('abc'); // false
```
