# 设计模式与最佳实践

## 模式目录

### 1. 上下文管理模式

#### Pattern: Knowledge Graph
维护项目知识图谱，支持语义查询和关系追踪。

```
Entity → Relation → Entity
   ↓
Property: value
```

#### Pattern: Context Window
定义上下文窗口大小和优先级策略。

```yaml
context_window:
  max_tokens: 128000
  priority:
    - architecture_docs: high
    - code_context: medium
    - historical_data: low
```

### 2. 约束模式

#### Pattern: Layer Guard
确保依赖方向正确。

```python
# 允许: presentation → application → domain
# 禁止: domain → application
# 例外: domain ← infrastructure (接口反转)
```

#### Pattern: API Boundary
定义模块间通信边界。

```
Module A ←── API Contract ──→ Module B
         (明确接口)
```

### 3. 清理模式

#### Pattern: Lifecycle Policy
定义资源生命周期策略。

```yaml
lifecycle:
  draft:
    ttl: 7d
    action: notify
  stale:
    ttl: 30d
    action: archive
  deprecated:
    ttl: 90d
    action: delete
```

## 最佳实践

### 文档编写

1. **DRY (Don't Repeat Yourself)** - 使用链接而非复制
2. **单一职责** - 每个文档只解决一个问题
3. **版本控制** - 重要决策记录 ADR

### 代码组织

1. **按层分包** - 遵循分层架构
2. **依赖注入** - 便于测试和替换
3. **接口隔离** - 小而专注的接口

### 测试策略

1. **测试金字塔** - 单元测试多，集成测试少
2. **契约测试** - 模块间接口验证
3. **快照测试** - 输出稳定性检查