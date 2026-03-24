import { describe, it, expect, beforeEach } from 'vitest';
import {
  createSettingsStore,
  type Settings,
  type LLMProvider,
  type Theme,
} from '@infrastructure/stores/settings.store';

describe('settingsStore', () => {
  let store: ReturnType<typeof createSettingsStore>;

  beforeEach(() => {
    store = createSettingsStore();
  });

  describe('LLM Provider 配置', () => {
    it('应该添加 LLM Provider', () => {
      store.getState().addProvider({
        id: 'anthropic',
        name: 'Anthropic',
        apiKey: 'test-api-key',
        baseUrl: 'https://api.anthropic.com',
        enabled: true,
      });

      expect(store.getState().providers).toHaveLength(1);
      expect(store.getState().providers[0].name).toBe('Anthropic');
    });

    it('应该更新 Provider API Key', () => {
      store.getState().addProvider({
        id: 'anthropic',
        name: 'Anthropic',
        apiKey: 'old-key',
        enabled: true,
      });

      store.getState().updateProvider('anthropic', { apiKey: 'new-key' });

      expect(store.getState().providers[0].apiKey).toBe('new-key');
    });

    it('应该删除 Provider', () => {
      store.getState().addProvider({
        id: 'anthropic',
        name: 'Anthropic',
        apiKey: 'test-key',
        enabled: true,
      });

      store.getState().removeProvider('anthropic');

      expect(store.getState().providers).toHaveLength(0);
    });

    it('应该设置默认 Provider', () => {
      store.getState().addProvider({
        id: 'anthropic',
        name: 'Anthropic',
        apiKey: 'test-key',
        enabled: true,
      });

      store.getState().setDefaultProvider('anthropic');

      expect(store.getState().defaultProviderId).toBe('anthropic');
    });

    it('应该验证 Provider 配置是否完整', () => {
      store.getState().addProvider({
        id: 'anthropic',
        name: 'Anthropic',
        apiKey: '',
        enabled: true,
      });

      const isValid = store.getState().validateProvider('anthropic');

      expect(isValid).toBe(false);
    });

    it('应该支持多个 Providers', () => {
      store.getState().addProvider({
        id: 'anthropic',
        name: 'Anthropic',
        apiKey: 'key1',
        enabled: true,
      });
      store.getState().addProvider({
        id: 'openai',
        name: 'OpenAI',
        apiKey: 'key2',
        enabled: true,
      });

      expect(store.getState().providers).toHaveLength(2);
    });
  });

  describe('主题设置', () => {
    it('应该设置深色主题', () => {
      store.getState().setTheme('dark');
      expect(store.getState().theme).toBe('dark');
    });

    it('应该设置浅色主题', () => {
      store.getState().setTheme('light');
      expect(store.getState().theme).toBe('light');
    });

    it('应该切换主题', () => {
      store.getState().setTheme('light');
      store.getState().toggleTheme();
      expect(store.getState().theme).toBe('dark');
    });
  });

  describe('语言设置', () => {
    it('应该设置中文', () => {
      store.getState().setLanguage('zh');
      expect(store.getState().language).toBe('zh');
    });

    it('应该设置英文', () => {
      store.getState().setLanguage('en');
      expect(store.getState().language).toBe('en');
    });
  });

  describe('数据存储设置', () => {
    it('应该设置本地存储路径', () => {
      store.getState().setDataPath('/custom/path');
      expect(store.getState().dataPath).toBe('/custom/path');
    });

    it('应该启用自动备份', () => {
      store.getState().setAutoBackup(true);
      expect(store.getState().autoBackup).toBe(true);
    });
  });

  describe('设置导入导出', () => {
    it('应该导出所有设置', () => {
      store.getState().addProvider({
        id: 'anthropic',
        name: 'Anthropic',
        apiKey: 'test-key',
        enabled: true,
      });
      store.getState().setTheme('dark');
      store.getState().setLanguage('zh');

      const exported = store.getState().exportSettings();

      expect(exported.providers).toHaveLength(1);
      expect(exported.theme).toBe('dark');
      expect(exported.language).toBe('zh');
    });

    it('应该导入设置', () => {
      const settings: Settings = {
        providers: [
          {
            id: 'openai',
            name: 'OpenAI',
            apiKey: 'imported-key',
            baseUrl: 'https://api.openai.com',
            enabled: true,
          },
        ],
        defaultProviderId: 'openai',
        theme: 'light',
        language: 'en',
        dataPath: '/imported/path',
        autoBackup: false,
      };

      store.getState().importSettings(settings);

      expect(store.getState().providers).toHaveLength(1);
      expect(store.getState().theme).toBe('light');
      expect(store.getState().language).toBe('en');
    });
  });

  describe('重置设置', () => {
    it('应该重置为默认设置', () => {
      store.getState().addProvider({
        id: 'anthropic',
        name: 'Anthropic',
        apiKey: 'test-key',
        enabled: true,
      });
      store.getState().setTheme('dark');

      store.getState().resetToDefaults();

      expect(store.getState().providers).toHaveLength(0);
      expect(store.getState().theme).toBe('dark'); // 默认主题
    });
  });
});
