import { describe, it, expect } from 'vitest';
import { formatTime } from '@infrastructure/utils/time';

describe('formatTime', () => {
  it('应该显示"刚刚"', () => {
    const date = new Date();
    expect(formatTime(date)).toBe('刚刚');
  });

  it('应该显示分钟前', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatTime(date)).toBe('5分钟前');
  });

  it('应该显示小时前', () => {
    const date = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(formatTime(date)).toBe('2小时前');
  });

  it('应该显示日期', () => {
    const date = new Date('2026-01-01');
    expect(formatTime(date)).toBe('2026-01-01');
  });

  it('应该显示昨天', () => {
    const date = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(formatTime(date)).toBe('昨天');
  });
});
