/**
 * Token 估算工具函数
 *
 * 估算文本的 Token 数量
 */

/**
 * 估算文本的 Token 数量
 *
 * 使用简化的估算方法：
 * - 英文：约 1 token / 4 字符，或按单词分割
 * - 中文：约 1 token / 字符
 *
 * @param text - 要估算的文本
 * @returns 估算的 token 数量
 */
export function estimateTokens(text: string): number {
  if (!text || text.length === 0) {
    return 0;
  }

  let totalTokens = 0;
  let i = 0;

  while (i < text.length) {
    const char = text[i]!;
    const code = char.charCodeAt(0);

    // 中文字符 (CJK Unified Ideographs)
    if (code >= 0x4e00 && code <= 0x9fff) {
      totalTokens += 1;
      i++;
    }
    // 其他 Unicode 字符（如 emoji、扩展字符）
    else if (code > 0x7f) {
      totalTokens += 1;
      i++;
    }
    // ASCII 字符
    else {
      // 收集连续的英文单词
      let word = '';
      while (i < text.length) {
        const c = text[i]!;
        const cc = c.charCodeAt(0);
        // 继续收集 ASCII 字母、数字和部分标点
        if ((cc >= 0x20 && cc <= 0x7e) && cc !== 0x20) {
          word += c;
          i++;
        } else {
          break;
        }
      }

      if (word.length > 0) {
        // 英文单词：约 1 token 每词，或按字符数/4
        totalTokens += Math.max(1, Math.ceil(word.length / 4));
      }

      // 跳过空格
      if (i < text.length && text[i] === ' ') {
        i++;
      }
    }
  }

  return totalTokens;
}

/**
 * 更精确的 Token 估算（基于字节数）
 * GPT 模型通常使用 BPE，大约 1 token = 4 字符
 */
export function estimateTokensByBytes(text: string): number {
  if (!text || text.length === 0) {
    return 0;
  }

  // 获取 UTF-8 字节数
  const byteLength = new TextEncoder().encode(text).length;

  // 粗略估算：平均 4 字节 = 1 token
  return Math.ceil(byteLength / 4);
}

/**
 * 批量估算多条消息的 token
 */
export function estimateMessagesTokens(messages: Array<{ content: string }>): number {
  return messages.reduce((total, msg) => total + estimateTokens(msg.content), 0);
}
