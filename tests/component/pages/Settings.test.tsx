import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Settings } from '@presentation/pages/Settings';
import * as settingsStore from '@infrastructure/stores/settings.store';
import { createSettingsStoreMock, setupGlobalMocks, clearAllMocks } from '../../__helpers__/test-mocks';
import { createTestProvider } from '../../__helpers__/test-factory';

// Setup global mocks
setupGlobalMocks({ url: true, confirm: true });

// Mock settings store
vi.mock('@infrastructure/stores/settings.store', () => ({
  useSettingsStore: vi.fn(),
  createSettingsStore: vi.fn(),
}));

describe('Settings Page', () => {
  const mockStore = createSettingsStoreMock();

  beforeEach(() => {
    clearAllMocks();
    vi.mocked(settingsStore.useSettingsStore).mockReturnValue(mockStore);
  });

  describe('rendering', () => {
    it('renders settings page title', () => {
      render(<Settings />);
      expect(screen.getByText('设置')).toBeInTheDocument();
    });

    it('renders LLM Provider configuration section', () => {
      render(<Settings />);
      expect(screen.getByText('LLM Provider 配置')).toBeInTheDocument();
    });

    it('renders theme settings section', () => {
      render(<Settings />);
      expect(screen.getByText('主题设置')).toBeInTheDocument();
    });

    it('renders language settings section', () => {
      render(<Settings />);
      expect(screen.getByText('语言设置')).toBeInTheDocument();
    });

    it('renders data storage section', () => {
      render(<Settings />);
      expect(screen.getByText('数据存储')).toBeInTheDocument();
    });
  });

  describe('LLM Provider configuration', () => {
    it('displays add Provider button', () => {
      render(<Settings />);
      expect(screen.getByText('添加 Provider')).toBeInTheDocument();
    });

    it('displays Provider list', () => {
      const storeWithProviders = createSettingsStoreMock({
        providers: [createTestProvider({ id: 'anthropic', name: 'Anthropic' })],
      });
      vi.mocked(settingsStore.useSettingsStore).mockReturnValue(storeWithProviders);

      render(<Settings />);
      expect(screen.getByText('Anthropic')).toBeInTheDocument();
    });

    it('opens add dialog when clicking add button', () => {
      render(<Settings />);
      fireEvent.click(screen.getByText('添加 Provider'));
      expect(screen.getByText('添加 LLM Provider')).toBeInTheDocument();
    });
  });

  describe('theme settings', () => {
    it('displays current theme', () => {
      render(<Settings />);
      expect(screen.getByText('深色模式')).toBeInTheDocument();
    });

    it('calls toggleTheme when clicking theme toggle', () => {
      render(<Settings />);
      const themeToggle = screen.getByTestId('theme-toggle');
      fireEvent.click(themeToggle);
      expect(mockStore.toggleTheme).toHaveBeenCalled();
    });
  });

  describe('import/export', () => {
    it('displays export settings button', () => {
      render(<Settings />);
      expect(screen.getByText('导出设置')).toBeInTheDocument();
    });

    it('displays import settings button', () => {
      render(<Settings />);
      expect(screen.getByText('导入设置')).toBeInTheDocument();
    });

    it('calls exportSettings when clicking export', () => {
      render(<Settings />);
      fireEvent.click(screen.getByText('导出设置'));
      expect(mockStore.exportSettings).toHaveBeenCalled();
    });
  });

  describe('reset settings', () => {
    it('displays reset button', () => {
      render(<Settings />);
      expect(screen.getByText('重置为默认')).toBeInTheDocument();
    });

    it('shows confirmation dialog when clicking reset', () => {
      render(<Settings />);
      fireEvent.click(screen.getByText('重置为默认'));
      expect(screen.getByText('确认重置')).toBeInTheDocument();
    });

    it('calls resetToDefaults when confirming reset', async () => {
      render(<Settings />);
      fireEvent.click(screen.getByText('重置为默认'));
      fireEvent.click(screen.getByText('确认'));

      await waitFor(() => {
        expect(mockStore.resetToDefaults).toHaveBeenCalled();
      });
    });
  });
});
