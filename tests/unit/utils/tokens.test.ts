import { describe, it, expect } from 'vitest';
import { estimateTokens } from '@infrastructure/utils/tokens';

describe('estimateTokens', () => {
  it('应该估算英文 token 数', () => {
    const text = 'Hello world';
    expect(estimateTokens(text)).toBeGreaterThan(0);
  });

  it('应该估算中文 token 数', () => {
    const text = '你好世界';
    expect(estimateTokens(text)).toBeGreaterThan(0);
  });

  it('空字符串应该返回 0', () => {
    expect(estimateTokens('')).toBe(0);
  });

  it('英文单词应该按空格分割估算', () => {
    const text = 'a b c d';
    expect(estimateTokens(text)).toBe(4);
  });

  it('中文应该按字符估算', () => {
    const text = '一二三四五';
    expect(estimateTokens(text)).toBe(5);
  });
});
