## Context

当前 `@cloudcome/utils-core` 提供了 `defineException()` 工具函数，用于创建自定义 Error 子类。该函数实质返回一个匿名类继承 Error，额外提供了消息格式化功能（`[Name] message`）。

下游唯一使用者是 `@cloudcome/utils-uni` 的 `database/error.ts`，用于定义 `DbException`。

这个封装层带来的价值有限：自定义 Error 子类本就可以直接 `class extends Error` 实现，且更灵活（可添加方法、静态属性等）。间接层反而增加了理解和维护成本。

## Goals / Non-Goals

**Goals:**

- 删除 `@cloudcome/utils-core` 中的 `exception.ts` 模块
- 删除关联的测试和文档
- 将唯一下游 `database/error.ts` 中的 `DbException` 改造为 `class extends Error`
- 保持 `DbException` 的公开 API（`errCode`、`code`、`isDbException`）不变

**Non-Goals:**

- 不改变 `DbException` 的行为语义
- 不涉及其他模块的错误处理机制改动
- 不引入新的错误定义方式

## Decisions

### 1. DbException 改用 class extends Error

`defineException` 版本:

```ts
export const DbException = defineException<{
  errCode: string | number;
  code: string;
}>('DbError');
// message 格式: "[DbError] E11000 duplicate key..."
```

替换为:

```ts
export class DbException extends Error {
  errCode: string | number;
  code: string;

  constructor(message: string, extra: { errCode: string | number; code: string }) {
    super(message);
    this.name = 'DbError';
    this.errCode = extra.errCode;
    this.code = extra.code;
  }
}
// message 格式: "E11000 duplicate key..."（不保留前缀）
```

**原因**: 不保留 `[DbError]` 前缀。原始 `errMsg` 已经足够表达错误信息（如 `E11000 duplicate key error...`），额外前缀干扰 readbility。如果调用方需要识别错误来源，应使用 `isDbException()` 或 `err.name === 'DbError'`。

### 2. isDbException 类型守卫不变

```ts
export function isDbException(err: unknown): err is DbException {
  return err instanceof DbException;
}
```

`instanceof` 对 class 和 defineException 都正常工作，无需改动。

### 3. parseError 回调类型引用更新

`_db.class.ts` 和 `proxy.ts` 中 `parseError` 的类型当前使用 `InstanceType<typeof DbException>`，因 `DbException` 从 const（defineException 返回值）变为 class，可直接使用 `DbException` 类型。

Before: `parseError?: (error: InstanceType<typeof DbException>) => Error;`
After: `parseError?: (error: DbException) => Error;`

## Risks / Trade-offs

- **[低风险] 消息格式变化**: `DbException.message` 不再有 `[DbError]` 前缀。此前如果任何代码依赖 `message` 的格式做字符串匹配，需要调整。通过代码搜索确认无此类依赖。
- **[无风险] 类型兼容**: `class extends Error` 和 `defineException` 返回值在类型层面都是 `Error` 子类，对外接口一致。
- **[无风险] 实例检查**: `instanceof` 对 class 和 defineException 的匿名类都正常工作。
