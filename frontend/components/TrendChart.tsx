import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { PlatformStats } from '../types';

interface TrendChartProps {
  stats: PlatformStats[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ stats }) => {
  // Transform data for the chart: merge histories based on timestamp
  const data = stats[0]?.trendHistory.map((point, index) => {
    const entry: any = { name: point.timestamp };
    stats.forEach(s => {
      entry[s.platform] = s.trendHistory[index]?.value || 0;
    });
    return entry;
  }) || [];

  return (
    <div className="h-[300px] w-full mt-4 outline-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTikTok" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff0050" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#ff0050" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorYouTube" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff0000" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#ff0000" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#52525b" 
            tick={{fontSize: 12, fill: '#71717a'}} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#52525b" 
            tick={{fontSize: 12, fill: '#71717a'}} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip 
            cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
            itemStyle={{ fontSize: '12px' }}
            labelStyle={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="TikTok" 
            stroke="#ff0050" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorTikTok)" 
          />
          <Area 
            type="monotone" 
            dataKey="YouTube" 
            stroke="#ef4444" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorYouTube)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};