
import React, { useEffect, useState } from 'react';
import { ContentItem, HistoryPoint } from '../types';
import { fetchVideoTrajectory } from '../services/api';
import { X, Heart, MessageCircle, Share2, Eye, ExternalLink, Loader2, Activity, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface VideoDetailModalProps {
  video: ContentItem | null;
  onClose: () => void;
}

export const VideoDetailModal: React.FC<VideoDetailModalProps> = ({ video, onClose }) => {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (video) {
      setHistory([]);
      setLoadingHistory(true);
      fetchVideoTrajectory(video.id)
        .then(setHistory)
        .catch(console.error)
        .finally(() => setLoadingHistory(false));
    }
  }, [video]);

  if (!video) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-5xl bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Left Column */}
        <div className="w-full md:w-1/3 bg-zinc-900/50 p-6 flex flex-col border-r border-white/5 overflow-y-auto">
          <div className="aspect-video w-full bg-black rounded-lg overflow-hidden mb-6 relative group border border-white/5 shadow-lg shrink-0">
            <img src={video.thumbnail} alt="" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <a href={video.url} target="_blank" rel="noreferrer" className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-[10px] text-white flex items-center gap-2 border border-white/10 uppercase font-bold tracking-widest">
                Source <ExternalLink size={10} />
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">
                  {video.platform}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white leading-tight">{video.title}</h2>
              <p className="text-zinc-500 text-sm mt-2 font-medium">@{video.author}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Likes', val: video.likes, icon: Heart, color: 'text-rose-400' },
                { label: 'Views', val: video.views, icon: Eye, color: 'text-blue-400' },
                { label: 'Comments', val: video.comments, icon: MessageCircle, color: 'text-indigo-400' },
                { label: 'Shares', val: video.shares, icon: Share2, color: 'text-emerald-400' }
              ].map(stat => (
                <div key={stat.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase font-bold mb-1.5">
                    <stat.icon size={12} className={stat.color} /> {stat.label}
                  </div>
                  <div className="text-sm font-mono text-zinc-200 font-bold">{stat.val.toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Viral Score</span>
                <span className="text-sm font-mono font-bold text-indigo-400">{video.viralityScore}%</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${video.viralityScore}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Chart) */}
        <div className="flex-1 p-8 bg-[#09090b] relative flex flex-col">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-white">Engagement Trajectory</h3>
            <p className="text-zinc-500 text-sm mt-1">Growth snapshot analytics.</p>
          </div>

          <div className="flex-1 min-h-0 flex items-center justify-center">
            {loadingHistory ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Fetching Stats...</span>
              </div>
            ) : history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorViewsModal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="#3f3f46" 
                    tick={{fontSize: 10, fill: '#71717a'}} 
                    tickFormatter={(val) => {
                      const date = new Date(val);
                      return `${date.getDate()}/${date.getMonth()+1}`;
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#3f3f46" 
                    tick={{fontSize: 10, fill: '#71717a'}} 
                    tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px'}} 
                    itemStyle={{color: '#e4e4e7', fontSize: '12px'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    fill="url(#colorViewsModal)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center opacity-40">
                <Activity size={32} className="mx-auto mb-4" />
                <p className="text-xs font-mono uppercase tracking-widest">No telemetry data</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-widest">Status</div>
              <div className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-widest">Published</div>
              <div className="text-sm font-bold text-white flex items-center justify-center gap-2">
                <Calendar size={14} className="text-zinc-500" />
                {new Date(video.publishedAt).toLocaleDateString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-widest">Engagement</div>
              <div className="text-sm font-bold text-white font-mono">{video.engagementRate}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
