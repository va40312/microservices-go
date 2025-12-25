import React, { useEffect, useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { ContentItem, SystemMetrics } from '../types';
import { fetchDashboardContent, fetchSystemMetrics } from '../services/api';
import { Database, Activity, Flame, ArrowUpRight, ChevronRight } from 'lucide-react';

interface DashboardViewProps {
  onVideoClick: (video: ContentItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onVideoClick }) => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [hotTrends, setHotTrends] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [m, c] = await Promise.all([fetchSystemMetrics(), fetchDashboardContent()]);
        setMetrics(m);
        setHotTrends(c.sort((a, b) => b.viralityScore - a.viralityScore).slice(0, 8));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <p className="text-zinc-500 text-sm animate-pulse font-mono uppercase tracking-widest text-center">Synchronizing Nodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="h-32">
          <div className="flex flex-col justify-between h-full p-6">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                <Database size={22} />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Total Assets</span>
                <p className="text-[11px] text-green-400 flex items-center justify-end gap-1 mt-1 font-bold">
                  <ArrowUpRight size={14} /> +12.4%
                </p>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-white tracking-tighter">{metrics.totalVideosStored.toLocaleString()}</h3>
              <span className="text-[10px] text-zinc-500 font-mono uppercase">Stored_Videos</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="h-32">
          <div className="flex flex-col justify-between h-full p-6">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <Activity size={22} />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Cluster Node</span>
                <div className="flex items-center gap-2 mt-1 justify-end">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono">Online</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">System Synchronized</h3>
              <p className="text-[10px] text-zinc-500 mt-1 uppercase font-mono">Stream status: Nominal</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Viral Velocity Table */}
      <div className="w-full">
        <GlassCard className="p-0 border-indigo-500/10 shadow-2xl">
          <div className="p-6 border-b border-white/5 bg-gradient-to-r from-orange-500/5 via-transparent to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500 border border-orange-500/20">
                <Flame size={20} fill="currentColor" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Viral Velocity Leaderboard</h3>
                <p className="text-[11px] text-zinc-500">Highest performance index across all tracked channels</p>
              </div>
            </div>
          </div>
          
          {/* Table Container - Horizontal scroll ONLY if table is too wide */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Rank</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Details</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest hidden sm:table-cell">Platform</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Virality</th>
                  <th className="px-6 py-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {hotTrends.map((item, i) => (
                  <tr 
                    key={item.id} 
                    onClick={() => onVideoClick(item)}
                    className="hover:bg-indigo-500/[0.03] transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-5">
                      <span className={`text-xl font-mono font-bold ${i < 3 ? 'text-indigo-400' : 'text-zinc-600'}`}>
                        {(i + 1).toString().padStart(2, '0')}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <img src={item.thumbnail} className="w-14 h-14 rounded-xl object-cover border border-white/10 shadow-lg shrink-0" alt="" />
                        <div className="min-w-0 max-w-[320px]">
                          <h4 className="text-sm font-bold text-zinc-200 truncate group-hover:text-white transition-colors">{item.title}</h4>
                          <p className="text-xs text-zinc-500 mt-0.5">@{item.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden sm:table-cell">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${
                        item.platform === 'TikTok' ? 'border-pink-500/20 text-pink-400 bg-pink-500/10' : 'border-red-500/20 text-red-400 bg-red-500/10'
                      }`}>
                        {item.platform}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-sm font-mono font-black text-orange-400">{item.viralityScore}%</span>
                    </td>
                    <td className="px-6 py-5 text-zinc-700 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1">
                      <ChevronRight size={20} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};