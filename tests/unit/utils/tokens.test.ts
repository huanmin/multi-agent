import { describe, it, expect } from 'vitest';
import { estimateTokens, estimateTokensByBytes, estimateMessagesTokens } from '@infrastructure/utils/tokens';

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

describe('estimateTokensByBytes', () => {
  it('应该基于字节数估算 token', () => {
    const text = 'Hello world';
    const tokens = estimateTokensByBytes(text);
    expect(tokens).toBeGreaterThan(0);
  });

  it('空字符串应该返回 0', () => {
    expect(estimateTokensByBytes('')).toBe(0);
  });

  it('中文字符应该占用更多字节', () => {
    const chinese = '中文';
    const english = 'ab';
    expect(estimateTokensByBytes(chinese)).toBeGreaterThanOrEqual(estimateTokensByBytes(english));
  });
});

describe('estimateMessagesTokens', () => {
  it('应该批量估算多条消息', () => {
    const messages = [
      { content: 'Hello' },
      { content: 'World' },
      { content: 'Test' },
    ];
    const total = estimateMessagesTokens(messages);
    expect(total).toBeGreaterThan(0);
  });

  it('空消息数组应该返回 0', () => {
    expect(estimateMessagesTokens([])).toBe(0);
  });

  it('应该正确计算总和', () => {
    const messages = [
      { content: 'a' },
      { content: 'b' },
    ];
    const total = estimateMessagesTokens(messages);
    const expected = estimateTokens('a') + estimateTokens('b');
    expect(total).toBe(expected);
  });
});
