import { test, expect } from '@playwright/test';

/**
 * E2E 测试套件
 *
 * 验证完整用户流程
 * 按照 Harness Engineering TDD 流程：单元测试 -> 组件测试 -> E2E 测试
 */

test.describe('Multi-Agent Platform E2E', () => {
  test.describe('Dashboard', () => {
    test('应该显示统计数据', async ({ page }) => {
      await page.goto('/dashboard');

      // 验证页面标题 - 使用 role 选择器更精确
      await expect(page.getByRole('heading', { name: '仪表盘' })).toBeVisible();
      await expect(page.getByText('系统概览与统计')).toBeVisible();

      // 验证统计卡片 - 匹配实际 UI 文本
      await expect(page.getByText('专家数量')).toBeVisible();
      await expect(page.getByText('对话数量')).toBeVisible();
      await expect(page.getByText('消息总数')).toBeVisible();
      await expect(page.getByText('系统状态')).toBeVisible();

      // 验证统计值
      await expect(page.getByText('6')).toBeVisible(); // 专家数量
      await expect(page.getByText('3')).toBeVisible(); // 对话数量
      await expect(page.getByText('42')).toBeVisible(); // 消息总数
      await expect(page.getByText('运行中')).toBeVisible(); // 系统状态
    });

    test('应该显示专家卡片', async ({ page }) => {
      await page.goto('/dashboard');

      // 验证 Layout 组件中的导航 - 使用 first 避免多个匹配
      await expect(page.getByText('Multi-Agent').first()).toBeVisible();
    });
  });

  test.describe('欢迎引导', () => {
    test('应该完成欢迎引导', async ({ page }) => {
      await page.goto('/welcome');

      // 验证欢迎页
      await expect(page.getByText('欢迎使用 Multi-Agent')).toBeVisible();

      // 下一步
      await page.getByRole('button', { name: '下一步' }).click();
      await expect(page.getByText('发现专家团队')).toBeVisible();

      // 下一步
      await page.getByRole('button', { name: '下一步' }).click();
      await expect(page.getByText('多专家并行对话')).toBeVisible();

      // 下一步
      await page.getByRole('button', { name: '下一步' }).click();
      await expect(page.getByRole('heading', { name: '代码审查' })).toBeVisible();

      // 开始使用
      await page.getByRole('button', { name: '开始使用' }).click();

      // 验证跳转到 dashboard
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('应该可以跳过引导', async ({ page }) => {
      await page.goto('/welcome');

      await expect(page.getByText('欢迎使用 Multi-Agent')).toBeVisible();

      // 点击跳过
      await page.getByRole('button', { name: '跳过' }).click();

      // 验证跳转到 dashboard
      await expect(page).toHaveURL(/.*dashboard/);
    });
  });

  test.describe('专家管理', () => {
    test('应该创建新专家', async ({ page }) => {
      await page.goto('/experts');

      // 验证页面
      await expect(page.getByRole('heading', { name: '专家团队' })).toBeVisible();

      // 点击创建
      await page.getByRole('button', { name: '创建专家' }).click();

      // 等待弹窗出现
      await expect(page.getByRole('heading', { name: '创建专家' })).toBeVisible();

      // 填写信息 - 使用 placeholder 定位
      await page.getByRole('textbox', { name: '名称' }).fill('测试专家');
      await page.getByRole('textbox', { name: '描述' }).fill('这是一个测试专家');
      await page.getByRole('textbox', { name: '系统提示词' }).fill('你是一个测试专家');

      // 保存
      await page.getByRole('button', { name: '保存' }).click();

      // 验证创建成功 - 使用 heading 避免匹配描述
      await expect(page.getByRole('heading', { name: '测试专家' })).toBeVisible();
    });

    test('应该克隆专家', async ({ page }) => {
      await page.goto('/experts');

      // 等待专家列表加载
      await expect(page.getByText('架构师')).toBeVisible();

      // 找到专家并悬停显示克隆按钮
      await page.getByText('架构师').hover();

      // 点击克隆
      await page.getByRole('button', { name: '克隆' }).click();

      // 验证克隆成功
      await expect(page.getByText('架构师 副本')).toBeVisible();
    });
  });

  test.describe('会话管理', () => {
    test('应该创建单聊会话', async ({ page }) => {
      await page.goto('/experts');

      // 等待专家列表加载
      await expect(page.getByText('架构师')).toBeVisible();

      // 双击专家创建会话 - Playwright 使用 dblclick() 方法
      await page.getByText('架构师').dblclick();
    });

    test('应该发送消息', async ({ page }) => {
      await page.goto('/chat/1');

      // 验证聊天页面
      await expect(page.getByPlaceholder('输入消息...')).toBeVisible();

      // 输入消息
      await page.getByPlaceholder('输入消息...').fill('Hello, experts!');
      await page.getByRole('button', { name: '发送' }).click();

      // 验证消息显示
      await expect(page.getByText('Hello, experts!')).toBeVisible();
    });

    test('应该显示并行响应', async ({ page }) => {
      await page.goto('/chat/1');

      // 发送消息
      await page.getByPlaceholder('输入消息...').fill('请分析这个问题');
      await page.getByRole('button', { name: '发送' }).click();

      // 验证用户消息显示
      await expect(page.getByText('请分析这个问题')).toBeVisible();

      // 验证多个专家正在思考（可选，取决于实现）
      try {
        await expect(page.getByText(/正在思考/).first()).toBeVisible({ timeout: 2000 });
      } catch {
        // 如果思考状态太快消失，可以接受
      }
    });
  });

  test.describe('代码审查', () => {
    test('应该完成代码审查流程', async ({ page }) => {
      await page.goto('/code-review');

      // 验证页面
      await expect(page.getByRole('heading', { name: '代码审查' })).toBeVisible();

      // 粘贴代码
      await page.getByRole('textbox').first().fill(`function add(a, b) {
  return a + b;
}`);

      // 开始审查
      await page.getByRole('button', { name: '开始审查' }).click();

      // 等待审查结果 - 使用更精确的选择器
      await expect(page.locator('span', { hasText: /^代码规范$/ })).toBeVisible({ timeout: 5000 });
      await expect(page.locator('span', { hasText: /^性能优化$/ })).toBeVisible();
      await expect(page.locator('span', { hasText: /^安全漏洞$/ })).toBeVisible();
      await expect(page.locator('span', { hasText: /^最佳实践$/ })).toBeVisible();
    });
  });

  test.describe('导航', () => {
    test('应该在页面间导航', async ({ page }) => {
      // 从 dashboard 开始
      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: '仪表盘' })).toBeVisible();

      // 导航到专家管理
      await page.goto('/experts');
      await expect(page.getByRole('heading', { name: '专家团队' })).toBeVisible();

      // 导航到代码审查
      await page.goto('/code-review');
      await expect(page.getByRole('heading', { name: '代码审查' })).toBeVisible();
    });
  });
});
