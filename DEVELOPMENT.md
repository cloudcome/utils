# 开发指引

## 环境要求

- **Node.js** >= 22
- **pnpm** >= 9（项目使用 `packageManager` 字段锁定版本）

## 快速开始

```shell
# 克隆仓库
git clone https://github.com/cloudcome/utils.git
cd utils

# 安装依赖
pnpm install

# 构建所有包
pnpm run build
```

## 项目结构

```
utils/
├── packages/
│   ├── utils-core/       # 核心工具库（@cloudcome/utils-core）
│   ├── utils-browser/    # 浏览器端工具（@cloudcome/utils-browser）
│   ├── utils-node/       # Node.js 端工具（@cloudcome/utils-node）
│   ├── utils-vue/        # Vue 3 工具（@cloudcome/utils-vue）
│   ├── utils-react/      # React 工具（@cloudcome/utils-react）
│   ├── utils-uni/        # UniApp 工具（@cloudcome/utils-uni）
│   ├── helpers/          # 内部辅助工具（代码生成脚本）
│   └── docs/             # 文档站点
├── biome.jsonc           # Biome 配置（格式化 + Lint）
├── commitlint.config.mjs # Commitlint 配置
├── lerna.json            # Lerna-Lite 配置（版本管理）
├── pnpm-workspace.yaml   # pnpm workspace 配置
├── tsconfig.json         # 根 TypeScript 配置
└── vitest.workspace.ts   # Vitest workspace 配置
```

## 常用命令

### 根目录

| 命令 | 说明 |
| --- | --- |
| `pnpm run build` | 构建所有包（排除 docs 和 helpers） |
| `pnpm run test` | 运行所有包的测试 |
| `pnpm run test:coverage` | 运行测试并生成覆盖率报告 |
| `pnpm run lint` | 运行 Biome 检查 + 各包 TypeScript 类型检查 |
| `pnpm run lint:fix` | 自动修复 Lint 问题 |
| `pnpm run docs:serve` | 启动文档站点开发服务器 |
| `pnpm run docs:build` | 构建文档站点 |

### 单个包

在每个包的目录下可执行：

| 命令 | 说明 |
| --- | --- |
| `pnpm run build` | 构建当前包 |
| `pnpm run test` | 运行当前包的测试 |
| `pnpm run test:coverage` | 运行测试并生成覆盖率报告 |
| `pnpm run lint` | TypeScript 类型检查 |
| `pnpm run generate` | 生成代码（通过 helpers 脚本） |

## 创建新工具模块

### 在已有包中添加新模块

以 `utils-core` 为例，添加一个名为 `example` 的新模块：

1. 创建源文件 `packages/utils-core/src/example.ts`：

```typescript
/**
 * 示例函数
 * @param value - 输入值
 * @returns 处理后的结果
 */
export function exampleFunction(value: string): string {
  return value.trim();
}
```

2. 创建测试文件 `packages/utils-core/test/example.test.ts`：

```typescript
import { describe, expect, it } from 'vitest';
import { exampleFunction } from '../src/example';

describe('example', () => {
  it('exampleFunction', () => {
    expect(exampleFunction('  hello  ')).toBe('hello');
  });
});
```

3. 在 `packages/utils-core/package.json` 的 `exports` 中添加导出配置：

```json
"./example": {
  "types": "./dist/example.d.ts",
  "import": "./dist/example.mjs",
  "require": "./dist/example.cjs"
}
```

4. 运行 `pnpm run generate` 自动生成 `typesVersions` 等配置。

### 创建新包

1. 在 `packages/` 下创建新目录
2. 参考现有包的 `package.json`、`tsconfig.json`、`vite.config.mts` 创建配置文件
3. 在根 `pnpm-workspace.yaml` 中确认已包含 `packages/*`

## 代码规范

### Biome

项目使用 [Biome](https://biomejs.dev/) 进行代码格式化和 Lint：

```shell
# 检查
pnpm run lint

# 自动修复
pnpm run lint:fix
```

### TypeScript

每个包使用 `tsc --noEmit` 进行类型检查，确保类型安全。

### Git 提交

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
feat(utils-core): 添加 example 模块
fix(utils-vue): 修复 useRequest 重试逻辑
chore: 更新依赖
```

提交前会自动运行 lint-staged（Biome 格式化 + 检查）。

## 版本发布

使用 Lerna-Lite 管理版本（independent 模式，各包独立版本号）：

```shell
# 在 v*.x 分支上执行版本发布
npx lerna version
```

版本号基于 Conventional Commits 自动计算。

## 测试

- 测试框架：**Vitest**
- 覆盖率工具：**@vitest/coverage-v8**
- 测试文件位于各包的 `test/` 目录
- 测试文件命名：`*.test.ts`

```shell
# 运行所有测试
pnpm run test

# 运行单个包的测试
cd packages/utils-core && pnpm run test

# 生成覆盖率报告
pnpm run test:coverage
```

## 依赖关系

```
utils-core (无外部依赖)
  ├── utils-browser → utils-core
  ├── utils-node
  ├── utils-vue → utils-core, vue
  │   └── utils-uni → utils-core, utils-vue
  └── utils-react
```
