# Multi-Agent System

基于 Martin Fowler Harness Engineering 三分类架构的多智能体系统。

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                    Harness Engineering                       │
├─────────────────────┬───────────────────┬───────────────────┤
│  Context            │  Architectural    │  Garbage          │
│  Engineering        │  Constraints      │  Collection       │
├─────────────────────┼───────────────────┼───────────────────┤
│  • docs/            │  • linter rules   │  • Gardener Agent │
│  • observability    │  • layer checks   │  • cleanup jobs   │
│  • knowledge base   │  • type safety    │  • deprecation    │
└─────────────────────┴───────────────────┴───────────────────┘
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行检查
npm run check

# 启动可观测性栈
docker-compose -f observability/docker-compose.yml up -d
```

## 目录结构

```
multi-agent/
├── docs/                    # 文档中心
│   ├── context/             # 上下文文档
│   ├── observability/       # 可观测性配置
│   ├── constraints/         # 架构约束
│   └── guides/              # 指南
├── src/                     # 源代码
│   ├── presentation/        # 表现层
│   ├── application/         # 应用层
│   ├── domain/              # 领域层
│   └── infrastructure/      # 基础设施层
├── tests/                   # 测试
├── observability/           # 可观测性栈
│   ├── prometheus/          # Prometheus 配置
│   ├── grafana/             # Grafana 配置
│   ├── loki/                # Loki 配置
│   └── otel/                # OpenTelemetry 配置
├── agents/                  # 智能体
│   └── gardener/            # 园丁代理
└── .github/workflows/       # CI/CD 工作流
```

## 核心组件

### 1. Context Engineering

维护项目上下文和知识库：

- [架构文档](docs/context/ARCHITECTURE.md)
- [决策记录](docs/context/DECISIONS.md)
- [设计模式](docs/context/PATTERNS.md)

### 2. Architectural Constraints

通过自动化工具强制执行架构规则：

- ESLint 配置
- 分层架构检查
- 类型安全

### 3. Garbage Collection

园丁代理自动维护代码库健康：

- 过期文件检测
- 未使用依赖清理
- 死代码检测

## 可观测性

| 组件 | 端口 | 用途 |
|------|------|------|
| Prometheus | 9090 | 指标收集 |
| Grafana | 3000 | 可视化 |
| Loki | 3100 | 日志聚合 |
| Jaeger | 16686 | 分布式追踪 |

## 开发

```bash
# 开发模式
npm run dev

# 运行测试
npm run test

# 代码检查
npm run lint

# 格式化
npm run format

# 类型检查
npm run typecheck

# 完整检查
npm run check
```

## 文档

- [贡献指南](docs/guides/CONTRIBUTING.md)
- [可观测性文档](docs/observability/README.md)
- [架构约束](docs/constraints/README.md)

## License

MIT