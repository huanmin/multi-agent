import { test, expect } from '@playwright/test';

/**
 * E2E 测试套件
 *
 * 验证完整用户流程
 */

test.describe('Multi-Agent Platform E2E', () => {
  test.describe('首次启动流程', () => {
    test('应该完成欢迎引导', async ({ page }) => {
      await page.goto('/');

      // 验证欢迎页
      await expect(page.getByText('欢迎使用 Multi-Agent')).toBeVisible();

      // 下一步
      await page.getByRole('button', { name: '下一步' }).click();
      await expect(page.getByText('发现专家团队')).toBeVisible();

      // 开始使用
      await page.getByRole('button', { name: '开始使用' }).click();
      await expect(page.getByText('专家团队')).toBeVisible();
    });
  });

  test.describe('专家管理', () => {
    test('应该创建新专家', async ({ page }) => {
      await page.goto('/experts');

      // 点击创建
      await page.getByRole('button', { name: '创建专家' }).click();

      // 填写信息
      await page.getByLabel('名称').fill('测试专家');
      await page.getByLabel('系统提示词').fill('你是一个测试专家');
      await page.getByText('架构师').click();

      // 保存
      await page.getByRole('button', { name: '保存' }).click();

      // 验证创建成功
      await expect(page.getByText('测试专家')).toBeVisible();
    });

    test('应该克隆专家', async ({ page }) => {
      await page.goto('/experts');

      // 找到专家并克隆
      await page.getByText('测试专家').hover();
      await page.getByRole('button', { name: '克隆' }).click();

      // 验证克隆成功
      await expect(page.getByText('测试专家 副本')).toBeVisible();
    });
  });

  test.describe('会话管理', () => {
    test('应该创建单聊会话', async ({ page }) => {
      await page.goto('/experts');

      // 双击专家创建会话
      await page.getByText('架构师').dblClick();

      // 验证会话创建
      await expect(page.getByText('与 架构师 的对话')).toBeVisible();
    });

    test('应该发送消息', async ({ page }) => {
      await page.goto('/chat/1');

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

      // 验证多个专家正在思考
      await expect(page.getByText('正在思考...').first()).toBeVisible();

      // 等待响应（mock 模式下快速完成）
      await page.waitForTimeout(2000);

      // 验证响应显示
      await expect(page.getByTestId('expert-response').first()).toBeVisible();
    });
  });

  test.describe('代码审查', () => {
    test('应该完成代码审查流程', async ({ page }) => {
      await page.goto('/code-review');

      // 粘贴代码
      await page.getByRole('textbox').fill(`
function add(a, b) {
  return a + b;
}
      `);

      // 开始审查
      await page.getByRole('button', { name: '开始审查' }).click();

      // 验证审查结果
      await expect(page.getByText('代码规范')).toBeVisible();
      await expect(page.getByText('性能优化')).toBeVisible();
    });
  });

  test.describe('Dashboard', () => {
    test('应该显示统计数据', async ({ page }) => {
      await page.goto('/dashboard');

      // 验证统计卡片
      await expect(page.getByText('节省时间')).toBeVisible();
      await expect(page.getByText('Token用量')).toBeVisible();
      await expect(page.getByText('任务完成')).toBeVisible();

      // 验证图表
      await expect(page.getByTestId('activity-chart')).toBeVisible();
    });

    test('应该切换时间范围', async ({ page }) => {
      await page.goto('/dashboard');

      // 切换时间范围
      await page.getByRole('button', { name: '30天' }).click();

      // 验证数据更新
      await expect(page.getByTestId('activity-chart')).toHaveAttribute('data-range', '30d');
    });
  });
});
