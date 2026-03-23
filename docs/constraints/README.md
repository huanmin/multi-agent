# Architectural Constraints

## 概述

架构约束通过自动化工具强制执行代码质量和架构规则，确保系统的一致性和可维护性。

## 约束层次

```
┌─────────────────────────────────────────────────────┐
│            Architectural Constraints                 │
├───────────────────┬─────────────────────────────────┤
│   Static Analysis │       Runtime Checks            │
├───────────────────┼─────────────────────────────────┤
│ • Linting         │ • Layer Guard                   │
│ • Type Checking   │ • Dependency Injection          │
│ • Code Formatting │ • Interface Boundaries          │
│ • Import Rules    │ • API Contracts                 │
└───────────────────┴─────────────────────────────────┘
```

## 工具栈

| 工具 | 用途 | 配置文件 |
|------|------|----------|
| ESLint | JavaScript/TypeScript 静态分析 | `.eslintrc.yml` |
| Prettier | 代码格式化 | `.prettierrc` |
| TypeScript | 类型检查 | `tsconfig.json` |
| Layer Guard | 分层架构检查 | `layer-guard.config.yml` |
| Import Lint | 导入规则检查 | `.importlintrc.json` |

## 执行流程

```yaml
pre-commit:
  - lint:check
  - format:check
  - type:check

pre-push:
  - layer:check
  - import:check

ci:
  - all checks
  - report generation
```