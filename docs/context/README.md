# Context Engineering

## 概述

Context Engineering 负责管理 AI 系统的上下文信息，确保智能体能够获取、理解和利用项目知识。

## 目录结构

```
docs/
├── context/
│   ├── ARCHITECTURE.md    # 系统架构文档
│   ├── DECISIONS.md       # 架构决策记录 (ADR)
│   ├── PATTERNS.md        # 设计模式与最佳实践
│   └── GLOSSARY.md        # 术语表
├── observability/
│   ├── metrics.md         # 指标定义
│   ├── traces.md          # 追踪配置
│   └── logs.md            # 日志规范
└── guides/
    └── CONTRIBUTING.md    # 贡献指南
```

## 核心原则

1. **可发现性** - 文档结构清晰，易于导航
2. **时效性** - 文档与代码同步更新
3. **可观测性** - 系统行为透明可追踪
4. **版本化** - 所有上下文变更可追溯