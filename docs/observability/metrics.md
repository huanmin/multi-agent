# 指标定义

## 核心指标

### RED 方法 (Rate, Errors, Duration)

| 指标名称 | 类型 | 描述 | 标签 |
|----------|------|------|------|
| `agent_requests_total` | Counter | 智能体请求总数 | agent, operation, status |
| `agent_request_duration_seconds` | Histogram | 请求延迟分布 | agent, operation |
| `agent_errors_total` | Counter | 错误总数 | agent, error_type |

### USE 方法 (Utilization, Saturation, Errors)

| 指标名称 | 类型 | 描述 | 标签 |
|----------|------|------|------|
| `agent_context_utilization` | Gauge | 上下文窗口使用率 | agent |
| `agent_token_saturation` | Gauge | Token 饱和度 | agent, model |
| `agent_tool_errors_total` | Counter | 工具调用错误 | agent, tool |

## 自定义指标

### Context Engineering 指标

```yaml
# 上下文窗口指标
- name: context_window_tokens
  type: gauge
  description: 当前上下文窗口 token 数
  labels: [agent, window_type]

- name: context_cache_hits
  type: counter
  description: 上下文缓存命中次数
  labels: [agent, cache_type]

- name: context_freshness_seconds
  type: gauge
  description: 上下文新鲜度（秒）
  labels: [agent, context_type]
```

### Architectural Constraints 指标

```yaml
# 架构约束指标
- name: layer_violation_total
  type: counter
  description: 分层违规次数
  labels: [source_layer, target_layer, rule]

- name: lint_errors_total
  type: counter
  description: Lint 错误次数
  labels: [severity, rule_id, file]

- name: type_check_errors
  type: gauge
  description: 类型检查错误数
  labels: [severity]
```

### Garbage Collection 指标

```yaml
# 垃圾回收指标
- name: gc_items_collected
  type: counter
  description: 回收的项目数
  labels: [type, action]

- name: gc_stale_files
  type: gauge
  description: 过期文件数
  labels: [category, age_bucket]

- name: gc_cleanup_duration_seconds
  type: histogram
  description: 清理操作耗时
  labels: [operation]
```

## Prometheus 配置

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'agents'
    static_configs:
      - targets: ['localhost:9090']
    metrics_path: '/metrics'

  - job_name: 'gardener'
    static_configs:
      - targets: ['localhost:9091']
```

## 告警规则

```yaml
groups:
  - name: agent_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(agent_errors_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"

      - alert: ContextWindowExhaustion
        expr: agent_context_utilization > 0.9
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Context window near exhaustion"

      - alert: LayerViolation
        expr: increase(layer_violation_total[1h]) > 10
        labels:
          severity: warning
        annotations:
          summary: "Multiple layer violations detected"
```