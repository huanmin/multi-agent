/**
 * ExpertUsageChart 组件
 *
 * 专家使用分布饼图
 */

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ExpertUsageData {
  name: string;
  requests: number;
  color: string;
}

interface ExpertUsageChartProps {
  data: ExpertUsageData[];
  title?: string;
}

export const ExpertUsageChart: React.FC<ExpertUsageChartProps> = ({ data, title }) => {
  if (data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 h-64 flex items-center justify-center">
        {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
        <p className="text-gray-400">暂无数据</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="requests"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '6px',
              }}
              labelStyle={{ color: '#f3f4f6' }}
              itemStyle={{ color: '#f3f4f6' }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ color: '#9ca3af' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
