/**
 * Dashboard 领域模型
 *
 * 统计数据和指标计算
 */

import { ValueObject } from '../index';

/**
 * 时间范围枚举
 */
export enum TimeRange {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  ALL = 'all',
}

/**
 * Dashboard 统计数据
 */
export class DashboardStats implements ValueObject {
  tasksCompleted: number;
  estimatedTimeSaved: number;
  avgResponseTime: number;
  tokensInput: number;
  tokensOutput: number;
  costPerInputToken: number;
  costPerOutputToken: number;
  cost: number;
  estimatedValue: number;

  constructor(params: {
    tasksCompleted?: number;
    estimatedTimeSaved?: number;
    avgResponseTime?: number;
    tokensInput?: number;
    tokensOutput?: number;
    costPerInputToken?: number;
    costPerOutputToken?: number;
    cost?: number;
    estimatedValue?: number;
  } = {}) {
    this.tasksCompleted = params.tasksCompleted || 0;
    this.estimatedTimeSaved = params.estimatedTimeSaved || 0;
    this.avgResponseTime = params.avgResponseTime || 0;
    this.tokensInput = params.tokensInput || 0;
    this.tokensOutput = params.tokensOutput || 0;
    this.costPerInputToken = params.costPerInputToken || 0.00001;
    this.costPerOutputToken = params.costPerOutputToken || 0.00003;
    this.cost = params.cost || 0;
    this.estimatedValue = params.estimatedValue || 0;
  }

  /**
   * 计算效率指标
   */
  calculateEfficiency(): {
    tasksPerDay: number;
    timeSaved: number;
    avgResponseTime: number;
    efficiency: number;
  } {
    return {
      tasksPerDay: this.tasksCompleted / 7,
      timeSaved: this.estimatedTimeSaved,
      avgResponseTime: this.avgResponseTime,
      efficiency: this.tasksCompleted > 0 ? this.estimatedTimeSaved / this.tasksCompleted : 0,
    };
  }

  /**
   * 计算成本指标
   */
  calculateCost(): {
    total: number;
    inputCost: number;
    outputCost: number;
    avgCostPerTask: number;
  } {
    const inputCost = this.tokensInput * this.costPerInputToken;
    const outputCost = this.tokensOutput * this.costPerOutputToken;
    const total = inputCost + outputCost;

    return {
      total: Math.round(total * 100) / 100,
      inputCost: Math.round(inputCost * 100) / 100,
      outputCost: Math.round(outputCost * 100) / 100,
      avgCostPerTask: this.tasksCompleted > 0 ? Math.round((total / this.tasksCompleted) * 100) / 100 : 0,
    };
  }

  /**
   * 计算 ROI
   */
  calculateROI(): number {
    if (this.cost === 0) return 0;
    return Math.round(((this.estimatedValue - this.cost) / this.cost) * 10000) / 100;
  }

  /**
   * 按时间范围聚合数据
   */
  static aggregateByRange(
    dailyStats: Array<{ date: string; tasks?: number; tokens?: number }>,
    _range: TimeRange
  ): { totalTasks: number; totalTokens: number; avgPerDay: number } {
    const totalTasks = dailyStats.reduce((sum, s) => sum + (s.tasks || 0), 0);
    const totalTokens = dailyStats.reduce((sum, s) => sum + (s.tokens || 0), 0);

    return {
      totalTasks,
      totalTokens,
      avgPerDay: dailyStats.length > 0 ? Math.round((totalTasks / dailyStats.length) * 100) / 100 : 0,
    };
  }

  /**
   * 获取使用最多的专家
   */
  static getTopExperts(
    usage: Array<{ expertId: string; requests: number }>,
    limit: number = 5
  ): Array<{ expertId: string; requests: number; percentage: number }> {
    const total = usage.reduce((sum, u) => sum + u.requests, 0);
    const sorted = [...usage].sort((a, b) => b.requests - a.requests).slice(0, limit);

    return sorted.map(u => ({
      expertId: u.expertId,
      requests: u.requests,
      percentage: total > 0 ? Math.round((u.requests / total) * 10000) / 100 : 0,
    }));
  }

  /**
   * 计算工作负载分布
   */
  static calculateWorkloadDistribution(
    usage: Array<{ expertId: string; requests: number }>
  ): Record<string, number> {
    const total = usage.reduce((sum, u) => sum + u.requests, 0);
    const distribution: Record<string, number> = {};

    usage.forEach(u => {
      distribution[u.expertId] = total > 0 ? Math.round((u.requests / total) * 10000) / 100 : 0;
    });

    return distribution;
  }

  /**
   * 生成活动时间线数据
   */
  static generateActivityTimeline(
    activities: Array<{ timestamp: Date; type: string; value: number }>
  ): Array<{ hour: number; count: number }> {
    const timeline: Record<number, number> = {};

    activities.forEach(a => {
      const hour = a.timestamp.getHours();
      timeline[hour] = (timeline[hour] || 0) + a.value;
    });

    return Object.entries(timeline)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => a.hour - b.hour);
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DashboardStats)) return false;
    return this.tasksCompleted === other.tasksCompleted;
  }
}
