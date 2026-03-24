import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Settings } from '@presentation/pages/Settings';
import * as settingsStore from '@infrastructure/stores/settings.store';

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(() => true),
});

// Mock settings store
vi.mock('@infrastructure/stores/settings.store', () => ({
  useSettingsStore: vi.fn(),
  createSettingsStore: vi.fn(),
}));

describe('Settings Page', () => {
  const mockStore = {
    providers: [],
    defaultProviderId: null,
    theme: 'dark',
    language: 'zh',
    dataPath: '',
    autoBackup: false,
    addProvider: vi.fn(),
    updateProvider: vi.fn(),
    removeProvider: vi.fn(),
    setDefaultProvider: vi.fn(),
    validateProvider: vi.fn(),
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
    setLanguage: vi.fn(),
    setDataPath: vi.fn(),
    setAutoBackup: vi.fn(),
    exportSettings: vi.fn(),
    importSettings: vi.fn(),
    resetToDefaults: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(settingsStore.useSettingsStore).mockReturnValue(mockStore);
  });

  describe('渲染', () => {
    it('应该渲染设置页面标题', () => {
      render(<Settings />);
      expect(screen.getByText('设置')).toBeInTheDocument();
    });

    it('应该渲染 LLM Provider 配置区域', () => {
      render(<Settings />);
      expect(screen.getByText('LLM Provider 配置')).toBeInTheDocument();
    });

    it('应该渲染主题设置区域', () => {
      render(<Settings />);
      expect(screen.getByText('主题设置')).toBeInTheDocument();
    });

    it('应该渲染语言设置区域', () => {
      render(<Settings />);
      expect(screen.getByText('语言设置')).toBeInTheDocument();
    });

    it('应该渲染数据存储设置区域', () => {
      render(<Settings />);
      expect(screen.getByText('数据存储')).toBeInTheDocument();
    });
  });

  describe('LLM Provider 配置', () => {
    it('应该显示添加 Provider 按钮', () => {
      render(<Settings />);
      expect(screen.getByText('添加 Provider')).toBeInTheDocument();
    });

    it('应该显示 Provider 列表', () => {
      const storeWithProviders = {
        ...mockStore,
        providers: [
          { id: 'anthropic', name: 'Anthropic', apiKey: 'test-key', enabled: true },
        ],
      };
      vi.mocked(settingsStore.useSettingsStore).mockReturnValue(storeWithProviders);

      render(<Settings />);
      expect(screen.getByText('Anthropic')).toBeInTheDocument();
    });

    it('点击添加按钮应该打开添加对话框', () => {
      render(<Settings />);
      fireEvent.click(screen.getByText('添加 Provider'));
      expect(screen.getByText('添加 LLM Provider')).toBeInTheDocument();
    });

    it('应该显示 Provider 表单字段', () => {
      render(<Settings />);
      fireEvent.click(screen.getByText('添加 Provider'));

      expect(screen.getByLabelText('名称')).toBeInTheDocument();
      expect(screen.getByLabelText('API Key')).toBeInTheDocument();
      expect(screen.getByLabelText('Base URL')).toBeInTheDocument();
    });

    it('提交表单应该调用 addProvider', async () => {
      render(<Settings />);
      fireEvent.click(screen.getByText('添加 Provider'));

      fireEvent.change(screen.getByLabelText('名称'), {
        target: { value: 'OpenAI' },
      });
      fireEvent.change(screen.getByLabelText('API Key'), {
        target: { value: 'sk-test' },
      });
      fireEvent.click(screen.getByText('保存'));

      await waitFor(() => {
        expect(mockStore.addProvider).toHaveBeenCalled();
      });
    });

    it('应该显示默认 Provider 标识', () => {
      const storeWithDefault = {
        ...mockStore,
        providers: [
          { id: 'anthropic', name: 'Anthropic', apiKey: 'key', enabled: true },
        ],
        defaultProviderId: 'anthropic',
      };
      vi.mocked(settingsStore.useSettingsStore).mockReturnValue(storeWithDefault);

      render(<Settings />);
      expect(screen.getByText('默认')).toBeInTheDocument();
    });

    it('点击删除应该调用 removeProvider', async () => {
      const storeWithProviders = {
        ...mockStore,
        providers: [
          { id: 'anthropic', name: 'Anthropic', apiKey: 'key', enabled: true },
        ],
      };
      vi.mocked(settingsStore.useSettingsStore).mockReturnValue(storeWithProviders);

      render(<Settings />);
      fireEvent.click(screen.getByText('删除'));

      await waitFor(() => {
        expect(mockStore.removeProvider).toHaveBeenCalledWith('anthropic');
      });
    });
  });

  describe('主题设置', () => {
    it('应该显示当前主题', () => {
      render(<Settings />);
      expect(screen.getByText('深色模式')).toBeInTheDocument();
    });

    it('点击主题切换应该调用 toggleTheme', () => {
      render(<Settings />);
      const themeToggle = screen.getByTestId('theme-toggle');
      fireEvent.click(themeToggle);
      expect(mockStore.toggleTheme).toHaveBeenCalled();
    });
  });

  describe('语言设置', () => {
    it('应该显示语言选择器', () => {
      render(<Settings />);
      expect(screen.getByLabelText('语言')).toBeInTheDocument();
    });

    it('切换语言应该调用 setLanguage', () => {
      render(<Settings />);
      const languageSelect = screen.getByLabelText('语言');
      fireEvent.change(languageSelect, { target: { value: 'en' } });
      expect(mockStore.setLanguage).toHaveBeenCalledWith('en');
    });
  });

  describe('数据存储设置', () => {
    it('应该显示数据路径输入', () => {
      render(<Settings />);
      expect(screen.getByLabelText('数据存储路径')).toBeInTheDocument();
    });

    it('应该显示自动备份开关', () => {
      render(<Settings />);
      expect(screen.getByLabelText('自动备份')).toBeInTheDocument();
    });
  });

  describe('导入导出', () => {
    it('应该显示导出设置按钮', () => {
      render(<Settings />);
      expect(screen.getByText('导出设置')).toBeInTheDocument();
    });

    it('应该显示导入设置按钮', () => {
      render(<Settings />);
      expect(screen.getByText('导入设置')).toBeInTheDocument();
    });

    it('点击导出应该调用 exportSettings', () => {
      render(<Settings />);
      fireEvent.click(screen.getByText('导出设置'));
      expect(mockStore.exportSettings).toHaveBeenCalled();
    });
  });

  describe('重置设置', () => {
    it('应该显示重置按钮', () => {
      render(<Settings />);
      expect(screen.getByText('重置为默认')).toBeInTheDocument();
    });

    it('点击重置应该显示确认对话框', () => {
      render(<Settings />);
      fireEvent.click(screen.getByText('重置为默认'));
      expect(screen.getByText('确认重置')).toBeInTheDocument();
    });

    it('确认重置应该调用 resetToDefaults', async () => {
      render(<Settings />);
      fireEvent.click(screen.getByText('重置为默认'));
      fireEvent.click(screen.getByText('确认'));

      await waitFor(() => {
        expect(mockStore.resetToDefaults).toHaveBeenCalled();
      });
    });
  });
});
