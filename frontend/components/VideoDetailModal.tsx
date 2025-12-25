import React from 'react';
import { ContentItem } from '../types';
import { GlassCard } from './ui/GlassCard';
import { X, Heart, MessageCircle, Share2, Eye, ExternalLink, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface VideoDetailModalProps {
  video: ContentItem | null;
  onClose: () => void;
}

export const VideoDetailModal: React.FC<VideoDetailModalProps> = ({ video, onClose }) => {
  if (!video) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh] animate-in zoom-in-95 duration-200">
        
        {/* Close Button Mobile */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full text-white md:hidden"
        >
          <X size={20} />
        </button>

        {/* Left Column: Preview & Basic Info */}
        <div className="w-full md:w-1/3 bg-zinc-900/50 p-6 flex flex-col border-r border-white/5 overflow-y-auto custom-scrollbar">
          <div className="aspect-video w-full bg-black rounded-lg overflow-hidden mb-6 relative group shadow-lg shadow-indigo-500/5 border border-white/5">
            <img 
              src={video.thumbnail} 
              alt={video.title} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <a href={video.url} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium text-white transition-colors flex items-center gap-2 border border-white/10">
                Open Original <ExternalLink size={14} />
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${video.platform === 'TikTok' ? 'bg-pink-500/10 border-pink-500/20 text-pink-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  {video.platform}
                </span>
                <span className="text-zinc-500 text-xs flex items-center gap-1">
                  <Calendar size={12} /> {new Date(video.publishedAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white leading-tight">{video.title}</h2>
              <p className="text-indigo-400 font-medium mt-1 text-sm">@{video.author}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1 uppercase tracking-wider font-semibold">
                  <Heart size={12} /> Likes
                </div>
                <div className="text-lg font-mono font-semibold text-zinc-200">{video.likes.toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1 uppercase tracking-wider font-semibold">
                  <Eye size={12} /> Views
                </div>
                <div className="text-lg font-mono font-semibold text-zinc-200">{video.views.toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1 uppercase tracking-wider font-semibold">
                  <MessageCircle size={12} /> Comments
                </div>
                <div className="text-lg font-mono font-semibold text-zinc-200">{video.comments.toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1 uppercase tracking-wider font-semibold">
                  <Share2 size={12} /> Shares
                </div>
                <div className="text-lg font-mono font-semibold text-zinc-200">{video.shares.toLocaleString()}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
               <h4 className="text-[10px] font-bold uppercase text-zinc-500 mb-3 tracking-wider">Analysis Tags</h4>
               <div className="flex flex-wrap gap-2">
                 {video.tags.map(tag => (
                   <span key={tag} className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 hover:border-white/20 transition-colors cursor-default">#{tag}</span>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Historical Data Chart */}
        <div className="flex-1 p-8 bg-[#09090b] relative flex flex-col">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors hidden md:block"
          >
            <X size={20} />
          </button>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-2">Growth Trajectory</h3>
            <p className="text-zinc-500 text-sm">Historical performance since first parse. Use this to identify viral spikes.</p>
          </div>

          <div className="flex-1 min-h-[300px] w-full outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={video.history}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#52525b" 
                  tick={{fontSize: 12, fill: '#71717a'}} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => val.substring(5)} // Show MM-DD
                  dy={10}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#6366f1" 
                  tick={{fontSize: 12, fill: '#71717a'}} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  label={{ value: 'Views', angle: -90, position: 'insideLeft', fill: '#6366f1', fontSize: 10 }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#10b981"
                  tick={{fontSize: 12, fill: '#71717a'}} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  label={{ value: 'Likes', angle: 90, position: 'insideRight', fill: '#10b981', fontSize: 10 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
                  itemStyle={{ fontSize: '12px' }}
                  labelStyle={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px' }}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="views" 
                  name="Views"
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="likes" 
                  name="Likes"
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorEngagement)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};