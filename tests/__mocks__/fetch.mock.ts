/**
 * Fetch API Mock
 *
 * 提供统一的 fetch mock 工具
 */

import { vi } from 'vitest';

/**
 * 创建标准 API 响应 mock
 */
export function mockApiResponse<T>(data: T, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers(),
  } as Response;
}

/**
 * 创建流式响应 mock
 */
export function mockStreamResponse(chunks: string[]): Response {
  let chunkIndex = 0;

  const mockReader = {
    read: vi.fn().mockImplementation(() => {
      if (chunkIndex < chunks.length) {
        const chunk = chunks[chunkIndex++];
        return Promise.resolve({
          done: false,
          value: new TextEncoder().encode(chunk),
        });
      }
      return Promise.resolve({ done: true });
    }),
    releaseLock: vi.fn(),
  };

  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    body: {
      getReader: () => mockReader,
    },
    headers: new Headers(),
  } as unknown as Response;
}

/**
 * 设置全局 fetch mock
 */
export function setupFetchMock(): void {
  global.fetch = vi.fn();
}

/**
 * 重置 fetch mock
 */
export function resetFetchMock(): void {
  vi.mocked(global.fetch).mockClear();
}

/**
 * 获取最后一次 fetch 调用的参数
 */
export function getLastFetchCall(): [string, RequestInit | undefined] {
  const calls = vi.mocked(global.fetch).mock.calls;
  if (calls.length === 0) {
    throw new Error('No fetch calls made');
  }
  return calls[calls.length - 1] as [string, RequestInit | undefined];
}
