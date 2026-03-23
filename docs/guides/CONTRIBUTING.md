# Contributing to Multi-Agent

感谢您有兴趣为本项目做出贡献！

## 开发环境设置

### 前置要求

- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker & Docker Compose (用于可观测性栈)

### 安装

```bash
# 克隆仓库
git clone <repository-url>
cd multi-agent

# 安装依赖
npm install

# 启动可观测性栈
docker-compose -f observability/docker-compose.yml up -d
```

## 项目架构

本项目采用 Harness Engineering 三分类架构：

```
┌─────────────────────────────────────────────────────┐
│  Context Engineering   │  Architectural Constraints │
│  - docs/               │  - linter rules            │
│  - observability       │  - layer checks            │
│  - knowledge base      │  - type safety             │
├─────────────────────────────────────────────────────┤
│  Garbage Collection                                  │
│  - Gardener Agent                                    │
│  - cleanup jobs                                      │
│  - deprecation management                            │
└─────────────────────────────────────────────────────┘
```

## 分层架构规范

```
src/
├── presentation/     # 表现层 - API/UI
├── application/      # 应用层 - 用例
├── domain/          # 领域层 - 核心逻辑
└── infrastructure/  # 基础设施层 - 外部依赖
```

### 依赖规则

- ✅ `presentation` → `application` → `domain`
- ✅ `infrastructure` → `domain` (依赖反转)
- ❌ `domain` → 任何外层
- ❌ `application` → `infrastructure`

## 开发工作流

### 1. 创建分支

```bash
# 功能分支
git checkout -b feature/your-feature

# 修复分支
git checkout -b fix/your-fix
```

### 2. 编写代码

- 遵循 ESLint 规则
- 保持分层架构
- 编写单元测试

### 3. 本地检查

```bash
# 运行所有检查
npm run check

# 或分别运行
npm run lint
npm run format:check
npm run typecheck
npm run layer:check
npm run test
```

### 4. 提交代码

我们使用 Conventional Commits：

```
feat: add new feature
fix: fix a bug
docs: update documentation
refactor: refactor code
test: add tests
chore: maintenance tasks
```

### 5. 创建 Pull Request

- 填写 PR 模板
- 关联相关 Issue
- 等待 CI 检查通过

## 代码规范

### TypeScript

```typescript
// 使用显式类型
function process(data: InputData): OutputData {
  // ...
}

// 使用接口定义契约
interface Repository {
  findById(id: string): Promise<Entity>;
}
```

### 测试

```typescript
describe('MyComponent', () => {
  it('should do something', () => {
    // Arrange
    const input = createInput();

    // Act
    const result = process(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

## 可观测性

### 访问仪表盘

- Grafana: http://localhost:3000 (admin/admin)
- Prometheus: http://localhost:9090
- Jaeger: http://localhost:16686

### 添加自定义指标

```typescript
import { Counter, Gauge } from 'prom-client';

const requestCounter = new Counter({
  name: 'my_requests_total',
  help: 'Total requests',
  labelNames: ['operation'],
});
```

## 园丁代理

园丁代理自动维护代码库健康：

```bash
# 手动运行扫描
npm run gardener:scan

# 运行清理（dry-run）
npm run gardener:cleanup -- --dry-run

# 导出指标
npm run gardener:metrics
```

## 获取帮助

- 查看 [文档](docs/)
- 提出 [Issue](https://github.com/.../issues)
- 加入 [讨论](https://github.com/.../discussions)