/**
 * 契约测试套件
 *
 * 运行所有 Repository 和 Service 的契约测试
 * 确保所有实现都遵守领域层定义的接口契约
 */

import { describe, beforeEach, afterEach } from 'vitest';
import { runExpertRepositoryContractTests } from './expert.repository.contract.test';
import { runConversationRepositoryContractTests } from './conversation.repository.contract.test';
import { runLLMProviderContractTests } from './llm-provider.contract.test';
import { InMemoryExpertRepository } from '@infrastructure/repositories/expert.repository';
import { InMemoryConversationRepository } from '@infrastructure/repositories/conversation.repository';
import { SQLiteExpertRepository } from '@infrastructure/repositories/sqlite/expert.repository';
import { SQLiteConversationRepository } from '@infrastructure/repositories/sqlite/conversation.repository';
import { LocalStorageExpertRepository } from '@infrastructure/repositories/localstorage/expert.repository';
import { LocalStorageConversationRepository } from '@infrastructure/repositories/localstorage/conversation.repository';
import {
  ILLMProvider,
  LLMResponse,
  StreamEvent,
} from '@infrastructure/services/llm.service';

/**
 * Mock LLM Provider 实现
 * 用于测试契约
 */
class MockLLMProvider implements ILLMProvider {
  readonly name = 'Mock Provider';

  async chat(
    messages: Array<{ role: string; content: string }>,
    config: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<LLMResponse> {
    const content = messages[messages.length - 1]?.content || '';
    return {
      content: `Response to: ${content}`,
      usage: {
        inputTokens: content.length,
        outputTokens: 10,
      },
      latency: 100,
    };
  }

  async chatStream(
    messages: Array<{ role: string; content: string }>,
    config: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    },
    onEvent: (event: StreamEvent) => void
  ): Promise<void> {
    const expertId = 'mock-expert';
    onEvent({ type: 'start', expertId });
    onEvent({ type: 'delta', expertId, content: 'Mock ' });
    onEvent({ type: 'delta', expertId, content: 'response' });
    onEvent({ type: 'complete', expertId });
  }

  estimateTokens(text: string): number {
    // 简单估算：英文按空格分割，中文按字符
    if (!text) return 0;
    const englishTokens = text.split(/\s+/).filter((w) => w).length;
    const chineseTokens = text.replace(/[\x00-\x7F]/g, '').length;
    return englishTokens + chineseTokens;
  }
}

/**
 * 运行所有契约测试
 */
describe('Contract Tests', () => {
  describe('InMemory Implementations', () => {
    // Expert Repository 契约测试
    runExpertRepositoryContractTests(() => new InMemoryExpertRepository());

    // Conversation Repository 契约测试
    runConversationRepositoryContractTests(() => new InMemoryConversationRepository());
  });

  describe('LocalStorage Implementations', () => {
    beforeEach(() => {
      // 清除 localStorage
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    describe('Expert Repository', () => {
      runExpertRepositoryContractTests(() => new LocalStorageExpertRepository());
    });

    describe('Conversation Repository', () => {
      runConversationRepositoryContractTests(() => new LocalStorageConversationRepository());
    });
  });

  // SQLite 实现（在浏览器环境中可用）
  describe.skip('SQLite Implementations', () => {
    describe('Expert Repository', () => {
      let repository: SQLiteExpertRepository;

      beforeEach(async () => {
        repository = new SQLiteExpertRepository();
        await repository.initialize();
      });

      afterEach(async () => {
        await repository.close();
      });

      runExpertRepositoryContractTests(() => repository);
    });

    describe('Conversation Repository', () => {
      let repository: SQLiteConversationRepository;

      beforeEach(async () => {
        repository = new SQLiteConversationRepository();
        await repository.initialize();
      });

      afterEach(async () => {
        await repository.close();
      });

      runConversationRepositoryContractTests(() => repository);
    });
  });

  // LLM Provider 契约测试
  runLLMProviderContractTests(() => new MockLLMProvider());
});
