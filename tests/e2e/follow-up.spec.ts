import { test, expect } from '@playwright/test';

test.describe('追问功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/conversations');
    await page.waitForLoadState('networkidle');
  });

  test('应该能在专家回复上点击追问', async ({ page }) => {
    // 先发送一条消息
    await page.fill('textarea, input[type="text"]', '测试问题');
    await page.press('textarea, input[type="text"]', 'Enter');

    // 等待专家回复
    await page.waitForSelector('[data-testid="expert-response"]', { timeout: 5000 });

    // 悬停在消息上显示操作按钮
    await page.hover('[data-testid="expert-response"]');

    // 点击追问按钮
    await page.click('text=追问');

    // 验证追问输入框出现
    await expect(page.locator('text=请输入追问内容...')).toBeVisible();
  });

  test('应该能发送追问', async ({ page }) => {
    // 发送消息并等待回复
    await page.fill('textarea, input[type="text"]', '测试问题');
    await page.press('textarea, input[type="text"]', 'Enter');

    await page.waitForSelector('[data-testid="expert-response"]', { timeout: 5000 });

    // 点击追问
    await page.hover('[data-testid="expert-response"]');
    await page.click('text=追问');

    // 输入追问内容
    await page.fill('textarea[placeholder="请输入追问内容..."]', '能详细说明吗？');

    // 发送
    await page.click('button:has-text("发送")');

    // 验证追问消息出现在列表中
    await expect(page.locator('text=追问')).toBeVisible();
  });

  test('应该能取消追问', async ({ page }) => {
    // 发送消息并等待回复
    await page.fill('textarea, input[type="text"]', '测试问题');
    await page.press('textarea, input[type="text"]', 'Enter');

    await page.waitForSelector('[data-testid="expert-response"]', { timeout: 5000 });

    // 点击追问
    await page.hover('[data-testid="expert-response"]');
    await page.click('text=追问');

    // 取消
    await page.click('button:has-text("取消")');

    // 验证追问输入框消失，普通输入框出现
    await expect(page.locator('textarea[placeholder="请输入追问内容..."]')).not.toBeVisible();
  });
});
