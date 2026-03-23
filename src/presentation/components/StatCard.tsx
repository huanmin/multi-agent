import React from 'react'

interface StatCardProps {
  title: string
  value: string
  icon: string
  status?: 'online' | 'offline' | 'warning'
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, status }) => {
  const statusColors = {
    online: 'text-green-400',
    offline: 'text-gray-400',
    warning: 'text-yellow-400',
  }

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 flex items-center gap-4 hover:border-cyan-400 transition-colors">
      <div className="text-3xl w-14 h-14 bg-[#334155] rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-1">{title}</h3>
        <div className={`text-2xl font-bold ${status ? statusColors[status] : 'text-white'}`}>{value}</div>
      </div>
    </div>
  )
}
