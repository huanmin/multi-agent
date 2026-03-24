/**
 * StatCard 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '@presentation/components/StatCard';

describe('StatCard', () => {
  it('应该渲染标题和值', () => {
    render(<StatCard title="专家数量" value="6" icon="👥" />);

    expect(screen.getByText('专家数量')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('应该渲染图标', () => {
    render(<StatCard title="测试" value="1" icon="🧪" />);

    expect(screen.getByText('🧪')).toBeInTheDocument();
  });

  it('应该显示在线状态', () => {
    render(<StatCard title="系统状态" value="运行中" icon="⚡" status="online" />);

    const valueElement = screen.getByText('运行中');
    expect(valueElement.className).toContain('text-green-400');
  });

  it('应该显示离线状态', () => {
    render(<StatCard title="系统状态" value="离线" icon="⚡" status="offline" />);

    const valueElement = screen.getByText('离线');
    expect(valueElement.className).toContain('text-gray-400');
  });

  it('应该显示警告状态', () => {
    render(<StatCard title="系统状态" value="警告" icon="⚡" status="warning" />);

    const valueElement = screen.getByText('警告');
    expect(valueElement.className).toContain('text-yellow-400');
  });

  it('应该默认显示白色文字', () => {
    render(<StatCard title="普通卡片" value="100" icon="📊" />);

    const valueElement = screen.getByText('100');
    expect(valueElement.className).toContain('text-white');
  });

  it('应该显示大数字', () => {
    render(<StatCard title="消息总数" value="1,234,567" icon="💬" />);

    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('应该显示字符串值', () => {
    render(<StatCard title="状态" value="处理中" icon="⏳" />);

    expect(screen.getByText('处理中')).toBeInTheDocument();
  });
});
