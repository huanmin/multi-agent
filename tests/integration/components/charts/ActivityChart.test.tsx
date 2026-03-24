/**
 * ActivityChart 组件测试
 *
 * 活动时间线图表组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityChart } from '@presentation/components/charts/ActivityChart';

// Mock Recharts 组件
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
}));

describe('ActivityChart', () => {
  const mockData = [
    { hour: 0, count: 5 },
    { hour: 1, count: 3 },
    { hour: 2, count: 0 },
    { hour: 8, count: 12 },
    { hour: 12, count: 8 },
    { hour: 18, count: 15 },
  ];

  it('应该渲染图表容器', () => {
    render(<ActivityChart data={mockData} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('应该渲染折线图', () => {
    render(<ActivityChart data={mockData} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('应该显示标题', () => {
    render(<ActivityChart data={mockData} title="活动统计" />);
    expect(screen.getByText('活动统计')).toBeInTheDocument();
  });

  it('应该处理空数据', () => {
    render(<ActivityChart data={[]} />);
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('应该格式化时间显示', () => {
    render(<ActivityChart data={mockData} />);
    // 验证 XAxis 被渲染
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
  });
});

describe('ExpertUsageChart', () => {
  const mockExpertData = [
    { name: '架构师', requests: 100, color: '#6366f1' },
    { name: '前端专家', requests: 50, color: '#8b5cf6' },
    { name: '后端专家', requests: 30, color: '#ec4899' },
  ];

  it('应该渲染饼图', () => {
    render(<ExpertUsageChart data={mockExpertData} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('应该显示标题', () => {
    render(<ExpertUsageChart data={mockExpertData} title="专家使用分布" />);
    expect(screen.getByText('专家使用分布')).toBeInTheDocument();
  });

  it('应该处理空数据', () => {
    render(<ExpertUsageChart data={[]} />);
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });
});

describe('TokenUsageChart', () => {
  const mockTokenData = [
    { date: '2026-03-20', input: 5000, output: 3000 },
    { date: '2026-03-21', input: 8000, output: 4500 },
    { date: '2026-03-22', input: 6000, output: 3500 },
  ];

  it('应该渲染柱状图', () => {
    render(<TokenUsageChart data={mockTokenData} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('应该显示标题', () => {
    render(<TokenUsageChart data={mockTokenData} title="Token 使用量" />);
    expect(screen.getByText('Token 使用量')).toBeInTheDocument();
  });

  it('应该显示图例', () => {
    render(<TokenUsageChart data={mockTokenData} />);
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });
});

import { ExpertUsageChart } from '@presentation/components/charts/ExpertUsageChart';
import { TokenUsageChart } from '@presentation/components/charts/TokenUsageChart';
