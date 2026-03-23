# 日志规范

## 日志级别

| 级别 | 数值 | 用途 |
|------|------|------|
| DEBUG | 10 | 详细调试信息 |
| INFO | 20 | 正常操作信息 |
| WARNING | 30 | 潜在问题警告 |
| ERROR | 40 | 错误但可恢复 |
| CRITICAL | 50 | 严重错误，系统不可用 |

## 结构化日志格式

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "INFO",
  "logger": "agent.executor",
  "message": "Tool execution completed",
  "context": {
    "agent_id": "agent-001",
    "trace_id": "abc123",
    "span_id": "def456"
  },
  "data": {
    "tool_name": "read_file",
    "duration_ms": 150,
    "status": "success"
  },
  "labels": {
    "environment": "production",
    "version": "1.0.0"
  }
}
```

## 日志分类

### 1. 系统日志 (System Logs)

```yaml
# 系统级事件
- category: system
  events:
    - startup
    - shutdown
    - configuration_change
    - health_check
  format: structured
  retention: 30d
```

### 2. 审计日志 (Audit Logs)

```yaml
# 安全和合规
- category: audit
  events:
    - authentication
    - authorization
    - data_access
    - configuration_change
  format: structured
  retention: 365d
  immutable: true
```

### 3. 操作日志 (Operational Logs)

```yaml
# 业务操作
- category: operational
  events:
    - request_received
    - tool_invoked
    - response_sent
    - error_occurred
  format: structured
  retention: 90d
```

### 4. 变更日志 (Change Logs)

```yaml
# 资源变更
- category: change
  events:
    - create
    - update
    - delete
    - state_transition
  format: structured
  retention: 90d
  include_diff: true
```

## 日志输出示例

### Python (structlog)

```python
import structlog

logger = structlog.get_logger()

# 基本日志
logger.info("agent_started", agent_id="agent-001")

# 带上下文
logger.info(
    "tool_execution_completed",
    tool_name="read_file",
    duration_ms=150,
    status="success"
)

# 错误日志
try:
    result = risky_operation()
except Exception as e:
    logger.error(
        "operation_failed",
        error_type=type(e).__name__,
        error_message=str(e),
        exc_info=True
    )
```

### TypeScript (pino)

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label })
  }
});

// 基本日志
logger.info({ agent_id: 'agent-001' }, 'agent_started');

// 子 logger
const agentLogger = logger.child({ agent_id: 'agent-001' });
agentLogger.info({ tool: 'read_file' }, 'tool_invoked');
```

## Loki 配置

```yaml
# loki-config.yaml
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    instance_addr: 127.0.0.1
    kvstore:
      store: inmemory

schema_config:
  configs:
    - from: 2024-01-01
      store: boltdb-shipper
      object_store: filesystem
      schema: v12
      index:
        prefix: loki_index_
        period: 24h

limits_config:
  retention_period: 730h  # 30 days
  max_query_length: 721h
  max_query_parallelism: 32
```

## 日志查询示例

### LogQL 查询

```logql
# 查找错误日志
{level="ERROR"}

# 按 agent 查询
{agent_id="agent-001"}

# 组合查询
{level="ERROR"} |= "timeout"

# 统计错误率
rate({level="ERROR"}[5m])

# 聚合查询
sum by (agent_id) (rate({level="ERROR"}[1h]))
```

## 日志保留策略

```yaml
# 日志生命周期
retention_policy:
  # 实时日志
  hot:
    duration: 24h
    storage: ssd
    compression: none

  # 温存储
  warm:
    duration: 7d
    storage: hdd
    compression: gzip

  # 冷存储
  cold:
    duration: 30d
    storage: s3
    compression: zstd

  # 归档
  archive:
    duration: 365d
    storage: glacier
    compression: zstd
```