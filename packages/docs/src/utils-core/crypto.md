---
outline: deep
---

# crypto

加密工具，提供 MD5、SHA1、SHA256、SHA512 等哈希算法。

## 导入

```typescript
import { md5String, sha1String, sha256String, sha512String } from '@cloudcome/utils-core/crypto'
```

## 函数

### md5String

计算字符串的 MD5 哈希值。

```typescript
function md5String(input: string): string
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| input | `string` | 要计算哈希的字符串 |

**返回值**

`string` - 32 字符的十六进制 MD5 哈希值

**示例**

```typescript
md5String('hello') // '5d41402abc4b2a76b9719d911017c592'
md5String('world') // '7d793037a0760186574b0282f2f435e7'
```

### sha1String

计算字符串的 SHA1 哈希值。

```typescript
function sha1String(input: string): string
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| input | `string` | 要计算哈希的字符串 |

**返回值**

`string` - 40 字符的十六进制 SHA1 哈希值

**示例**

```typescript
sha1String('hello') // 'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d'
sha1String('world') // '7c222fb2927d828af22f592134e8932480637c0d'
```

### sha256String

计算字符串的 SHA256 哈希值。

```typescript
function sha256String(input: string): string
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| input | `string` | 要计算哈希的字符串 |

**返回值**

`string` - 64 字符的十六进制 SHA256 哈希值

**示例**

```typescript
sha256String('hello') // '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
sha256String('world') // '486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7'
```

### sha512String

计算字符串的 SHA512 哈希值。

```typescript
function sha512String(input: string): string
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| input | `string` | 要计算哈希的字符串 |

**返回值**

`string` - 128 字符的十六进制 SHA512 哈希值

**示例**

```typescript
sha512String('hello') // '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043'
sha512String('world') // '11853df40f4b2b919d3815f64792e58d08663767a494bcbb38c0b2389d9140bbb170281b4a847be7757bde12c9cd0054ce3652d0ad3a1a0c92babb69798246ee'
```
