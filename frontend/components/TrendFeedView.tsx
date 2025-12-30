
import React, { useState, useEffect } from 'react';
import { ContentItem, Platform } from '../types';
import { fetchTrendingVideos } from '../services/api';
import { GlassCard } from './ui/GlassCard';
import { ChevronRight, LayoutGrid, Table as TableIcon, BarChart2, Filter, SortDesc, ChevronLeft } from 'lucide-react';

interface TrendFeedProps {
  onVideoClick: (video: ContentItem) => void;
}

export const TrendFeedView: React.FC<TrendFeedProps> = ({ onVideoClick }) => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  
  const [platformFilter, setPlatformFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [page, setPage] = useState(1);

  const loadData = () => {
    setLoading(true);

    let platformParam: string | null = null;
    if (platformFilter !== 'All') {
      platformParam = platformFilter.split(' ')[0].toLowerCase();
    }

    fetchTrendingVideos(sortBy, platformParam, page)
      .then((newItems) => {
        setItems(newItems);
      })
      .catch(err => console.error("Failed to fetch trending:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [platformFilter, sortBy, page]);

  useEffect(() => {
    setPage(1);
  }, [platformFilter, sortBy]);

  if (loading && items.length === 0) return (
    <div className="flex flex-col justify-center items-center h-[50vh] gap-4">
      <div className="animate-spin h-8 w-8 border-b-2 border-indigo-500 rounded-full"></div>
      <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Fetching Trends...</span>
    </div>
  );

  return (
    <div className="flex flex-col space-y-4">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5 backdrop-blur-md shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none group-focus-within:text-indigo-400 transition-colors">
              <Filter size={14} />
            </div>
            <select 
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="bg-zinc-900/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-zinc-300 focus:outline-none focus:border-indigo-500/50 appearance-none hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <option value="All">All Platforms</option>
              <option value={Platform.TIKTOK}>TikTok Only</option>
              <option value={Platform.YOUTUBE}>YouTube Only</option>
              <option value={Platform.INSTAGRAM}>Instagram</option>
            </select>
          </div>

          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none group-focus-within:text-indigo-400 transition-colors">
              <SortDesc size={14} />
            </div>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-900/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-zinc-300 focus:outline-none focus:border-indigo-500/50 appearance-none hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="most_viewed">Most Viewed</option>
              <option value="virality">Viral Potential</option>
            </select>
          </div>
          
          {loading && <div className="animate-spin h-4 w-4 border-b-2 border-indigo-500 rounded-full ml-2"></div>}
        </div>
        
        <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
           <button 
             onClick={() => setViewMode('table')}
             className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-zinc-500'}`}
           >
             <TableIcon size={18} />
           </button>
           <button 
             onClick={() => setViewMode('grid')}
             className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-zinc-500'}`}
           >
             <LayoutGrid size={18} />
           </button>
        </div>
      </div>

      {/* Content Container - No fixed height, grows with content */}
      <div className={`min-h-[200px] ${loading ? 'opacity-50' : ''}`}>
        {items.length === 0 ? (
          <GlassCard className="py-20 text-center text-zinc-500 italic">No items found.</GlassCard>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <GlassCard key={item.id} hoverEffect onClick={() => onVideoClick(item)} className="h-full">
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-800 rounded-t-2xl">
                  <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 text-[10px] font-bold text-white uppercase">{item.platform}</div>
                </div>
                <div className="p-4 flex flex-col justify-between h-[120px]">
                  <h3 className="font-semibold text-zinc-100 line-clamp-2 text-sm">{item.title}</h3>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-xs font-mono text-zinc-400">{(item.views / 1000).toFixed(1)}k views</span>
                    <span className="text-[10px] font-bold text-indigo-400">{item.viralityScore}%</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Asset</th>
                    <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Views</th>
                    <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Viral Score</th>
                    <th className="p-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {items.map((item) => (
                    <tr key={item.id} onClick={() => onVideoClick(item)} className="hover:bg-white/[0.02] cursor-pointer group transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={item.thumbnail} className="w-14 h-9 rounded-lg object-cover" alt="" />
                          <div>
                            <div className="font-bold text-sm text-zinc-200 truncate max-w-xs">{item.title}</div>
                            <div className="text-[9px] font-black text-indigo-500 uppercase">{item.platform}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-zinc-300 font-mono text-right">{(item.views / 1000).toFixed(1)}k</td>
                      <td className="p-4 text-center">
                        <span className="text-xs font-bold text-zinc-400 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                          {item.viralityScore}%
                        </span>
                      </td>
                      <td className="p-4 text-zinc-700 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1">
                        <ChevronRight size={18} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Pagination UI - Immediately after the content */}
      {items.length > 0 && (
        <div className="flex justify-center items-center gap-6 py-4">
          <button 
            disabled={page === 1 || loading}
            onClick={() => setPage(p => p - 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs font-bold text-zinc-400 hover:text-white disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase">Page</span>
            <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-mono text-sm shadow-lg">{page}</span>
          </div>

          <button 
            disabled={items.length < 20 || loading}
            onClick={() => setPage(p => p + 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs font-bold text-zinc-400 hover:text-white disabled:opacity-30 transition-all"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
