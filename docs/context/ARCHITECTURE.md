# 系统架构文档

## 架构概览

本项目采用 Martin Fowler 的 Harness Engineering 三分类架构：

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

## 分层架构

```
┌──────────────────────────────────────┐
│           Presentation Layer         │  ← API/UI 接口
├──────────────────────────────────────┤
│           Application Layer          │  ← 用例/工作流
├──────────────────────────────────────┤
│           Domain Layer               │  ← 核心业务逻辑
├──────────────────────────────────────┤
│           Infrastructure Layer       │  ← 外部依赖/工具
└──────────────────────────────────────┘
```

## 目录结构规范

```
multi-agent/
├── docs/                    # 文档中心
│   ├── context/             # 上下文文档
│   └── observability/       # 可观测性配置
├── src/                     # 源代码
│   ├── presentation/        # 表现层
│   ├── application/         # 应用层
│   ├── domain/              # 领域层
│   └── infrastructure/      # 基础设施层
├── tests/                   # 测试
├── .github/                 # GitHub 配置
│   └── workflows/           # CI/CD 工作流
├── observability/           # 可观测性栈
│   ├── metrics/             # 指标收集
│   ├── traces/              # 分布式追踪
│   └── logs/                # 日志聚合
└── agents/                  # 智能体配置
    └── gardener/            # 园丁代理
```

## 依赖规则

- 表现层 → 应用层 → 领域层
- 基础设施层实现领域层定义的接口
- 领域层不依赖任何外层