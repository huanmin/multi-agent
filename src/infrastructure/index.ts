/**
 * 基础设施层入口
 *
 * 实现领域层定义的接口，提供技术支持
 */

/**
 * 基础设施配置
 */
export interface InfrastructureConfig {
  database: DatabaseConfig;
  cache: CacheConfig;
  messaging: MessagingConfig;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
}

export interface CacheConfig {
  host: string;
  port: number;
  ttl: number;
}

export interface MessagingConfig {
  broker: string;
  topic: string;
}

/**
 * 可观测性客户端
 */
export class ObservabilityClient {
  private metricsEnabled: boolean;
  private tracesEnabled: boolean;
  private logsEnabled: boolean;

  constructor(config: { metrics: boolean; traces: boolean; logs: boolean }) {
    this.metricsEnabled = config.metrics;
    this.tracesEnabled = config.traces;
    this.logsEnabled = config.logs;
  }

  recordMetric(_name: string, _value: number, _labels?: Record<string, string>): void {
    if (this.metricsEnabled) {
      // Prometheus 指标记录
    }
  }

  startSpan(_name: string): Span {
    if (this.tracesEnabled) {
      // OpenTelemetry Span
    }
    return new NoopSpan();
  }

  log(_level: string, _message: string, _context?: Record<string, unknown>): void {
    if (this.logsEnabled) {
      // 结构化日志
    }
  }
}

export interface Span {
  end(): void;
  setAttribute(key: string, value: unknown): void;
}

class NoopSpan implements Span {
  end(): void {}
  setAttribute(): void {}
}