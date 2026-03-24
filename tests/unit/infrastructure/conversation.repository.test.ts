import { describe, beforeEach } from 'vitest';
import { runConversationRepositoryContractTests } from '../../contract/conversation.repository.contract.test';
import {
  IConversationRepository,
  InMemoryConversationRepository,
} from '@infrastructure/repositories/conversation.repository';
import { LocalStorageConversationRepository } from '@infrastructure/repositories/localstorage/conversation.repository';

/**
 * InMemoryConversationRepository 单元测试
 * 直接复用契约测试
 */
describe('InMemoryConversationRepository', () => {
  runConversationRepositoryContractTests(() => new InMemoryConversationRepository());
});

/**
 * LocalStorageConversationRepository 单元测试
 * 复用契约测试 + localStorage 特定测试
 */
describe('LocalStorageConversationRepository', () => {
  const createRepo = () => {
    const repo = new LocalStorageConversationRepository();
    repo.clear().catch(() => {});
    return repo;
  };
  runConversationRepositoryContractTests(createRepo);
});

/**
 * 运行带清理的契约测试
 */
function runConversationContractTestsWithCleanup(): void {
  runConversationRepositoryContractTests(() => {
    const repo = new LocalStorageConversationRepository();
    // 清理缓存
    repo.clear().catch(() => {});
    return repo;
  });
}
