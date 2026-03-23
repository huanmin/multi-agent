import React from 'react'
import { Layout } from '../components/Layout'
import { StatCard } from '../components/StatCard'

export const Dashboard: React.FC = () => {
  return (
    <Layout>
      <div className="p-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">仪表盘</h1>
          <p className="text-gray-400">系统概览与统计</p>
        </header>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard title="专家数量" value="6" icon="👥" />
          <StatCard title="对话数量" value="3" icon="💬" />
          <StatCard title="消息总数" value="42" icon="📨" />
          <StatCard title="系统状态" value="运行中" icon="⚡" status="online" />
        </div>

      </div>
    </Layout>
  )
}
