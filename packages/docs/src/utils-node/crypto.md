---
outline: deep
---

# crypto

加密工具，提供 MD5、SHA1、SHA256、SHA512 等哈希算法。

## 导入

```typescript
import { md5String, sha1String, sha256String, sha512String } from '@cloudcome/utils-node/crypto'
```

## 函数

### md5String

计算字符串的 MD5 哈希值。

```typescript
function md5String(input: string): string
```

**参数**

| 参数  | 类型     | 描述               |
| ----- | -------- | ------------------ |
| input | `string` | 要计算哈希的字符串 |

**返回值**

`string` - 32 字符的十六进制 MD5 哈希值

**示例**

```typescript
md5String('hello world') // '5eb63bbbe01eeed093cb22bb8f5acdc3'
md5String('') // 'd41d8cd98f00b204e9800998ecf8427e'
md5String('123456') // 'e10adc3949ba59abbe56e057f20f883e'
```

### sha1String

计算字符串的 SHA1 哈希值。

```typescript
function sha1String(input: string): string
```

**参数**

| 参数  | 类型     | 描述               |
| ----- | -------- | ------------------ |
| input | `string` | 要计算哈希的字符串 |

**返回值**

`string` - 40 字符的十六进制 SHA1 哈希值

**示例**

```typescript
sha1String('hello world') // '2aae6c35c94fcfb415dbe95f408b9ce91ee846ed'
sha1String('') // 'da39a3ee5e6b4b0d3255bfef95601890afd80709'
sha1String('123456') // '7c4a8d09ca3762af61e59520943dc26494f8941b'
```

### sha256String

计算字符串的 SHA256 哈希值。

```typescript
function sha256String(input: string): string
```

**参数**

| 参数  | 类型     | 描述               |
| ----- | -------- | ------------------ |
| input | `string` | 要计算哈希的字符串 |

**返回值**

`string` - 64 字符的十六进制 SHA256 哈希值

**示例**

```typescript
sha256String('hello world') // 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
sha256String('') // 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
sha256String('123456') // '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'
```

### sha512String

计算字符串的 SHA512 哈希值。

```typescript
function sha512String(input: string): string
```

**参数**

| 参数  | 类型     | 描述               |
| ----- | -------- | ------------------ |
| input | `string` | 要计算哈希的字符串 |

**返回值**

`string` - 128 字符的十六进制 SHA512 哈希值

**示例**

```typescript
sha512String('hello world') // '309ecc489c12d6eb4cc40f50c902f2b4d0ed77ee511a7c7a9bcd3ca86d4cd86f989dd35bc5ff499670da34255b45b0cfd830e81f605dcf7dc5542e93ae9cd76f'
sha512String('') // 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e'
sha512String('123456') // 'ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413'
```

**说明**

所有哈希算法均基于 Node.js 原生 `crypto` 模块，返回十六进制字符串。不同算法的输出长度固定：

- MD5: 32 字符
- SHA1: 40 字符
- SHA256: 64 字符
- SHA512: 128 字符
