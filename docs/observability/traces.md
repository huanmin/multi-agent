# 追踪配置

## OpenTelemetry 配置

### 埋点规范

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider

# 初始化追踪
tracer = trace.get_tracer(__name__)

@tracer.start_as_current_span("agent_operation")
def process_request(request):
    span = trace.get_current_span()
    span.set_attribute("agent.id", request.agent_id)
    span.set_attribute("agent.operation", request.operation)

    with tracer.start_as_current_span("tool_call") as tool_span:
        tool_span.set_attribute("tool.name", request.tool_name)
        result = execute_tool(request.tool_name, request.params)

    return result
```

## Span 属性标准

### 通用属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `service.name` | string | 服务名称 |
| `service.version` | string | 服务版本 |
| `deployment.environment` | string | 部署环境 |

### Agent 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `agent.id` | string | 智能体标识 |
| `agent.name` | string | 智能体名称 |
| `agent.model` | string | 使用的模型 |
| `agent.operation` | string | 操作类型 |

### Tool 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `tool.name` | string | 工具名称 |
| `tool.call.id` | string | 调用标识 |
| `tool.params` | string | 参数（脱敏） |
| `tool.result.status` | string | 结果状态 |

## 追踪采样策略

```yaml
# 采样配置
sampling:
  # 默认采样率
  default_rate: 0.1

  # 基于规则的采样
  rules:
    # 错误请求全量采样
    - match:
        span.kind: server
        status.code: error
      rate: 1.0

    # 慢请求全量采样
    - match:
        duration_ms:
          gt: 5000
      rate: 1.0

    # Agent 操作高采样
    - match:
        agent.operation: "*"
      rate: 0.5

    # 健康检查低采样
    - match:
        http.route: /health
      rate: 0.01
```

## Jaeger 配置

```yaml
# jaeger-config.yaml
collector:
  zipkin:
    http:
      host-port: 0.0.0.0:9411

storage:
  type: elasticsearch
  elasticsearch:
    server-urls: http://elasticsearch:9200
    index-prefix: jaeger

query:
  base-path: /
  ui-config: /etc/jaeger/ui.json
```

## 上下文传播

### W3C Trace Context

```
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
tracestate: vendor=value
```

### Baggage 传播

```python
from opentelemetry import baggage

# 设置 baggage
ctx = baggage.set_baggage("user.id", "12345")
ctx = baggage.set_baggage("request.priority", "high", context=ctx)

# 获取 baggage
user_id = baggage.get_baggage("user.id")
```

## 追踪可视化

### 服务依赖图

```
┌─────────────┐     ┌─────────────┐
│   Client    │────▶│    API      │
└─────────────┘     └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  Agent   │ │  Tool    │ │   DB     │
        │ Service  │ │ Service  │ │          │
        └──────────┘ └──────────┘ └──────────┘
```

### 追踪瀑布图示例

```
Span                    Duration
─────────────────────────────────────────────
agent_request           ████████████████ 200ms
  ├─ context_load       ██░░░░░░░░░░░░░░  25ms
  ├─ tool_prepare       █░░░░░░░░░░░░░░░  15ms
  ├─ tool_execute       █████████░░░░░░ 110ms
  │   └─ api_call       ████░░░░░░░░░░░░  50ms
  └─ response_format    ██░░░░░░░░░░░░░░  20ms
```