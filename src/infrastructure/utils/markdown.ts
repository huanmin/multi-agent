/**
 * Markdown 工具函数
 *
 * 解析 Markdown 并过滤危险 HTML
 */

/**
 * 简单的 Markdown 解析器
 * 将 Markdown 转换为安全的 HTML
 */
export function parseMarkdown(input: string): string {
  if (!input || input.trim().length === 0) {
    return '';
  }

  let html = input;

  // 首先转义 HTML 特殊字符
  html = escapeHtml(html);

  // 解析标题
  html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
  html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // 解析代码块
  html = html.replace(/```([\w]*)([\s\S]*?)```/g, (_match, lang, code) => {
    const language = lang || 'text';
    const cleanCode = code.trim();
    return `<pre><code class="language-${language}">${cleanCode}</code></pre>`;
  });

  // 解析行内代码
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 解析链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // 解析粗体
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // 解析斜体
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // 解析段落（在行尾添加 <br>，并将空行分隔的文本包裹在 <p> 中）
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs
    .map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      // 如果已经是块级元素，不包裹
      if (/^<(h[1-6]|pre|ul|ol|blockquote)/.test(trimmed)) {
        return trimmed;
      }
      // 将换行转换为 <br>
      const withBreaks = trimmed.replace(/\n/g, '<br>');
      return `<p>${withBreaks}</p>`;
    })
    .filter(Boolean)
    .join('\n');

  // 清理危险内容
  html = sanitizeHtml(html);

  return html;
}

/**
 * 转义 HTML 特殊字符
 */
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, char => htmlEscapes[char] || char);
}

/**
 * 清理危险 HTML
 * 移除 script 标签、事件处理器等
 * 同时处理原始 HTML 和实体编码后的内容
 */
function sanitizeHtml(html: string): string {
  // 移除 script 标签及其内容
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');

  // 移除 on 事件属性 (onclick, onerror, onload 等)
  // 处理原始格式: onerror="xxx"
  html = html.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  // 处理实体编码格式: onerror=&quot;xxx&quot;
  html = html.replace(/\s+on\w+\s*=\s*&quot;[^&]*&quot;/gi, '');

  // 移除 javascript: 伪协议
  html = html.replace(/javascript:/gi, '');

  // 移除 data: URI（可能包含 XSS）
  html = html.replace(/data:[^;]*;base64,/gi, '');

  return html;
}
