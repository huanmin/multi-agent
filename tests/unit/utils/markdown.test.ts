import { describe, it, expect } from 'vitest';
import { parseMarkdown } from '@infrastructure/utils/markdown';

describe('markdownParser', () => {
  it('应该正确解析标题', () => {
    const input = '# 标题';
    expect(parseMarkdown(input)).toContain('<h1>标题</h1>');
  });

  it('应该正确解析代码块', () => {
    const input = '```ts\nconst x = 1;\n```';
    expect(parseMarkdown(input)).toContain('<code');
  });

  it('应该正确解析链接', () => {
    const input = '[链接](https://example.com)';
    expect(parseMarkdown(input)).toContain('<a href=');
  });

  it('应该过滤危险 HTML', () => {
    const input = '<script>alert(1)</script>';
    expect(parseMarkdown(input)).not.toContain('<script>');
  });

  it('应该过滤危险事件属性', () => {
    const input = '<img src="x" onerror="alert(1)">';
    expect(parseMarkdown(input)).not.toContain('onerror');
  });
});
