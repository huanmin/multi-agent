import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

interface NavItem {
  key: string
  label: string
  icon: string
  path: string
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: '仪表盘', icon: '📊', path: '/dashboard' },
  { key: 'experts', label: '专家管理', icon: '👥', path: '/experts' },
  { key: 'conversations', label: '对话', icon: '💬', path: '/conversations' },
  { key: 'code-review', label: '代码审查', icon: '🔍', path: '/code-review' },
  { key: 'settings', label: '设置', icon: '⚙️', path: '/settings' },
]

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavigate = (path: string) => {
    navigate(path)
  }

  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div className="flex h-full w-full bg-[#0f172a]" data-testid="layout">
      {/* Sidebar */}
      <aside className="w-60 bg-[#1e293b] border-r border-[#334155] flex flex-col">
        <div className="p-4 border-b border-[#334155]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <span className="text-lg font-semibold text-white">Multi-Agent</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1" data-testid="nav-menu">
          {navItems.map((item) => (
            <button
              key={item.key}
              data-testid={`nav-${item.key}`}
              onClick={() => handleNavigate(item.path)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                isActive(item.path)
                  ? 'bg-cyan-400 text-[#0f172a] active'
                  : 'text-gray-400 hover:bg-[#334155] hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="ml-2">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-[#334155]">
          <div className="text-xs text-gray-500 text-center">v0.1.0</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#0f172a]" data-testid="main-content">
        {children}
      </main>
    </div>
  )
}
