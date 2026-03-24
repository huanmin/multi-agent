/**
 * Dashboard 页面测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '@presentation/pages/Dashboard';
import { MemoryRouter } from 'react-router-dom';

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  Legend: () => <div data-testid="legend" />,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
}));

const renderDashboard = () => {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
};

describe('Dashboard Page', () => {
  it('应该渲染 Dashboard 页面', () => {
    renderDashboard();
    // 使用 getAllByText 因为有多个元素包含"仪表盘"
    expect(screen.getAllByText(/仪表盘/i)[0]).toBeInTheDocument();
  });

  it('应该显示统计卡片', () => {
    renderDashboard();
    expect(screen.getByText('专家数量')).toBeInTheDocument();
    expect(screen.getByText('对话数量')).toBeInTheDocument();
    expect(screen.getByText('消息总数')).toBeInTheDocument();
    expect(screen.getByText('任务完成')).toBeInTheDocument();
  });

  it('应该显示图表区域', () => {
    renderDashboard();
    // 验证图表标题
    expect(screen.getByText('活动趋势（24小时）')).toBeInTheDocument();
    expect(screen.getByText('专家使用分布')).toBeInTheDocument();
    expect(screen.getByText('Token 使用量趋势')).toBeInTheDocument();
  });

  it('应该显示时间范围选择器', () => {
    renderDashboard();
    expect(screen.getByRole('button', { name: /今日/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /本周/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /本月/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /全部/i })).toBeInTheDocument();
  });

  it('应该响应时间范围切换', async () => {
    const user = userEvent.setup();
    renderDashboard();

    const monthButton = screen.getByRole('button', { name: /本月/i });
    await user.click(monthButton);

    // 验证按钮被选中（通过样式）
    expect(monthButton).toHaveClass('bg-blue-600');
  });
});
