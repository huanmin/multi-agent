/**
 * Layout 组件测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Layout } from '@presentation/components/Layout';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const renderWithRouter = (
  component: React.ReactNode,
  initialRoute = '/dashboard'
) => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/*" element={component} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Layout', () => {
  it('应该渲染布局结构', () => {
    renderWithRouter(
      <Layout>
        <div data-testid="content">Content</div>
      </Layout>
    );

    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('应该显示导航菜单', () => {
    renderWithRouter(<Layout>Content</Layout>);

    expect(screen.getByTestId('nav-dashboard')).toHaveTextContent('仪表盘');
    expect(screen.getByTestId('nav-experts')).toHaveTextContent('专家管理');
    expect(screen.getByTestId('nav-conversations')).toHaveTextContent('对话');
    expect(screen.getByTestId('nav-code-review')).toHaveTextContent('代码审查');
    expect(screen.getByTestId('nav-settings')).toHaveTextContent('设置');
  });

  it('应该高亮当前活动页面', () => {
    renderWithRouter(<Layout>Content</Layout>, '/dashboard');

    const dashboardButton = screen.getByTestId('nav-dashboard');
    expect(dashboardButton).toHaveClass('bg-cyan-400');
    expect(dashboardButton).toHaveClass('active');
  });

  it('应该响应导航点击', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Layout>Content</Layout>);

    const expertButton = screen.getByTestId('nav-experts');
    await user.click(expertButton);

    // 验证按钮样式变化
    expect(expertButton).toHaveClass('bg-cyan-400');
  });

  it('应该渲染子内容', () => {
    renderWithRouter(
      <Layout>
        <h1>Page Title</h1>
        <p>Page content</p>
      </Layout>
    );

    expect(screen.getByText('Page Title')).toBeInTheDocument();
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('应该显示版本信息', () => {
    renderWithRouter(<Layout>Content</Layout>);
    expect(screen.getByText('v0.1.0')).toBeInTheDocument();
  });
});
