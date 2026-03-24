/**
 * Settings 设置页面
 *
 * 管理应用设置：LLM Provider、主题、语言、数据存储等
 */

import { useState, useRef } from 'react';
import { useSettingsStore } from '@infrastructure/stores/settings.store';
import type { LLMProvider, Theme, Language } from '@infrastructure/stores/settings.store';

interface ProviderFormData {
  id: string;
  name: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  enabled: boolean;
}

const defaultProviderForm: ProviderFormData = {
  id: '',
  name: '',
  apiKey: '',
  baseUrl: '',
  model: '',
  enabled: true,
};

export function Settings() {
  const {
    providers,
    defaultProviderId,
    theme,
    language,
    dataPath,
    autoBackup,
    addProvider,
    updateProvider,
    removeProvider,
    setDefaultProvider,
    setTheme,
    toggleTheme,
    setLanguage,
    setDataPath,
    setAutoBackup,
    exportSettings,
    importSettings,
    resetToDefaults,
  } = useSettingsStore();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<LLMProvider | null>(null);
  const [formData, setFormData] = useState<ProviderFormData>(defaultProviderForm);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 打开添加对话框
  const handleAddClick = () => {
    setFormData(defaultProviderForm);
    setEditingProvider(null);
    setShowAddDialog(true);
  };

  // 打开编辑对话框
  const handleEditClick = (provider: LLMProvider) => {
    setFormData({
      id: provider.id,
      name: provider.name,
      apiKey: provider.apiKey,
      baseUrl: provider.baseUrl || '',
      model: provider.model || '',
      enabled: provider.enabled,
    });
    setEditingProvider(provider);
    setShowAddDialog(true);
  };

  // 保存 Provider
  const handleSaveProvider = () => {
    if (!formData.name || !formData.apiKey) return;

    const providerData: LLMProvider = {
      id: formData.id || `provider-${Date.now()}`,
      name: formData.name,
      apiKey: formData.apiKey,
      baseUrl: formData.baseUrl || undefined,
      model: formData.model || undefined,
      enabled: formData.enabled,
    };

    if (editingProvider) {
      updateProvider(editingProvider.id, providerData);
    } else {
      addProvider(providerData);
    }

    setShowAddDialog(false);
    setFormData(defaultProviderForm);
    setEditingProvider(null);
  };

  // 删除 Provider
  const handleDeleteProvider = (id: string) => {
    if (confirm('确定要删除这个 Provider 吗？')) {
      removeProvider(id);
    }
  };

  // 设置默认 Provider
  const handleSetDefault = (id: string) => {
    setDefaultProvider(id);
  };

  // 导出设置
  const handleExport = () => {
    const settings = exportSettings();
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `multi-agent-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入设置
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        importSettings(settings);
        alert('设置导入成功');
      } catch (error) {
        alert('导入失败：文件格式错误');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // 重置设置
  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    resetToDefaults();
    setShowResetConfirm(false);
  };

  return (
    <div className="h-full bg-slate-900 text-slate-100 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">设置</h1>
        </div>

        {/* LLM Provider 配置 */}
        <section className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">LLM Provider 配置</h2>
            <button
              onClick={handleAddClick}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors"
            >
              添加 Provider
            </button>
          </div>

          <div className="space-y-3">
            {providers.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                暂无 Provider，点击上方按钮添加
              </p>
            ) : (
              providers.map((provider) => (
                <div
                  key={provider.id}
                  className={`bg-slate-700 rounded-lg p-4 flex items-center justify-between ${
                    defaultProviderId === provider.id ? 'ring-2 ring-cyan-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        provider.enabled ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{provider.name}</span>
                        {defaultProviderId === provider.id && (
                          <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                            默认
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">
                        {provider.baseUrl || '默认 Base URL'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {defaultProviderId !== provider.id && (
                      <button
                        onClick={() => handleSetDefault(provider.id)}
                        className="px-3 py-1 text-sm bg-slate-600 hover:bg-slate-500 rounded transition-colors"
                      >
                        设为默认
                      </button>
                    )}
                    <button
                      onClick={() => handleEditClick(provider)}
                      className="px-3 py-1 text-sm bg-slate-600 hover:bg-slate-500 rounded transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteProvider(provider.id)}
                      className="px-3 py-1 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 主题设置 */}
        <section className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">主题设置</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">深色模式</p>
              <p className="text-sm text-slate-400">切换应用的主题模式</p>
            </div>
            <button
              data-testid="theme-toggle"
              onClick={toggleTheme}
              className={`w-14 h-7 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-cyan-600' : 'bg-slate-600'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </section>

        {/* 语言设置 */}
        <section className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">语言设置</h2>
          <div className="flex items-center gap-4">
            <label htmlFor="language" className="text-slate-400">
              语言
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="zh">简体中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </section>

        {/* 数据存储设置 */}
        <section className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">数据存储</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="dataPath" className="block text-slate-400 mb-2">
                数据存储路径
              </label>
              <input
                id="dataPath"
                type="text"
                value={dataPath}
                onChange={(e) => setDataPath(e.target.value)}
                placeholder="默认路径"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">自动备份</p>
                <p className="text-sm text-slate-400">定期自动备份数据</p>
              </div>
              <button
                aria-label="自动备份"
                onClick={() => setAutoBackup(!autoBackup)}
                className={`w-14 h-7 rounded-full transition-colors ${
                  autoBackup ? 'bg-cyan-600' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    autoBackup ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* 导入导出 */}
        <section className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">设置导入/导出</h2>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              导出设置
            </button>
            <button
              onClick={handleImportClick}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              导入设置
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </section>

        {/* 重置设置 */}
        <section className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">重置设置</h2>
          <p className="text-slate-400 mb-4">
            将所有设置恢复为默认值，此操作不可撤销。
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
          >
            重置为默认
          </button>
        </section>
      </div>

      {/* 添加/编辑 Provider 对话框 */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingProvider ? '编辑 Provider' : '添加 LLM Provider'}
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm text-slate-400 mb-1">
                  名称
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如: OpenAI"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label htmlFor="apiKey" className="block text-sm text-slate-400 mb-1">
                  API Key
                </label>
                <input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="输入 API Key"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label htmlFor="baseUrl" className="block text-sm text-slate-400 mb-1">
                  Base URL
                </label>
                <input
                  id="baseUrl"
                  type="text"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  placeholder="可选，例如: https://api.openai.com"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label htmlFor="model" className="block text-sm text-slate-400 mb-1">
                  默认模型
                </label>
                <input
                  id="model"
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="可选，例如: gpt-4"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="enabled"
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600"
                />
                <label htmlFor="enabled">启用</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddDialog(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveProvider}
                disabled={!formData.name || !formData.apiKey}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 重置确认对话框 */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">确认重置</h3>
            <p className="text-slate-400 mb-6">
              确定要将所有设置恢复为默认值吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmReset}
                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
