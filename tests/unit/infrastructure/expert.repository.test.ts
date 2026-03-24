import { describe, beforeEach } from 'vitest';
import { runExpertRepositoryContractTests } from '../../contract/expert.repository.contract.test';
import {
  IExpertRepository,
  InMemoryExpertRepository,
} from '@infrastructure/repositories/expert.repository';
import { LocalStorageExpertRepository } from '@infrastructure/repositories/localstorage/expert.repository';

/**
 * InMemoryExpertRepository 单元测试
 * 直接复用契约测试，确保实现符合接口契约
 */
describe('InMemoryExpertRepository', () => {
  runExpertRepositoryContractTests(() => new InMemoryExpertRepository());
});

/**
 * LocalStorageExpertRepository 单元测试
 * 复用契约测试 + localStorage 特定测试
 */
describe('LocalStorageExpertRepository', () => {
  runExpertRepositoryContractTests(createLocalStorageRepository);
});

/**
 * 工厂函数：创建 LocalStorage 仓库
 */
function createLocalStorageRepository(): IExpertRepository {
  const repo = new LocalStorageExpertRepository();
  // 清理缓存确保测试隔离
  repo.clear().catch(() => {});
  return repo;
}
