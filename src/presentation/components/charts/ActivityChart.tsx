/**
 * ActivityChart 组件
 *
 * 活动时间线折线图
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ActivityChartProps {
  data: Array<{ hour: number; count: number }>;
  title?: string;
}

/**
 * 格式化小时为时间字符串
 */
const formatHour = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

export const ActivityChart: React.FC<ActivityChartProps> = ({ data, title }) => {
  if (data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 h-64 flex items-center justify-center">
        {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
        <p className="text-gray-400">暂无数据</p>
      </div>
    );
  }

  // 确保所有 24 小时都有数据
  const fullData = Array.from({ length: 24 }, (_, hour) => {
    const existing = data.find((d) => d.hour === hour);
    return { hour, count: existing?.count || 0, label: formatHour(hour) };
  });

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={fullData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickLine={{ stroke: '#4b5563' }}
              axisLine={{ stroke: '#4b5563' }}
              interval={3}
            />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickLine={{ stroke: '#4b5563' }}
              axisLine={{ stroke: '#4b5563' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '6px',
              }}
              labelStyle={{ color: '#f3f4f6' }}
              itemStyle={{ color: '#60a5fa' }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={{ fill: '#60a5fa', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
