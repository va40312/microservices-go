import React from 'react';
import { ContentItem, Platform } from '../types';
import { GlassCard } from './ui/GlassCard';
import { Play, Heart, BarChart2 } from 'lucide-react';

export const ContentFeed: React.FC<{ items: ContentItem[] }> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <GlassCard key={item.id} hoverEffect className="group">
          {/* Thumbnail Container */}
          <div className="relative aspect-video w-full overflow-hidden bg-zinc-800">
            <img 
              src={item.thumbnail} 
              alt={item.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
            />
            <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] uppercase font-bold tracking-wider text-white border border-white/10">
              {item.platform}
            </div>
            
            {/* Play Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Play fill="white" className="ml-1 text-white w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 space-y-3">
            <h3 className="font-medium text-zinc-100 line-clamp-2 text-sm leading-relaxed group-hover:text-indigo-400 transition-colors">
              {item.title}
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {item.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[10px] text-zinc-400 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <BarChart2 size={14} />
                <span className="text-xs font-mono">{(item.views / 1000).toFixed(1)}k</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Heart size={14} />
                <span className="text-xs font-mono">{(item.likes / 1000).toFixed(1)}k</span>
              </div>
              <div className={`
                text-xs font-bold px-2 py-0.5 rounded
                ${item.sentimentScore > 80 ? 'text-green-400 bg-green-400/10' : 
                  item.sentimentScore < 50 ? 'text-red-400 bg-red-400/10' : 'text-yellow-400 bg-yellow-400/10'}
              `}>
                {item.sentimentScore}%
              </div>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};