# Gardener Agent - 园丁代理

## 概述

园丁代理 (Gardener Agent) 是一个自动化智能体，负责代码库的健康维护和垃圾回收。

## 职责

```
┌─────────────────────────────────────────────────────┐
│               Gardener Agent                         │
├─────────────────────────────────────────────────────┤
│  1. 过期检测                                         │
│     • Stale branches                                 │
│     • Unused dependencies                            │
│     • Dead code                                      │
├─────────────────────────────────────────────────────┤
│  2. 清理执行                                         │
│     • Archive old files                              │
│     • Remove duplicates                              │
│     • Prune dependencies                             │
├─────────────────────────────────────────────────────┤
│  3. 维护报告                                         │
│     • Health metrics                                 │
│     • Cleanup logs                                   │
│     • Recommendations                                │
└─────────────────────────────────────────────────────┘
```

## 配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `check_interval` | 检查间隔 | `1h` |
| `stale_threshold` | 过期阈值 | `30d` |
| `archive_threshold` | 归档阈值 | `90d` |
| `delete_threshold` | 删除阈值 | `180d` |

## 工作流

```yaml
schedule:
  - name: daily_cleanup
    cron: "0 2 * * *"  # 每天凌晨2点
    tasks:
      - check_stale_files
      - check_unused_deps
      - generate_report

  - name: weekly_deep_clean
    cron: "0 3 * * 0"  # 每周日凌晨3点
    tasks:
      - deep_scan
      - archive_old_files
      - prune_dead_code
```