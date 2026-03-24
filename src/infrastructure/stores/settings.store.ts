/**
 * Settings Store
 *
 * 管理应用设置：LLM Provider、主题、语言等
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * LLM Provider 配置
 */
export interface LLMProvider {
  id: string;
  name: string;
  apiKey: string;
  baseUrl?: string;
  model?: string;
  enabled: boolean;
}

/**
 * 主题类型
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * 语言类型
 */
export type Language = 'zh' | 'en';

/**
 * 应用设置
 */
export interface Settings {
  providers: LLMProvider[];
  defaultProviderId: string | null;
  theme: Theme;
  language: Language;
  dataPath: string;
  autoBackup: boolean;
}

/**
 * Settings Store 状态
 */
interface SettingsState extends Settings {
  // Actions
  addProvider: (provider: LLMProvider) => void;
  updateProvider: (id: string, updates: Partial<LLMProvider>) => void;
  removeProvider: (id: string) => void;
  setDefaultProvider: (id: string) => void;
  validateProvider: (id: string) => boolean;

  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  setLanguage: (language: Language) => void;

  setDataPath: (path: string) => void;
  setAutoBackup: (enabled: boolean) => void;

  exportSettings: () => Settings;
  importSettings: (settings: Settings) => void;
  resetToDefaults: () => void;
}

/**
 * 默认设置
 */
const defaultSettings: Settings = {
  providers: [],
  defaultProviderId: null,
  theme: 'dark',
  language: 'zh',
  dataPath: '',
  autoBackup: false,
};

/**
 * 创建 Settings Store
 */
export const createSettingsStore = () => {
  return create<SettingsState>()(
    persist(
      (set, get) => ({
        ...defaultSettings,

        // LLM Provider 管理
        addProvider: (provider) => {
          set((state) => ({
            providers: [...state.providers, provider],
            // 第一个Provider设为默认
            defaultProviderId: state.defaultProviderId || provider.id,
          }));
        },

        updateProvider: (id, updates) => {
          set((state) => ({
            providers: state.providers.map((p) =>
              p.id === id ? { ...p, ...updates } : p
            ),
          }));
        },

        removeProvider: (id) => {
          set((state) => {
            const newProviders = state.providers.filter((p) => p.id !== id);
            return {
              providers: newProviders,
              defaultProviderId:
                state.defaultProviderId === id
                  ? newProviders[0]?.id || null
                  : state.defaultProviderId,
            };
          });
        },

        setDefaultProvider: (id) => {
          set({ defaultProviderId: id });
        },

        validateProvider: (id) => {
          const provider = get().providers.find((p) => p.id === id);
          if (!provider) return false;
          return provider.apiKey.trim().length > 0 && provider.enabled;
        },

        // 主题管理
        setTheme: (theme) => {
          set({ theme });
        },

        toggleTheme: () => {
          set((state) => ({
            theme: state.theme === 'dark' ? 'light' : 'dark',
          }));
        },

        // 语言管理
        setLanguage: (language) => {
          set({ language });
        },

        // 数据存储管理
        setDataPath: (path) => {
          set({ dataPath: path });
        },

        setAutoBackup: (enabled) => {
          set({ autoBackup: enabled });
        },

        // 导入导出
        exportSettings: () => {
          const state = get();
          return {
            providers: state.providers,
            defaultProviderId: state.defaultProviderId,
            theme: state.theme,
            language: state.language,
            dataPath: state.dataPath,
            autoBackup: state.autoBackup,
          };
        },

        importSettings: (settings) => {
          set({
            providers: settings.providers,
            defaultProviderId: settings.defaultProviderId,
            theme: settings.theme,
            language: settings.language,
            dataPath: settings.dataPath,
            autoBackup: settings.autoBackup,
          });
        },

        // 重置
        resetToDefaults: () => {
          set({ ...defaultSettings });
        },
      }),
      {
        name: 'multi-agent-settings',
      }
    )
  );
};

/**
 * 全局 Settings Store 实例
 */
export const useSettingsStore = createSettingsStore();
