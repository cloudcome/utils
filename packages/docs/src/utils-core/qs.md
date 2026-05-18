---
outline: deep
---

# qs

查询字符串解析与序列化工具。

## 导入

```typescript
import { qsParse, qsStringify } from '@cloudcome/utils-core/qs';
import type { QSReader, QSWriter } from '@cloudcome/utils-core/qs';
```

## 类型定义

### QSReader\<T\>

```typescript
type QSReader<T extends AnyObject> = (value: string, key: string, qsObject: T) => unknown;
```

### QSWriter\<T\>

```typescript
type QSWriter<T extends AnyObject = AnyObject> = (value: unknown, key: string, query: T) => string | null;
```

## 函数

### qsParse

解析查询字符串为对象。

```typescript
function qsParse<T extends AnyObject>(queryString: string, parser?: QSReader<T>): T;
```

**参数**

| 参数        | 类型          | 描述                                   |
| ----------- | ------------- | -------------------------------------- |
| queryString | `string`      | 查询字符串（可以包含或不包含前导 `?`） |
| parser      | `QSReader<T>` | 可选，自定义解析函数                   |

**返回值**

`T` - 解析后的对象

**示例**

```typescript
// 基本用法
qsParse('key=value&foo=bar'); // { key: 'value', foo: 'bar' }
qsParse('?key=value&foo=bar'); // { key: 'value', foo: 'bar' }

// 解析数组（重复键自动转为数组）
qsParse('ids=1&ids=2&ids=3'); // { ids: ['1', '2', '3'] }

// 自定义解析
qsParse('key=value', (value, key) => {
  return value.toUpperCase();
}); // { key: 'VALUE' }
```

### qsStringify

将对象序列化为查询字符串。

```typescript
function qsStringify<T extends AnyObject>(qsObject: T, stringify?: QSWriter<T>): string;
```

**参数**

| 参数      | 类型          | 描述                   |
| --------- | ------------- | ---------------------- |
| qsObject  | `T`           | 要序列化的对象         |
| stringify | `QSWriter<T>` | 可选，自定义序列化函数 |

**返回值**

`string` - 序列化后的查询字符串

**示例**

```typescript
// 基本用法
qsStringify({ key: 'value', foo: 'bar' }); // 'key=value&foo=bar'

// 序列化数组（重复键）
qsStringify({ ids: [1, 2, 3] }); // 'ids=1&ids=2&ids=3'

// 默认序列化类型：string、number、boolean、Date
qsStringify({ str: 'hello', num: 42, bool: true, date: new Date('2023-01-01') });
// 'str=hello&num=42&bool=true&date=2023-01-01T00:00:00.000Z'

// 自定义序列化
qsStringify({ key: 'value' }, (value, key) => {
  if (value === null) return null; // 跳过 null 值
  return String(value);
});
```
