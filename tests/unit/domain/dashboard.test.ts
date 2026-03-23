import { describe, it, expect } from 'vitest';
import { DashboardStats, TimeRange } from '@domain/dashboard';

describe('Dashboard Stats', () => {
  describe('DashboardStats Aggregate', () => {
    it('应该计算效率指标', () => {
      const stats = new DashboardStats({
        tasksCompleted: 50,
        estimatedTimeSaved: 25,
        avgResponseTime: 1.5,
      });

      const efficiency = stats.calculateEfficiency();
      expect(efficiency.timeSaved).toBe(25);
      expect(efficiency.avgResponseTime).toBe(1.5);
    });

    it('应该计算成本指标', () => {
      const stats = new DashboardStats({
        tokensInput: 10000,
        tokensOutput: 5000,
        costPerInputToken: 0.00001,
        costPerOutputToken: 0.00003,
      });

      const cost = stats.calculateCost();
      expect(cost.total).toBe(0.25);
      expect(cost.inputCost).toBe(0.1);
      expect(cost.outputCost).toBe(0.15);
    });

    it('应该计算 ROI', () => {
      const stats = new DashboardStats({
        cost: 10,
        estimatedValue: 100,
      });

      expect(stats.calculateROI()).toBe(900);
    });

    it('应该按时间范围聚合数据', () => {
      const dailyStats = [
        { date: '2026-03-20', tasks: 5 },
        { date: '2026-03-21', tasks: 8 },
        { date: '2026-03-22', tasks: 3 },
      ];

      const aggregated = DashboardStats.aggregateByRange(dailyStats, TimeRange.WEEK);
      expect(aggregated.totalTasks).toBe(16);
    });
  });

  describe('Expert Usage Stats', () => {
    it('应该统计专家使用频率', () => {
      const usage = [
        { expertId: 'expert1', requests: 100 },
        { expertId: 'expert2', requests: 50 },
        { expertId: 'expert3', requests: 25 },
      ];

      const topExperts = DashboardStats.getTopExperts(usage, 2);
      expect(topExperts).toHaveLength(2);
      expect(topExperts[0].expertId).toBe('expert1');
    });

    it('应该计算专家工作负载分布', () => {
      const usage = [
        { expertId: 'expert1', requests: 100 },
        { expertId: 'expert2', requests: 50 },
      ];

      const distribution = DashboardStats.calculateWorkloadDistribution(usage);
      expect(distribution['expert1']).toBe(66.67);
      expect(distribution['expert2']).toBe(33.33);
    });
  });
});
