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
| `pnpm run docs:dev` | 启动文档站点开发服务器 |
| `pnpm run docs:build` | 构建文档站点 |
| `pnpm run docs:preview` | 预览构建的文档站点 |

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

## 文档

### 文档结构

文档站点使用 [VitePress](https://vitepress.dev/) 构建，源文件位于 `packages/docs/src/` 目录：

```
packages/docs/src/
├── index.md                    # 首页
├── guide/                      # 指南
│   ├── index.md               # 介绍
│   ├── getting-started.md     # 快速开始
│   └── installation.md        # 安装指南
├── utils-core/                 # @cloudcome/utils-core
│   ├── index.md               # 包概览
│   ├── array.md               # array 模块文档
│   ├── date.md                # date 模块文档
│   └── ...                    # 其他模块
├── utils-browser/              # @cloudcome/utils-browser
│   ├── index.md
│   ├── cookie.md
│   └── ...
├── utils-node/                 # @cloudcome/utils-node
│   ├── index.md
│   ├── crypto.md
│   ├── jsonl.md
│   └── ...
├── utils-vue/                  # @cloudcome/utils-vue
│   ├── index.md
│   ├── request.md
│   └── ...
├── utils-react/                # @cloudcome/utils-react
│   └── index.md
└── utils-uni/                  # @cloudcome/utils-uni
    ├── index.md
    └── ...
```

### 文档规范

#### 文件命名

- 每个包一个目录，目录名与包名对应（如 `utils-core`）
- 每个模块一个 `.md` 文件，文件名与模块名对应（如 `array.md`）
- 包概览文件为 `index.md`

#### 文档内容结构

每个模块文档必须包含以下内容：

1. **导入方式**：列出完整的 import 语句
2. **类型定义**：列出该模块导出的所有接口和类型（如有）
3. **函数签名**：每个导出函数的完整签名
4. **参数说明**：使用表格列出每个参数的类型和描述
5. **返回值说明**：函数返回值的类型和描述
6. **使用示例**：至少一个完整的代码示例

#### 文档模板

```markdown
---
outline: deep
---

# 模块名

模块简短描述。

## 导入

\`\`\`typescript
import { functionA, functionB } from '@cloudcome/utils-core/module'
\`\`\`

## 类型定义

### TypeName

\`\`\`typescript
interface TypeName {
  property: type
}
\`\`\`

**属性说明**

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| property | `type` | 描述 |

## 函数

### functionA

函数描述。

\`\`\`typescript
function functionA(param: type): returnType
\`\`\`

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| param | `type` | 描述 |

**返回值**

\`returnType\` - 返回值描述

**示例**

\`\`\`typescript
const result = functionA('value')
\`\`\`
```

### 文档同步流程

当新增或修改模块代码时，需要同步更新文档：

#### 新增模块

1. 在对应包目录下创建模块文档（如 `packages/docs/src/utils-core/new-module.md`）
2. 更新包概览文件（如 `packages/docs/src/utils-core/index.md`）的模块列表
3. 更新 VitePress 配置（`packages/docs/.vitepress/config.mts`）的侧边栏
4. 运行 `pnpm docs:build` 验证文档构建

#### 修改模块

1. 更新对应模块文档中的函数签名、参数、返回值
2. 更新示例代码（如有变更）
3. 运行 `pnpm docs:build` 验证文档构建

#### 文档检查清单

- [ ] 所有导出函数都有文档
- [ ] 函数签名与源码一致
- [ ] 参数类型正确
- [ ] 返回值类型正确
- [ ] 示例代码可运行
- [ ] 无拼写错误

### 文档命令

| 命令 | 说明 |
| --- | --- |
| `pnpm docs:dev` | 启动文档开发服务器（http://localhost:5173/） |
| `pnpm docs:build` | 构建文档站点 |
| `pnpm docs:preview` | 预览构建的文档站点 |

### 文档与代码同步

文档应与代码保持同步。以下情况需要更新文档：

1. **新增导出函数**：添加函数文档
2. **修改函数签名**：更新参数和返回值类型
3. **新增类型定义**：添加类型文档
4. **修改类型定义**：更新类型说明
5. **新增模块**：创建模块文档并更新包概览
6. **删除模块**：删除模块文档并更新包概览
