import React, { useState, useEffect } from 'react';
import { ContentItem } from '../types';
import { fetchDashboardContent } from '../services/api';
import { GlassCard } from './ui/GlassCard';
import { Search, Filter, ArrowUpDown, MoreHorizontal, LayoutGrid, Table as TableIcon, ChevronRight } from 'lucide-react';

interface TrendFeedProps {
  onVideoClick: (video: ContentItem) => void;
}

export const TrendFeedView: React.FC<TrendFeedProps> = ({ onVideoClick }) => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'viralityScore' | 'publishedAt' | 'views'>('viralityScore');

  useEffect(() => {
    fetchDashboardContent().then(setItems);
  }, []);

  const filteredItems = items
    .filter(item => item.title.toLowerCase().includes(search.toLowerCase()) || item.author.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'publishedAt') return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      return b[sortBy] - a[sortBy];
    });

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <GlassCard className="p-4 flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search assets..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/20 border border-white/10 rounded-lg text-sm text-zinc-300 shrink-0">
            <Filter size={14} className="text-zinc-500" />
            <select className="bg-transparent border-none focus:ring-0 text-zinc-300 outline-none cursor-pointer text-xs font-semibold">
              <option>All Platforms</option>
              <option>TikTok</option>
              <option>YouTube</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/20 border border-white/10 rounded-lg text-sm text-zinc-300 shrink-0">
            <ArrowUpDown size={14} className="text-zinc-500" />
            <select 
              className="bg-transparent border-none focus:ring-0 text-zinc-300 outline-none cursor-pointer text-xs font-semibold"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="viralityScore">Virality Score</option>
              <option value="views">Most Viewed</option>
              <option value="publishedAt">Newest</option>
            </select>
          </div>

          <div className="flex bg-black/20 rounded-lg p-1 border border-white/10 shrink-0">
             <button 
               onClick={() => setViewMode('table')}
               className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
               <TableIcon size={16} />
             </button>
             <button 
               onClick={() => setViewMode('grid')}
               className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
               <LayoutGrid size={16} />
             </button>
          </div>
        </div>
      </GlassCard>

      {/* Content Feed */}
      {viewMode === 'table' ? (
        <GlassCard className="p-0 overflow-hidden border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-[#0f0f12]/80 border-b border-white/5">
                <tr>
                  <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Asset</th>
                  <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Author</th>
                  <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Views</th>
                  <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Virality</th>
                  <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Time</th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => onVideoClick(item)}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={item.thumbnail} className="w-12 h-8 rounded object-cover ring-1 ring-white/10" alt="" />
                        <div className="max-w-[240px]">
                          <div className="font-bold text-sm text-zinc-200 truncate group-hover:text-indigo-400 transition-colors">{item.title}</div>
                          <div className="text-[9px] font-black text-indigo-500/80 uppercase tracking-tighter">{item.platform}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-zinc-400 font-medium">@{item.author}</td>
                    <td className="p-4 text-sm text-zinc-300 font-mono text-right">{(item.views / 1000).toFixed(1)}k</td>
                    <td className="p-4 text-center">
                      <span className="text-xs font-bold text-zinc-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {item.viralityScore}%
                      </span>
                    </td>
                    <td className="p-4 text-[10px] text-zinc-500 text-right font-mono">
                      {new Date(item.parsedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="p-4 text-zinc-700 group-hover:text-indigo-400">
                      <ChevronRight size={18} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {filteredItems.map(item => (
             <GlassCard key={item.id} hoverEffect className="group h-full flex flex-col" onClick={() => onVideoClick(item)}>
               <div className="aspect-video w-full bg-zinc-800 relative overflow-hidden">
                 <img src={item.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" alt="" />
                 <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] font-black text-indigo-400 border border-indigo-500/30 backdrop-blur-sm">
                   {item.viralityScore}% VIRAL
                 </div>
               </div>
               <div className="p-4 flex-1 flex flex-col justify-between">
                 <h4 className="text-sm font-bold text-white line-clamp-2 group-hover:text-indigo-400 transition-colors leading-tight">{item.title}</h4>
                 <div className="flex justify-between items-center mt-4">
                   <span className="text-xs font-semibold text-zinc-500">@{item.author}</span>
                   <span className="text-[10px] font-mono text-zinc-600">{(item.views/1000).toFixed(1)}k Views</span>
                 </div>
               </div>
             </GlassCard>
           ))}
        </div>
      )}
    </div>
  );
};