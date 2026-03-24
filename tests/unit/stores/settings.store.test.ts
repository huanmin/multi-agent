import { describe, it, expect, beforeEach } from 'vitest';
import {
  createSettingsStore,
  type Settings,
  type LLMProvider,
} from '@infrastructure/stores/settings.store';
import { createTestProvider, createTestSettings } from '../../__helpers__/test-factory';

describe('settingsStore', () => {
  let store: ReturnType<typeof createSettingsStore>;

  beforeEach(() => {
    store = createSettingsStore();
  });

  describe('LLM Provider 配置', () => {
    it('should add LLM Provider', () => {
      const provider = createTestProvider({ id: 'anthropic', name: 'Anthropic' });

      store.getState().addProvider(provider);

      expect(store.getState().providers).toHaveLength(1);
      expect(store.getState().providers[0].name).toBe('Anthropic');
    });

    it('should update Provider API Key', () => {
      const provider = createTestProvider({ id: 'anthropic', apiKey: 'old-key' });
      store.getState().addProvider(provider);

      store.getState().updateProvider('anthropic', { apiKey: 'new-key' });

      expect(store.getState().providers[0].apiKey).toBe('new-key');
    });

    it('should remove Provider', () => {
      const provider = createTestProvider({ id: 'anthropic' });
      store.getState().addProvider(provider);

      store.getState().removeProvider('anthropic');

      expect(store.getState().providers).toHaveLength(0);
    });

    it('should set default Provider', () => {
      const provider = createTestProvider({ id: 'anthropic' });
      store.getState().addProvider(provider);

      store.getState().setDefaultProvider('anthropic');

      expect(store.getState().defaultProviderId).toBe('anthropic');
    });

    it('should validate Provider configuration completeness', () => {
      const provider = createTestProvider({ id: 'anthropic', apiKey: '' });
      store.getState().addProvider(provider);

      const isValid = store.getState().validateProvider('anthropic');

      expect(isValid).toBe(false);
    });

    it('should support multiple Providers', () => {
      store.getState().addProvider(createTestProvider({ id: 'anthropic' }));
      store.getState().addProvider(createTestProvider({ id: 'openai', name: 'OpenAI' }));

      expect(store.getState().providers).toHaveLength(2);
    });
  });

  describe('Theme Settings', () => {
    it('should set dark theme', () => {
      store.getState().setTheme('dark');
      expect(store.getState().theme).toBe('dark');
    });

    it('should set light theme', () => {
      store.getState().setTheme('light');
      expect(store.getState().theme).toBe('light');
    });

    it('should toggle theme', () => {
      store.getState().setTheme('light');
      store.getState().toggleTheme();
      expect(store.getState().theme).toBe('dark');
    });
  });

  describe('Language Settings', () => {
    it('should set Chinese', () => {
      store.getState().setLanguage('zh');
      expect(store.getState().language).toBe('zh');
    });

    it('should set English', () => {
      store.getState().setLanguage('en');
      expect(store.getState().language).toBe('en');
    });
  });

  describe('Data Storage Settings', () => {
    it('should set data path', () => {
      store.getState().setDataPath('/custom/path');
      expect(store.getState().dataPath).toBe('/custom/path');
    });

    it('should enable auto backup', () => {
      store.getState().setAutoBackup(true);
      expect(store.getState().autoBackup).toBe(true);
    });
  });

  describe('Settings Import/Export', () => {
    it('should export all settings', () => {
      store.getState().addProvider(createTestProvider({ id: 'anthropic' }));
      store.getState().setTheme('dark');
      store.getState().setLanguage('zh');

      const exported = store.getState().exportSettings();

      expect(exported.providers).toHaveLength(1);
      expect(exported.theme).toBe('dark');
      expect(exported.language).toBe('zh');
    });

    it('should import settings', () => {
      const settings = createTestSettings({
        providers: [createTestProvider({ id: 'openai', name: 'OpenAI' })],
        defaultProviderId: 'openai',
        theme: 'light',
        language: 'en',
        dataPath: '/imported/path',
        autoBackup: false,
      });

      store.getState().importSettings(settings);

      expect(store.getState().providers).toHaveLength(1);
      expect(store.getState().theme).toBe('light');
      expect(store.getState().language).toBe('en');
    });
  });

  describe('Reset Settings', () => {
    it('should reset to default settings', () => {
      store.getState().addProvider(createTestProvider({ id: 'anthropic' }));
      store.getState().setTheme('dark');

      store.getState().resetToDefaults();

      expect(store.getState().providers).toHaveLength(0);
      expect(store.getState().theme).toBe('dark');
    });
  });
});
