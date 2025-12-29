
import React, { useEffect, useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { ContentItem, DashboardData } from '../types';
import { fetchDashboardData } from '../services/api';
import { Database, Activity, Flame, ChevronRight } from 'lucide-react';

interface DashboardViewProps {
  onVideoClick: (video: ContentItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onVideoClick }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'nominal' || s === 'ok') return { 
      text: 'text-emerald-400', 
      bg: 'bg-emerald-500/10', 
      border: 'border-emerald-500/20', 
      dot: 'bg-emerald-500', 
      ping: 'bg-emerald-400' 
    };
    if (s === 'warning') return { 
      text: 'text-amber-400', 
      bg: 'bg-amber-500/10', 
      border: 'border-amber-500/20', 
      dot: 'bg-amber-500', 
      ping: 'bg-amber-400' 
    };
    return { 
      text: 'text-rose-400', 
      bg: 'bg-rose-500/10', 
      border: 'border-rose-500/20', 
      dot: 'bg-rose-500', 
      ping: 'bg-rose-400' 
    };
  };

  if (loading || !data) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const statusStyle = getStatusColor(data.systemStatus);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="h-28">
          <div className="flex flex-col justify-between h-full p-5">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                <Database size={18} />
              </div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Database Items</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-white tracking-tighter">{data.totalAssets.toLocaleString()}</h3>
              <span className="text-[9px] text-zinc-600 font-mono uppercase">Indexed</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="h-28">
          <div className="flex flex-col justify-between h-full p-5">
            <div className="flex justify-between items-start">
              <div className={`p-2 ${statusStyle.bg} rounded-lg ${statusStyle.text} border ${statusStyle.border}`}>
                <Activity size={18} />
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusStyle.ping} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${statusStyle.dot}`}></span>
                </span>
                <span className={`text-[9px] font-bold ${statusStyle.text} uppercase font-mono`}>{data.systemStatus}</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">System Status</h3>
              <p className="text-[9px] text-zinc-600 uppercase font-mono">Real-time telemetry</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Leaderboard Section */}
      <GlassCard className="p-0 border-indigo-500/10">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
          <Flame size={18} className="text-orange-500" />
          <h3 className="text-md font-bold text-white">Viral Velocity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.01] border-b border-white/5">
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Rank</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Title</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Platform</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Velocity</th>
                <th className="px-6 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.leaderboard.map((item, i) => (
                <tr 
                  key={item.id} 
                  onClick={() => onVideoClick(item)} 
                  className="hover:bg-indigo-500/[0.03] cursor-pointer group transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-indigo-400/80 font-bold text-sm">
                    {(i + 1).toString().padStart(2, '0')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={item.thumbnail} className="w-10 h-6 rounded object-cover border border-white/5 shadow-sm" alt="" />
                      <span className="text-xs font-medium text-zinc-200 truncate max-w-[200px] sm:max-w-xs">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
                      {item.platform}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-orange-400/90 font-bold text-sm">
                    {item.viralityScore}%
                  </td>
                  <td className="px-6 py-4 text-zinc-700 group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5">
                    <ChevronRight size={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
