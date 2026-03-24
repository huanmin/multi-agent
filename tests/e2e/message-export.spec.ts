import { test, expect } from '@playwright/test';

test.describe('消息导出功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/conversations');
    await page.waitForLoadState('networkidle');
  });

  test('应该能从聊天页面打开导出对话框', async ({ page }) => {
    // 点击导出按钮
    await page.click('text=导出');

    // 验证导出对话框出现
    await expect(page.locator('text=导出消息')).toBeVisible();
  });
});
