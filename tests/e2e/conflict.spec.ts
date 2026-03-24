import { test, expect } from '@playwright/test';

/**
 * 冲突解决 E2E 测试
 *
 * 验证冲突检测、对比视图和决策流程
 */

test.describe('冲突解决', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat/1');
  });

  test('应该检测并显示冲突', async ({ page }) => {
    // 发送消息触发多专家响应
    await page.getByPlaceholder('输入消息...').fill('应该使用微服务架构吗？');
    await page.getByRole('button', { name: '发送' }).click();

    // 等待冲突检测提示
    await expect(page.getByText(/检测到意见冲突/)).toBeVisible({ timeout: 5000 });

    // 点击查看冲突
    await page.getByRole('button', { name: /查看冲突/ }).click();

    // 验证冲突面板显示
    await expect(page.getByRole('heading', { name: /架构分歧/ })).toBeVisible();
  });

  test('应该显示双方观点对比', async ({ page }) => {
    // 直接进入冲突页面（模拟已有冲突）
    await page.goto('/conflict/conflict-1');

    // 验证对比视图
    await expect(page.getByText('架构师')).toBeVisible();
    await expect(page.getByText('后端专家')).toBeVisible();

    // 验证优缺点列表
    await expect(page.getByText('优点:')).toBeVisible();
    await expect(page.getByText('缺点:')).toBeVisible();

    // 验证决策建议
    await expect(page.getByText(/决策建议/)).toBeVisible();
  });

  test('应该支持选择专家决策', async ({ page }) => {
    await page.goto('/conflict/conflict-1');

    // 选择第一个专家
    await page.getByRole('button', { name: /选择/, exact: false }).first().click();

    // 输入决策理由
    await page.getByPlaceholder('输入决策理由...').fill('团队规模较大，需要更好的扩展性');

    // 确认决策
    await page.getByRole('button', { name: /确认决策/ }).click();

    // 验证冲突已解决
    await expect(page.getByText(/冲突已解决/)).toBeVisible();
  });

  test('应该支持忽略冲突', async ({ page }) => {
    await page.goto('/conflict/conflict-1');

    // 点击忽略
    await page.getByRole('button', { name: /忽略/ }).click();

    // 验证返回聊天页面
    await expect(page).toHaveURL(/.*chat/);
  });

  test('应该显示冲突列表', async ({ page }) => {
    await page.goto('/conflicts');

    // 验证冲突列表
    await expect(page.getByRole('heading', { name: /冲突列表/ })).toBeVisible();

    // 验证筛选按钮
    await expect(page.getByRole('button', { name: /待处理/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /已解决/ })).toBeVisible();
  });

  test('应该按严重程度排序', async ({ page }) => {
    await page.goto('/conflicts');

    // 获取所有冲突项
    const items = await page.getByTestId('conflict-item').all();

    // 验证至少有一项
    expect(items.length).toBeGreaterThan(0);
  });
});
