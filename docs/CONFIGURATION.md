# 项目配置文件说明

## 配置文件清单

| 文件 | 用途 | 说明 |
|------|------|------|
| `package.json` | 项目配置 | 依赖、脚本、元数据 |
| `tsconfig.json` | TypeScript 配置 | 编译选项、路径映射 |
| `.eslintrc.json` | ESLint 配置 | 代码质量规则 |
| `.prettierrc` | Prettier 配置 | 代码格式化 |
| `.editorconfig` | 编辑器配置 | 统一编辑器行为 |
| `.gitignore` | Git 忽略 | 排除版本控制的文件 |
| `.importlintrc.json` | Import Lint 配置 | 导入规则检查 |
| `layer-guard.config.yml` | 分层架构配置 | 依赖方向检查 |

## 环境变量

创建 `.env` 文件：

```env
# 应用
NODE_ENV=development
PORT=3000

# 可观测性
METRICS_ENABLED=true
TRACING_ENABLED=true
LOG_LEVEL=debug

# 数据库
DATABASE_URL=postgresql://user:pass@localhost:5432/multi_agent

# 缓存
REDIS_URL=redis://localhost:6379
```

## 路径别名

在 `tsconfig.json` 中定义：

```json
{
  "paths": {
    "@/*": ["src/*"],
    "@presentation/*": ["src/presentation/*"],
    "@application/*": ["src/application/*"],
    "@domain/*": ["src/domain/*"],
    "@infrastructure/*": ["src/infrastructure/*"]
  }
}
```