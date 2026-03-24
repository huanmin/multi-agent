import React, { useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { StatCard } from '../components/StatCard';
import { ActivityChart, ExpertUsageChart, TokenUsageChart } from '../components/charts';
import { TimeRange } from '@domain/dashboard';

/**
 * Dashboard 页面
 *
 * 系统概览与统计图表
 */
export const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.WEEK);

  // Mock 数据 - 实际应从 API/Store 获取
  const mockStats = {
    expertCount: 6,
    conversationCount: 12,
    messageCount: 156,
    tasksCompleted: 48,
    tokensInput: 125000,
    tokensOutput: 68000,
  };

  // 活动时间数据
  const activityData = useMemo(() => {
    return [
      { hour: 0, count: 2 },
      { hour: 1, count: 1 },
      { hour: 2, count: 0 },
      { hour: 3, count: 0 },
      { hour: 4, count: 0 },
      { hour: 5, count: 1 },
      { hour: 6, count: 3 },
      { hour: 7, count: 5 },
      { hour: 8, count: 12 },
      { hour: 9, count: 18 },
      { hour: 10, count: 22 },
      { hour: 11, count: 20 },
      { hour: 12, count: 15 },
      { hour: 13, count: 18 },
      { hour: 14, count: 25 },
      { hour: 15, count: 30 },
      { hour: 16, count: 28 },
      { hour: 17, count: 22 },
      { hour: 18, count: 18 },
      { hour: 19, count: 12 },
      { hour: 20, count: 8 },
      { hour: 21, count: 5 },
      { hour: 22, count: 3 },
      { hour: 23, count: 2 },
    ];
  }, []);

  // 专家使用数据
  const expertUsageData = useMemo(() => {
    return [
      { name: '架构师', requests: 120, color: '#6366f1' },
      { name: '前端专家', requests: 85, color: '#8b5cf6' },
      { name: '后端专家', requests: 70, color: '#ec4899' },
      { name: '安全专家', requests: 45, color: '#f43f5e' },
      { name: '代码审查', requests: 60, color: '#14b8a6' },
      { name: 'QA', requests: 40, color: '#f59e0b' },
    ];
  }, []);

  // Token 使用数据
  const tokenUsageData = useMemo(() => {
    const dates: Array<{ date: string; input: number; output: number }> = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push({
        date: date.toISOString().split('T')[0]!,
        input: Math.floor(Math.random() * 10000) + 5000,
        output: Math.floor(Math.random() * 6000) + 3000,
      });
    }
    return dates;
  }, [timeRange]);

  const timeRangeOptions = [
    { value: TimeRange.DAY, label: '今日' },
    { value: TimeRange.WEEK, label: '本周' },
    { value: TimeRange.MONTH, label: '本月' },
    { value: TimeRange.ALL, label: '全部' },
  ];

  return (
    <Layout>
      <div className="p-6">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">仪表盘</h1>
            <p className="text-gray-400">系统概览与统计</p>
          </div>

          {/* 时间范围选择器 */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === option.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </header>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="专家数量" value={mockStats.expertCount.toString()} icon="👥" />
          <StatCard
            title="对话数量"
            value={mockStats.conversationCount.toString()}
            icon="💬"
          />
          <StatCard title="消息总数" value={mockStats.messageCount.toString()} icon="📨" />
          <StatCard title="任务完成" value={mockStats.tasksCompleted.toString()} icon="✅" />
        </div>

        {/* 图表区域 - 第一行 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ActivityChart data={activityData} title="活动趋势（24小时）" />
          <ExpertUsageChart data={expertUsageData} title="专家使用分布" />
        </div>

        {/* 图表区域 - 第二行 */}
        <div className="grid grid-cols-1 gap-6">
          <TokenUsageChart data={tokenUsageData} title="Token 使用量趋势" />
        </div>
      </div>
    </Layout>
  );
};
